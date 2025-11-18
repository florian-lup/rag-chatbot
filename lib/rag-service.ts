import { Pinecone } from "@pinecone-database/pinecone";
import type {
  Index,
  QueryResponse,
  ScoredPineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions";
import { config, validateConfig } from "../config/config";
import type { ChatMessage, RetrievedDocument } from "@/types/types";

export class RAGService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private index: Index<RecordMetadata>;

  constructor() {
    validateConfig();

    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    this.index = this.pinecone.Index(config.pinecone.indexName);
  }

  /**
   * Generate embedding for a text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: text,
      });

      const embedding = response.data[0].embedding;

      return embedding;
    } catch (error) {
      console.error("❌ Error generating embedding:", error);
      throw error;
    }
  }

  /**
   * Retrieve relevant documents from Pinecone
   */
  async retrieveDocuments(userQuery: string): Promise<RetrievedDocument[]> {
    try {
      // Step 1: Generate embedding for the user query directly
      const queryEmbedding = await this.generateEmbedding(userQuery);

      // Step 2: Query Pinecone
      const queryParams = {
        vector: queryEmbedding,
        topK: config.retrieval.topK,
        includeMetadata: true,
        includeValues: false,
      };

      const queryResponse: QueryResponse<RecordMetadata> = await this.index.query(queryParams);

      // Step 3: Process and filter results
      const allMatches = queryResponse.matches || [];
      const filteredMatches = allMatches.filter(
        (match: ScoredPineconeRecord<RecordMetadata>) =>
          (match.score ?? 0) >= config.retrieval.minScore,
      );

      const documents: RetrievedDocument[] = filteredMatches.map(
        (match: ScoredPineconeRecord<RecordMetadata>) => {
          const md = (match.metadata || {}) as Record<string, unknown>;
          return {
            id: match.id ?? "",
            text: String(md.text ?? ""),
            score: match.score ?? 0,
            metadata: {
              source: String(md.source ?? ""),
              section: String(md.section ?? ""),
              title: md.title !== undefined ? String(md.title) : undefined,
              subsection: md.subsection !== undefined ? String(md.subsection) : undefined,
            },
          };
        },
      );

      return documents;
    } catch (error) {
      console.error("❌ Error retrieving documents:", error);
      throw error;
    }
  }

  /**
   * Generate answer based on retrieved context
   */
  async generateAnswer(
    userQuery: string,
    retrievedDocuments: RetrievedDocument[],
    conversationHistory: ChatMessage[] = [],
  ): Promise<string> {
    try {
      // Prepare context from retrieved documents
      const context = retrievedDocuments
        .map((doc, index) => {
          const source = `[${index + 1}] ${doc.metadata.source} - ${doc.metadata.section}`;
          const subsection = doc.metadata.subsection ? ` (${doc.metadata.subsection})` : "";
          return `${source}${subsection}:\n${doc.text}`;
        })
        .join("\n\n---\n\n");

      const systemPrompt = `${config.chat.systemPrompt}

Context from documentation:
${context}`;

      // Build messages array with conversation history
      const apiMessages: ChatCompletionCreateParams["messages"] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory
          .slice(-config.chat.maxConversationHistory)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userQuery },
      ];

      const response = await this.openai.chat.completions.create({
        model: config.openai.answerModel,
        messages: apiMessages,
      });

      const answer =
        response.choices[0].message.content?.trim() || config.chat.fallbackErrorMessage;

      return answer;
    } catch (error) {
      console.error("Error generating answer:", error);
      throw error;
    }
  }

  /**
   * Get index statistics for debugging
   */
  private async getIndexStats(): Promise<void> {
    try {
      const stats = await this.index.describeIndexStats();

      if (stats.namespaces) {
        Object.entries(stats.namespaces).forEach(([ns, nsStats]) => {
          console.log(`     • ${ns}: ${nsStats.recordCount || 0} vectors`);
        });
      }

      if ((stats.totalRecordCount || 0) === 0) {
        console.log(
          `⚠️  WARNING: Index appears to be empty! This could be why no results are found.`,
        );
      }
    } catch (error) {
      console.error("❌ Error getting index stats:", error);
    }
  }

  /**
   * Complete RAG pipeline: retrieve and answer
   */
  async processQuery(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Check index stats on first query (helpful for debugging)
      await this.getIndexStats();

      // Retrieve relevant documents
      const retrievedDocuments = await this.retrieveDocuments(userQuery);

      if (retrievedDocuments.length === 0) {
        console.log(`ℹ️  No documents found - this could be due to:`);
        console.log(`   • Empty index (check index stats above)`);
        console.log(`   • High minimum score threshold (${config.retrieval.minScore})`);
        console.log(`   • Query not matching indexed content semantically`);
        console.log(`   • Incorrect index name or configuration`);

        return config.chat.noResultsMessage;
      }

      // Generate answer
      const answer = await this.generateAnswer(userQuery, retrievedDocuments, conversationHistory);

      // Log final answer for debugging/observability
      console.log("\n🧠 FINAL ANSWER OUTPUT:");
      console.log("========================");
      console.log(answer);
      console.log("========================\n");

      return answer;
    } catch (error) {
      console.error("❌ Error processing query:", error);
      throw error;
    }
  }
}
