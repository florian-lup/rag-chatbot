export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatApiResponse {
  reply?: string;
  error?: string;
}

export interface ChatApiError {
  error: string;
}
