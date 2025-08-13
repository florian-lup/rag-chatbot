// Shared chat and RAG types

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface DocumentMetadata {
  source: string;
  section: string;
  subsection?: string;
}

export interface RetrievedDocument {
  id: string;
  text: string;
  score: number;
  metadata: DocumentMetadata;
}

// What the API returns to the UI for sources (preview, already flattened)
export interface SourcePreview {
  text: string; // truncated preview
  source: string;
  section: string;
  subsection?: string;
  score: number;
}

// API request/response contracts
export interface ChatApiRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatApiResponseData {
  answer: string;
  sources: SourcePreview[];
}

// Optional: shared document chunk schema used by scripts
export interface DocumentChunk {
  id: string;
  text: string;
  metadata: DocumentMetadata & { chunkIndex: number };
  embedding?: number[];
}
