// Shared chat and RAG types

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface DocumentMetadata {
  source: string;
  section: string;
  title?: string;
  subsection?: string;
}

export interface RetrievedDocument {
  id: string;
  text: string;
  score: number;
  metadata: DocumentMetadata;
}

// API request/response contracts
export interface ChatApiRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatApiResponseData {
  answer: string;
}

// Shared document chunk schema used by scripts
export interface DocumentChunk {
  id: string;
  text: string;
  metadata: DocumentMetadata & { chunkIndex: number };
  embedding?: number[];
}

// Changelog types
export interface ChangelogSection {
  date: string;
  title: string;
  content: string[];
  improvements: string[];
  fixes: string[];
}
