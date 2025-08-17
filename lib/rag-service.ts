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

    console.log("\n🚀 RAG SERVICE INITIALIZATION:");
    console.log("==============================");
    console.log(`📊 Configuration:`);
    console.log(`   - Pinecone Index: ${config.pinecone.indexName}`);
    console.log(`   - Embedding Model: ${config.openai.embeddingModel}`);
    console.log(`   - Answer Model: ${config.openai.answerModel}`);
    console.log(`   - Retrieval topK: ${config.retrieval.topK}`);
    console.log(`   - Minimum Score Threshold: ${config.retrieval.minScore}`);
    console.log("==============================\n");

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
      console.log(`🧮 Generating embedding using model: ${config.openai.embeddingModel}`);
      console.log(`📝 Text length: ${text.length} characters`);

      const response = await this.openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: text,
      });

      const embedding = response.data[0].embedding;
      console.log(`✅ Embedding generated - ${embedding.length} dimensions`);

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
      console.log("\n🔍 RAG RETRIEVAL DEBUG LOG:");
      console.log("================================");
      console.log(`📝 User query: "${userQuery}"`);

      // Step 1: Generate embedding for the user query directly
      console.log(`🔄 Generating embedding for: "${userQuery}"`);
      const queryEmbedding = await this.generateEmbedding(userQuery);
      console.log(`📊 Embedding generated - dimensions: ${queryEmbedding.length}`);
      console.log(
        `📊 First 5 embedding values: [${queryEmbedding
          .slice(0, 5)
          .map((v) => v.toFixed(4))
          .join(", ")}...]`,
      );

      // Step 2: Query Pinecone
      const queryParams = {
        vector: queryEmbedding,
        topK: config.retrieval.topK,
        includeMetadata: true,
        includeValues: false,
      };

      console.log(`🎯 Pinecone query parameters:`);
      console.log(`   - Index: ${config.pinecone.indexName}`);
      console.log(`   - topK: ${queryParams.topK}`);
      console.log(`   - minScore threshold: ${config.retrieval.minScore}`);
      console.log(`   - includeMetadata: ${queryParams.includeMetadata}`);
      console.log(`   - vector dimensions: ${queryParams.vector.length}`);

      const queryResponse: QueryResponse<RecordMetadata> = await this.index.query(queryParams);

      console.log(`📋 Raw Pinecone response:`);
      console.log(`   - Total matches returned: ${queryResponse.matches?.length || 0}`);

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        console.log(
          `   - Score range: ${Math.min(...queryResponse.matches.map((m) => m.score || 0)).toFixed(4)} to ${Math.max(...queryResponse.matches.map((m) => m.score || 0)).toFixed(4)}`,
        );
        console.log(
          `   - All scores: [${queryResponse.matches.map((m) => (m.score || 0).toFixed(4)).join(", ")}]`,
        );

        // Log details of top 3 matches
        console.log(`📄 Top 3 matches details:`);
        queryResponse.matches.slice(0, 3).forEach((match, index) => {
          const md = (match.metadata || {}) as Record<string, unknown>;
          console.log(`   ${index + 1}. ID: ${match.id}`);
          console.log(`      Score: ${(match.score || 0).toFixed(4)}`);
          console.log(`      Source: ${String(md.source ?? "unknown")}`);
          console.log(`      Section: ${String(md.section ?? "unknown")}`);
          console.log(`      Title: ${String(md.title ?? "unknown")}`);
          console.log(`      Text preview: "${String(md.text ?? "").substring(0, 100)}..."`);
        });
      } else {
        console.log(`   ❌ No matches returned from Pinecone`);
      }

      // Step 3: Process and filter results
      const allMatches = queryResponse.matches || [];
      const filteredMatches = allMatches.filter(
        (match: ScoredPineconeRecord<RecordMetadata>) =>
          (match.score ?? 0) >= config.retrieval.minScore,
      );

      console.log(`🔍 Filtering results:`);
      console.log(`   - Matches before filtering: ${allMatches.length}`);
      console.log(
        `   - Matches after score filtering (≥${config.retrieval.minScore}): ${filteredMatches.length}`,
      );

      if (allMatches.length > 0 && filteredMatches.length === 0) {
        console.log(`   ⚠️  All matches filtered out due to low scores!`);
        console.log(`   💡 Consider lowering minScore threshold from ${config.retrieval.minScore}`);
        console.log(
          `   📊 Highest score was: ${Math.max(...allMatches.map((m) => m.score || 0)).toFixed(4)}`,
        );
      }

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

      console.log(`✅ Final result: ${documents.length} documents retrieved for user`);
      if (documents.length > 0) {
        console.log(`📑 Retrieved documents summary:`);
        documents.forEach((doc, index) => {
          const titleDisplay = doc.metadata.title ? ` - "${doc.metadata.title}"` : "";
          console.log(
            `   ${index + 1}. ${doc.metadata.section}${titleDisplay} (${doc.metadata.source}) - score: ${doc.score.toFixed(4)}`,
          );
        });
      }
      console.log("================================\n");

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
      console.log(`📊 Checking Pinecone index stats...`);
      const stats = await this.index.describeIndexStats();

      console.log(`📈 Index Statistics:`);
      console.log(`   - Total vector count: ${stats.totalRecordCount || 0}`);
      console.log(`   - Index fullness: ${stats.indexFullness || 0}`);
      console.log(`   - Dimension: ${stats.dimension || "unknown"}`);

      if (stats.namespaces) {
        console.log(`   - Namespaces: ${Object.keys(stats.namespaces).length}`);
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
