import { Response, NextFunction } from "express";
import { chatService, ChatMessage } from "../services/chat.service";
import { AppError } from "../middlewares/errorHandler";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../middlewares/auth.middleware";

export const chatController = {
  chat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!Array.isArray(messages) || messages.length === 0) {
        throw new AppError(400, "Messages are required");
      }

      const result = await chatService.chat(messages);
      sendSuccess(res, { reply: result.reply, sources: result.sources, tokenUsage: result.tokenUsage });
    } catch (err) {
      next(err);
    }
  },
};
