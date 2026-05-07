import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";

interface EmbeddingData {
  embedding: number[];
  index: number;
}

export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (!env.openrouterApiKey) throw new AppError(500, "OPENROUTER_API_KEY is required");

  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openrouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: env.embeddingModel, input: texts }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new AppError(502, err.error?.message || "Embedding API error");
  }

  const data = await res.json() as { data: EmbeddingData[] };
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
};

export const embedQuery = async (text: string): Promise<number[]> => {
  const vectors = await embedTexts([text]);
  return vectors[0];
};
