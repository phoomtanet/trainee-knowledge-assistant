import { Conversation, IConversation } from "../models/conversation.model";

export const conversationRepository = {
  create: (userId: string, title: string, type: "chat" | "document" = "chat") =>
    Conversation.create({ userId, title, type, messages: [] }),

  findAllByUser: (userId: string, type: "chat" | "document") =>
    Conversation.find({ userId, type })
      .select("title createdAt updatedAt lastUploadedFile")
      .sort({ updatedAt: -1 }),

  updateFile: (id: string, userId: string, filename: string) =>
    Conversation.findOneAndUpdate(
      { _id: id, userId },
      { lastUploadedFile: filename },
      { new: true }
    ),

  findByIdAndUser: (id: string, userId: string) =>
    Conversation.findOne({ _id: id, userId }),

  updateMessages: (id: string, userId: string, messages: IConversation["messages"]) =>
    Conversation.findOneAndUpdate(
      { _id: id, userId },
      { messages },
      { new: true }
    ),
};
