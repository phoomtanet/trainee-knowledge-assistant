import { TokenUsage } from "./chat";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  tokenUsage?: TokenUsage;
  sources?: string[];
}

export interface ConversationSummary {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastUploadedFile?: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
  lastUploadedFile?: string;
}
