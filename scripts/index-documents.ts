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

// Define the structure of the scraped documentation
interface DocPage {
  title: string;
  href: string;
  content: string;
  headings: string[];
  description: string;
  category: string;
}

interface DocCategory {
  group: string;
  pages: DocPage[];
}

interface DocData {
  timestamp: string;
  baseUrl: string;
  categories: DocCategory[];
  totalPages: number;
}

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
   * Get a summary of the page for context
   */
  private getPageSummary(page: DocPage): string {
    // Use description if available, otherwise create a summary from title and category
    if (page.description && page.description.trim()) {
      return page.description;
    }

    // Generate a default summary based on title and category
    return `${page.category} documentation about ${page.title}`;
  }

  /**
   * Parse page content using size-based chunking
   */
  private parsePageContent(page: DocPage): DocumentChunk[] {
    const content = page.content;
    const lines = content.split("\n");
    const chunks: DocumentChunk[] = [];

    // Get chunking configuration from config
    const { minChunkSize, maxChunkSize, overlapLines } = config.chunking;

    // Get page summary for enhanced context
    const pageSummary = this.getPageSummary(page);

    // For small content, consider keeping it whole
    const documentText = lines.join("\n");
    if (documentText.length <= maxChunkSize) {
      // Content is small enough to be a single chunk
      chunks.push(this.createEnhancedChunk(documentText, page, "", 0, pageSummary));
      return chunks;
    }

    // For larger content, chunk by size with overlap
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
            page,
            `Part ${chunkIndex + 1}`,
            chunkIndex++,
            pageSummary,
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
            page,
            chunks.length > 0 ? `Part ${chunkIndex + 1}` : "",
            chunkIndex,
            pageSummary,
          ),
        );
      } else if (chunks.length > 0) {
        // If last chunk is too small, append it to the previous chunk
        const lastChunk = chunks[chunks.length - 1];
        const combinedText = lastChunk.text + "\n\n" + currentText;
        chunks[chunks.length - 1] = this.createEnhancedChunk(
          combinedText,
          page,
          lastChunk.metadata.subsection || "",
          lastChunk.metadata.chunkIndex,
          pageSummary,
        );
      }
    }

    return chunks;
  }

  /**
   * Create an enhanced chunk with page-level context
   */
  private createEnhancedChunk(
    text: string,
    page: DocPage,
    subsection: string,
    chunkIndex: number,
    pageSummary: string,
  ): DocumentChunk {
    // Clean up the text
    const cleanText = text.trim();

    // Build enhanced text with minimal but useful context
    const contextParts = [`${page.category} - ${page.title}:`, pageSummary];

    if (subsection) {
      contextParts.push(`Section: ${subsection}`);
    }

    // Combine context with actual content - keep it natural
    const enhancedText = `${contextParts.join(" ")}\n\n${cleanText}`;

    return {
      id: uuidv4(),
      text: enhancedText, // Use enhanced text for embedding generation
      metadata: {
        source: page.href, // Use href as source for tracking
        section: page.category,
        title: page.title,
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
   * Process all pages from the scraped documentation JSON
   */
  async indexDocuments() {
    const jsonPath = path.join(process.cwd(), "public", "guides", "anara-docs-complete.json");

    try {
      // Read the JSON file
      const jsonContent = await fs.readFile(jsonPath, "utf-8");
      const docData: DocData = JSON.parse(jsonContent);

      // Count total pages
      const totalPages = docData.categories.reduce((sum, cat) => sum + cat.pages.length, 0);
      console.log(
        `Found ${totalPages} pages to index from ${docData.categories.length} categories`,
      );

      // Log chunking configuration
      console.log(`\n📊 Chunking Configuration:`);
      console.log(`   - Min chunk size: ${config.chunking.minChunkSize} characters`);
      console.log(`   - Max chunk size: ${config.chunking.maxChunkSize} characters`);
      console.log(`   - Overlap lines: ${config.chunking.overlapLines} lines`);
      console.log(`   - Min score threshold: ${config.retrieval.minScore}`);

      let allChunks: DocumentChunk[] = [];

      // Process each category and its pages
      for (const category of docData.categories) {
        console.log(`\nProcessing category: ${category.group}`);

        for (const page of category.pages) {
          console.log(`  Processing page: ${page.title} (${page.href})`);
          const chunks = this.parsePageContent(page);
          allChunks = allChunks.concat(chunks);
          console.log(`    - Created ${chunks.length} chunks`);
        }
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
      const vectors = allChunks.map((chunk) => {
        const metadata: Record<string, any> = {
          text: chunk.text,
          source: chunk.metadata.source,
          section: chunk.metadata.section,
          subsection: chunk.metadata.subsection || "",
          chunkIndex: chunk.metadata.chunkIndex,
        };

        // Only add title if it exists (Pinecone doesn't accept undefined values)
        if (chunk.metadata.title) {
          metadata.title = chunk.metadata.title;
        }

        return {
          id: chunk.id,
          values: chunk.embedding!,
          metadata,
        };
      });

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
      console.log(
        `Indexed ${allChunks.length} chunks from ${totalPages} pages across ${docData.categories.length} categories`,
      );
      console.log(
        `Data source: ${docData.baseUrl} (scraped on ${new Date(docData.timestamp).toLocaleString()})`,
      );
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
