import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import MarkdownIt from "markdown-it";
import { config, validateConfig } from "../config/config";
import type { DocumentChunk as SharedDocumentChunk } from "@/types/types";

type DocumentChunk = SharedDocumentChunk;

class DocumentIndexer {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private md: MarkdownIt;

  constructor() {
    validateConfig();

    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    this.md = new MarkdownIt();
  }

  /**
   * Parse markdown content and split by semantic boundaries (headings)
   */
  private parseMarkdownByHeadings(content: string, filename: string): DocumentChunk[] {
    const lines = content.split("\n");
    const chunks: DocumentChunk[] = [];

    let currentSection = "Introduction";
    let currentSubsection = "";
    let currentContent: string[] = [];
    let chunkIndex = 0;

    for (const line of lines) {
      // Check for headings
      const h1Match = line.match(/^# (.+)/);
      const h2Match = line.match(/^## (.+)/);
      const h3Match = line.match(/^### (.+)/);

      if (h1Match) {
        // Save previous chunk if exists
        if (currentContent.length > 0) {
          chunks.push(
            this.createChunk(
              currentContent.join("\n"),
              filename,
              currentSection,
              currentSubsection,
              chunkIndex++,
            ),
          );
          currentContent = [];
        }
        currentSection = h1Match[1].trim();
        currentSubsection = "";
        currentContent.push(line);
      } else if (h2Match) {
        // Save previous chunk if exists
        if (currentContent.length > 0) {
          chunks.push(
            this.createChunk(
              currentContent.join("\n"),
              filename,
              currentSection,
              currentSubsection,
              chunkIndex++,
            ),
          );
          currentContent = [];
        }
        currentSubsection = h2Match[1].trim();
        currentContent.push(line);
      } else if (h3Match) {
        // For h3, we include it in the current chunk but don't split
        currentContent.push(line);
      } else {
        currentContent.push(line);
      }
    }

    // Don't forget the last chunk
    if (currentContent.length > 0) {
      chunks.push(
        this.createChunk(
          currentContent.join("\n"),
          filename,
          currentSection,
          currentSubsection,
          chunkIndex,
        ),
      );
    }

    return chunks;
  }

  private createChunk(
    text: string,
    source: string,
    section: string,
    subsection: string,
    chunkIndex: number,
  ): DocumentChunk {
    return {
      id: uuidv4(),
      text: text.trim(),
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

      let allChunks: DocumentChunk[] = [];

      // Process each file
      for (const file of markdownFiles) {
        const filePath = path.join(docsDir, file);
        const content = await fs.readFile(filePath, "utf-8");

        console.log(`Processing ${file}...`);
        const chunks = this.parseMarkdownByHeadings(content, file);
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
