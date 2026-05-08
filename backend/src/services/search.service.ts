import { embedQuery } from "../lib/embedder";
import { env } from "../config/env";
import { qdrantClient } from "../lib/qdrant";

export interface SearchResult {
  text: string;
  filename: string;
  score: number;
}

export const searchService = {
  search: async (query: string, topK = 3, filenameFilter?: string): Promise<SearchResult[]> => {
    const queryVector = await embedQuery(query);

    const searchParams: Parameters<typeof qdrantClient.search>[1] = {
      vector: queryVector,
      limit: topK,
      with_payload: true,
      ...(filenameFilter && {
        filter: {
          must: [{ key: "filename", match: { value: filenameFilter } }],
        },
      }),
    };

    const results = await qdrantClient.search(env.qdrantCollection, searchParams);

    return results.map((r) => ({
      text: (r.payload?.text as string) || "",
      filename: (r.payload?.filename as string) || "",
      score: r.score,
    }));
  },
};
