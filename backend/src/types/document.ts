export interface ParsedDocument {
  filename: string;
  mimetype: string;
  size: number;
  text: string;
  path: string;
  chunksStored: number;
}
