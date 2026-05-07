import fs from "fs/promises";

// pdf-parse is a CommonJS module; compiled output may wrap it under .default
const _pdfMod = require("pdf-parse");
const pdfParse = (_pdfMod.default ?? _pdfMod) as (buf: Buffer) => Promise<{ text: string }>;

export const parsePdf = async (filePath: string): Promise<string> => {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  return result.text.trim();
};

export const parseTxt = async (filePath: string): Promise<string> => {
  const content = await fs.readFile(filePath, "utf-8");
  return content.trim();
};
