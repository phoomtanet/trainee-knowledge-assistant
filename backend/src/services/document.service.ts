import { ParsedDocument } from "../types/document";
import { parsePdf, parseTxt } from "../utils/fileParser";
import { embeddingService } from "./embedding.service";
import { AppError } from "../middlewares/errorHandler";

export const documentService = {
  parse: async (file: Express.Multer.File): Promise<ParsedDocument> => {
    let text: string;

    if (file.mimetype === "application/pdf") {
      text = await parsePdf(file.path);
    } else if (file.mimetype === "text/plain") {
      text = await parseTxt(file.path);
    } else {
      throw new AppError(400, "Unsupported file type");
    }

    // embedding is best-effort — upload succeeds even if OPENAI_API_KEY is not set
    let chunksStored = 0;
    try {
      chunksStored = await embeddingService.storeDocument(text, file.originalname);
    } catch {
      // silently skip embedding if not configured
    }

    return {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      text,
      chunksStored,
    };
  },
};
