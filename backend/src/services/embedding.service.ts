import crypto from "crypto";
import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "../config/env";
import { qdrantClient, ensureCollection } from "../lib/qdrant";
import { chunkText } from "../utils/textChunker";
import { AppError } from "../middlewares/errorHandler";

const getEmbeddings = (): OpenAIEmbeddings => {
  if (!env.openrouterApiKey) throw new AppError(500, "OPENROUTER_API_KEY is required for embedding");
  return new OpenAIEmbeddings({
    openAIApiKey: env.openrouterApiKey,
    modelName: env.embeddingModel,
    configuration: { baseURL: "https://openrouter.ai/api/v1" },
  });
};

export const embeddingService = {
  storeDocument: async (text: string, filename: string): Promise<number> => {
    const chunks = await chunkText(text);
    if (chunks.length === 0) return 0;

    const embeddings = getEmbeddings();
    const vectors = await embeddings.embedDocuments(chunks);

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
