import crypto from "crypto";
import { embedTexts } from "../lib/embedder";
import { env } from "../config/env";
import { qdrantClient, ensureCollection } from "../lib/qdrant";
import { chunkText } from "../utils/textChunker";

export const embeddingService = {
  storeDocument: async (text: string, filename: string): Promise<number> => {
    const chunks = await chunkText(text);
    if (chunks.length === 0) return 0;

    const vectors = await embedTexts(chunks);
    await ensureCollection(vectors[0].length);

    const points = chunks.map((chunk, i) => ({
      id: crypto.randomUUID(),
      vector: vectors[i],
      payload: { text: chunk, filename, chunkIndex: i },
    }));

    await qdrantClient.upsert(env.qdrantCollection, { points });
    return chunks.length;
  },
};
