import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  role: "user" | "assistant";
  content: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  sources?: string[];
}

export interface IConversation extends Document {
  userId: string;
  type: "chat" | "document";
  title: string;
  messages: IMessage[];
  lastUploadedFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    tokenUsage: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
    },
    sources: [String],
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ["chat", "document"], required: true, default: "chat" },
    title: { type: String, required: true, default: "New Chat" },
    messages: [messageSchema],
    lastUploadedFile: { type: String },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
