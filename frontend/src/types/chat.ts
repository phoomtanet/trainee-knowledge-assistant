export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  message: string;
  data: { reply: string; tokenUsage: TokenUsage; sources: string[] };
}

export type StreamEvent =
  | { type: "token"; content: string }
  | { type: "done"; sources: string[]; tokenUsage: TokenUsage }
  | { type: "error"; message: string };
