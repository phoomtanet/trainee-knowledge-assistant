import { Response, NextFunction } from "express";
import { documentService } from "../services/document.service";
import { AppError } from "../middlewares/errorHandler";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../middlewares/auth.middleware";

export const documentController = {
  upload: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new AppError(400, "No file uploaded");

      const parsed = await documentService.parse(req.file);
      sendSuccess(res, {
        filename: parsed.filename,
        size: parsed.size,
        mimetype: parsed.mimetype,
        preview: parsed.text.slice(0, 500),
      }, "File uploaded and parsed successfully");
    } catch (err) {
      next(err);
    }
  },
};
