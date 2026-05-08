import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { conversationService } from "../services/conversation.service";
import { sendSuccess, sendCreated } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

export const conversationController = {
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError(401, "Unauthorized"));
      const { firstMessage, type } = req.body as { firstMessage?: string; type?: "chat" | "document" };
      const conv = await conversationService.create(userId, firstMessage, type ?? "chat");
      sendCreated(res, { id: conv.id, title: conv.title }, "Conversation created");
    } catch (err) {
      next(err);
    }
  },

  save: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError(401, "Unauthorized"));
      const { id } = req.params;
      const { messages } = req.body;
      await conversationService.save(id, userId, messages);
      sendSuccess(res, { id }, "Conversation saved");
    } catch (err) {
      next(err);
    }
  },

  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError(401, "Unauthorized"));
      const type = (req.query.type as "chat" | "document") ?? "chat";
      const convs = await conversationService.list(userId, type);
      sendSuccess(res, convs, "Conversations fetched");
    } catch (err) {
      next(err);
    }
  },

  updateFile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError(401, "Unauthorized"));
      const { id } = req.params;
      const { filename } = req.body as { filename: string };
      if (!filename) return next(new AppError(400, "filename is required"));
      await conversationService.updateFile(id, userId, filename);
      sendSuccess(res, { id }, "File updated");
    } catch (err) {
      next(err);
    }
  },

  get: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next(new AppError(401, "Unauthorized"));
      const conv = await conversationService.get(req.params.id, userId);
      sendSuccess(res, conv, "Conversation fetched");
    } catch (err) {
      next(err);
    }
  },
};
