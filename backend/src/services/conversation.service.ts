import { conversationRepository } from "../repositories/conversation.repository";
import { AppError } from "../middlewares/errorHandler";
import { IConversation } from "../models/conversation.model";

export const conversationService = {
  create: async (userId: string, firstMessage?: string, type: "chat" | "document" = "chat") => {
    const raw = (firstMessage || "New Chat").trim();
    const title = raw.length > 60 ? raw.slice(0, 60) + "..." : raw;
    return conversationRepository.create(userId, title, type);
  },

  save: async (id: string, userId: string, messages: IConversation["messages"]) => {
    const conv = await conversationRepository.updateMessages(id, userId, messages);
    if (!conv) throw new AppError(404, "Conversation not found");
    return conv;
  },

  updateFile: async (id: string, userId: string, filename: string) => {
    const conv = await conversationRepository.updateFile(id, userId, filename);
    if (!conv) throw new AppError(404, "Conversation not found");
    return conv;
  },

  list: async (userId: string, type: "chat" | "document") =>
    conversationRepository.findAllByUser(userId, type),

  get: async (id: string, userId: string) => {
    const conv = await conversationRepository.findByIdAndUser(id, userId);
    if (!conv) throw new AppError(404, "Conversation not found");
    return conv;
  },
};
