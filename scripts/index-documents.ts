import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config, validateConfig } from "../config/config";
import type { DocumentChunk as SharedDocumentChunk } from "@/types/types";

type DocumentChunk = SharedDocumentChunk;

class DocumentIndexer {
  private pinecone: Pinecone;
  private openai: OpenAI;

  constructor() {
    validateConfig();

    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Get a summary of the document for context
   */
  private getDocumentSummary(filename: string): string {
    const summaries: Record<string, string> = {
      "welcome.md":
        "Overview of Anara, an AI-enabled research workspace with features for finding, understanding, organizing and producing scientific content",
      "concepts.md":
        "Key concepts and terminology used in Anara including workspace, library, folders, files, agents, chat, queries, and references",
      "filetypes.md":
        "Supported file formats in Anara including documents, images, audio, video, webpages, notes, and flashcards",
    };

    return summaries[filename] || `Documentation about ${filename.replace(".md", "")}`;
  }

  /**
   * Parse markdown content using simple size-based chunking
   */
  private parseMarkdownBySemanticGroups(content: string, filename: string): DocumentChunk[] {
    const lines = content.split("\n");
    const chunks: DocumentChunk[] = [];

    // Get chunking configuration from config
    const { minChunkSize, maxChunkSize, overlapLines } = config.chunking;

    // Get document summary for enhanced context
    const documentSummary = this.getDocumentSummary(filename);

    // For small documents, consider keeping them whole
    const documentText = lines.join("\n");
    if (documentText.length <= maxChunkSize) {
      // Document is small enough to be a single chunk
      chunks.push(
        this.createEnhancedChunk(
          documentText,
          filename,
          filename.replace(".md", ""),
          "",
          0,
          documentSummary,
        ),
      );
      return chunks;
    }

    // For larger documents, chunk by size with overlap
    let currentChunk: string[] = [];
    let chunkIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      currentChunk.push(lines[i]);
      const currentText = currentChunk.join("\n");

      // Check if we've reached the maximum chunk size
      if (currentText.length > maxChunkSize) {
        // Find a good breaking point (prefer paragraph breaks)
        let breakPoint = currentChunk.length - 1;
        for (let j = currentChunk.length - 1; j > currentChunk.length / 2; j--) {
          if (currentChunk[j].trim() === "") {
            breakPoint = j;
            break;
          }
        }

        // Create chunk
        const chunkToSave = currentChunk.slice(0, breakPoint).join("\n");
        chunks.push(
          this.createEnhancedChunk(
            chunkToSave,
            filename,
            filename.replace(".md", ""),
            `Part ${chunkIndex + 1}`,
            chunkIndex++,
            documentSummary,
          ),
        );

        // Start new chunk with overlap
        const overlapStart = Math.max(0, breakPoint - overlapLines);
        currentChunk = currentChunk.slice(overlapStart);
      }
    }

    // Save the last chunk if it has content
    if (currentChunk.length > 0) {
      const currentText = currentChunk.join("\n");
      // Only create a chunk if it meets minimum size or is the only chunk
      if (currentText.length >= minChunkSize || chunks.length === 0) {
        chunks.push(
          this.createEnhancedChunk(
            currentText,
            filename,
            filename.replace(".md", ""),
            chunks.length > 0 ? `Part ${chunkIndex + 1}` : "",
            chunkIndex,
            documentSummary,
          ),
        );
      } else if (chunks.length > 0) {
        // If last chunk is too small, append it to the previous chunk
        const lastChunk = chunks[chunks.length - 1];
        const combinedText = lastChunk.text + "\n\n" + currentText;
        chunks[chunks.length - 1] = this.createEnhancedChunk(
          combinedText,
          filename,
          filename.replace(".md", ""),
          lastChunk.metadata.subsection || "",
          lastChunk.metadata.chunkIndex,
          documentSummary,
        );
      }
    }

    return chunks;
  }

  /**
   * Create an enhanced chunk with document-level context
   */
  private createEnhancedChunk(
    text: string,
    source: string,
    section: string,
    subsection: string,
    chunkIndex: number,
    documentSummary: string,
  ): DocumentChunk {
    // Clean up the text
    const cleanText = text.trim();

    // Build enhanced text with minimal but useful context
    const contextParts = [`${source.replace(".md", "")} documentation:`, documentSummary];

    if (subsection) {
      contextParts.push(`Topic: ${subsection}`);
    }

    // Combine context with actual content - keep it natural
    const enhancedText = `${contextParts.join(" ")}\n\n${cleanText}`;

    return {
      id: uuidv4(),
      text: enhancedText, // Use enhanced text for embedding generation
      metadata: {
        source,
        section,
        ...(subsection && { subsection }),
        chunkIndex,
      },
    };
  }

  /**
   * Generate embeddings for a batch of texts
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  }

  /**
   * Process all markdown files in the docs directory
   */
  async indexDocuments() {
    const docsDir = path.join(process.cwd(), "docs");

    try {
      // Read all markdown files
      const files = await fs.readdir(docsDir);
      const markdownFiles = files.filter((file) => file.endsWith(".md"));

      console.log(`Found ${markdownFiles.length} markdown files to index`);

      // Log chunking configuration
      console.log(`\n📊 Chunking Configuration:`);
      console.log(`   - Min chunk size: ${config.chunking.minChunkSize} characters`);
      console.log(`   - Max chunk size: ${config.chunking.maxChunkSize} characters`);
      console.log(`   - Overlap lines: ${config.chunking.overlapLines} lines`);
      console.log(`   - Min score threshold: ${config.retrieval.minScore}`);

      let allChunks: DocumentChunk[] = [];

      // Process each file
      for (const file of markdownFiles) {
        const filePath = path.join(docsDir, file);
        const content = await fs.readFile(filePath, "utf-8");

        console.log(`Processing ${file}...`);
        const chunks = this.parseMarkdownBySemanticGroups(content, file);
        allChunks = allChunks.concat(chunks);

        console.log(`  - Created ${chunks.length} chunks`);
      }

      console.log(`\nTotal chunks to index: ${allChunks.length}`);

      // Generate embeddings in batches
      const batchSize = 20;
      for (let i = 0; i < allChunks.length; i += batchSize) {
        const batch = allChunks.slice(i, i + batchSize);
        const texts = batch.map((chunk) => chunk.text);

        console.log(
          `Generating embeddings for chunks ${i + 1}-${Math.min(i + batchSize, allChunks.length)}...`,
        );
        const embeddings = await this.generateEmbeddings(texts);

        // Add embeddings to chunks
        batch.forEach((chunk, index) => {
          chunk.embedding = embeddings[index];
        });
      }

      // Initialize Pinecone index
      console.log("\nConnecting to Pinecone...");
      const index = this.pinecone.Index(config.pinecone.indexName);

      // Prepare vectors for upsert
      const vectors = allChunks.map((chunk) => ({
        id: chunk.id,
        values: chunk.embedding!,
        metadata: {
          text: chunk.text,
          source: chunk.metadata.source,
          section: chunk.metadata.section,
          subsection: chunk.metadata.subsection || "",
          chunkIndex: chunk.metadata.chunkIndex,
        },
      }));

      // Upsert to Pinecone in batches
      const upsertBatchSize = 100;
      for (let i = 0; i < vectors.length; i += upsertBatchSize) {
        const batch = vectors.slice(i, i + upsertBatchSize);
        console.log(
          `Upserting vectors ${i + 1}-${Math.min(i + upsertBatchSize, vectors.length)} to Pinecone...`,
        );

        await index.upsert(batch);
      }

      console.log("\n✅ Indexing complete!");
      console.log(`Indexed ${allChunks.length} chunks from ${markdownFiles.length} files`);
    } catch (error) {
      console.error("Error during indexing:", error);
      throw error;
    }
  }
}

// Run the indexer
async function main() {
  console.log("🚀 Starting document indexing...\n");

  const indexer = new DocumentIndexer();
  await indexer.indexDocuments();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
