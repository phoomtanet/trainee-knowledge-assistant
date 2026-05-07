import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "../config/env";
import { qdrantClient } from "../lib/qdrant";
import { AppError } from "../middlewares/errorHandler";

export interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

const getEmbeddings = (): OpenAIEmbeddings => {
  if (!env.openrouterApiKey) throw new AppError(500, "OPENROUTER_API_KEY is required for search");
  return new OpenAIEmbeddings({
    openAIApiKey: env.openrouterApiKey,
    modelName: env.embeddingModel,
    configuration: { baseURL: "https://openrouter.ai/api/v1" },
  });
};

export const searchService = {
  search: async (query: string, topK = 3): Promise<SearchResult[]> => {
    const embeddings = getEmbeddings();
    const queryVector = await embeddings.embedQuery(query);

    const results = await qdrantClient.search(env.qdrantCollection, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    });

    return results.map((r) => ({
      text: (r.payload?.text as string) || "",
      filename: (r.payload?.filename as string) || "",
      score: r.score,
    }));
  },
};
