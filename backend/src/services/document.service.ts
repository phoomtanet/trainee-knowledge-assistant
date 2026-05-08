import { ParsedDocument } from "../types/document";
import { parsePdf, parseTxt } from "../utils/fileParser";
import { embeddingService } from "./embedding.service";
import { AppError } from "../middlewares/errorHandler";

export const documentService = {
  parse: async (file: Express.Multer.File): Promise<ParsedDocument> => {
    // multer decodes originalname as Latin-1; re-encode to UTF-8 for Thai filenames
    const filename = Buffer.from(file.originalname, "latin1").toString("utf8");

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
      chunksStored = await embeddingService.storeDocument(text, filename);
    } catch (err) {
      console.error("[embedding] failed:", err instanceof Error ? err.message : err);
    }

    return {
      filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      text,
      chunksStored,
    };
  },
};
