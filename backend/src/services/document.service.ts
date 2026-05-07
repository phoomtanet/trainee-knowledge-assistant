import { ParsedDocument } from "../types/document";
import { parsePdf, parseTxt } from "../utils/fileParser";
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

    return {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      text,
    };
  },
};
