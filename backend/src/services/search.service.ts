import { embedQuery } from "../lib/embedder";
import { env } from "../config/env";
import { qdrantClient } from "../lib/qdrant";

export interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

export const searchService = {
  search: async (query: string, topK = 3): Promise<SearchResult[]> => {
    const queryVector = await embedQuery(query);

    const results = await qdrantClient.search(env.qdrantCollection, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    });

    return results.map((r) => {
      const raw = (r.payload?.filename as string) || "";
      const filename = Buffer.from(raw, "latin1").toString("utf8");
      return {
        text: (r.payload?.text as string) || "",
        filename,
        score: r.score,
      };
    });
  },
};
