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
   * Rewrite user query for better retrieval
   */
  private async rewriteQuery(userQuery: string): Promise<string> {
    try {
      const systemPrompt = `You are a query rewriting assistant. Your task is to reformulate user queries to make them more precise and effective for semantic search in a documentation database.

Guidelines:
- Expand abbreviations and acronyms
- Add relevant context and synonyms
- Make the query more specific and detailed
- Focus on the core information need
- Keep it concise but comprehensive

Return ONLY the rewritten query, nothing else.`;

      const response = await this.openai.chat.completions.create({
        model: config.openai.queryRewriteModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const rewrittenQuery = response.choices[0].message.content?.trim() || userQuery;
      console.log("Original query:", userQuery);
      console.log("Rewritten query:", rewrittenQuery);

      return rewrittenQuery;
    } catch (error) {
      console.error("Error rewriting query:", error);
      // Fallback to original query if rewriting fails
      return userQuery;
    }
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

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }

  /**
   * Retrieve relevant documents from Pinecone
   */
  async retrieveDocuments(userQuery: string): Promise<RetrievedDocument[]> {
    try {
      // Step 1: Rewrite the query for better retrieval
      const rewrittenQuery = await this.rewriteQuery(userQuery);

      // Step 2: Generate embedding for the rewritten query
      const queryEmbedding = await this.generateEmbedding(rewrittenQuery);

      // Step 3: Query Pinecone
      const queryResponse: QueryResponse<RecordMetadata> = await this.index.query({
        vector: queryEmbedding,
        topK: config.retrieval.topK,
        includeMetadata: true,
        includeValues: false,
      });

      // Step 4: Process and filter results
      const documents: RetrievedDocument[] = (queryResponse.matches || [])
        .filter(
          (match: ScoredPineconeRecord<RecordMetadata>) =>
            (match.score ?? 0) >= config.retrieval.minScore,
        )
        .map((match: ScoredPineconeRecord<RecordMetadata>) => {
          const md = (match.metadata || {}) as Record<string, unknown>;
          return {
            id: match.id ?? "",
            text: String(md.text ?? ""),
            score: match.score ?? 0,
            metadata: {
              source: String(md.source ?? ""),
              section: String(md.section ?? ""),
              subsection: md.subsection !== undefined ? String(md.subsection) : undefined,
            },
          };
        });

      console.log(`Retrieved ${documents.length} relevant documents`);
      return documents;
    } catch (error) {
      console.error("Error retrieving documents:", error);
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

      const systemPrompt = `You are a helpful customer support assistant for Anara, an AI-enabled research workspace. Your role is to answer user questions based on the provided documentation context.

Guidelines:
1. Provide clear, concise, and accurate answers based on the documentation
2. Use a friendly and professional tone
3. If the answer is found in the context, cite the source using [number] notation
4. If information is not in the context, politely say you don't have that information in the documentation
5. For complex topics, break down the answer into clear steps or bullet points
6. Always prioritize accuracy over completeness

Context from documentation:
${context}`;

      // Build messages array with conversation history
      const apiMessages: ChatCompletionCreateParams["messages"] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userQuery },
      ];

      const response = await this.openai.chat.completions.create({
        model: config.openai.answerModel,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const answer =
        response.choices[0].message.content?.trim() ||
        "I apologize, but I couldn't generate an answer. Please try again.";

      return answer;
    } catch (error) {
      console.error("Error generating answer:", error);
      throw error;
    }
  }

  /**
   * Complete RAG pipeline: retrieve and answer
   */
  async processQuery(
    userQuery: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<{
    answer: string;
    sources: RetrievedDocument[];
  }> {
    try {
      // Retrieve relevant documents
      const retrievedDocuments = await this.retrieveDocuments(userQuery);

      if (retrievedDocuments.length === 0) {
        return {
          answer:
            "I couldn't find any relevant information in the documentation to answer your question. Could you please rephrase or provide more details?",
          sources: [],
        };
      }

      // Generate answer
      const answer = await this.generateAnswer(userQuery, retrievedDocuments, conversationHistory);

      return {
        answer,
        sources: retrievedDocuments,
      };
    } catch (error) {
      console.error("Error processing query:", error);
      throw error;
    }
  }
}
