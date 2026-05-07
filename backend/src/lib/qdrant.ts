import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../config/env";

export const qdrantClient = new QdrantClient({ url: env.qdrantUrl });

export const ensureCollection = async (vectorSize: number): Promise<void> => {
  const response = await qdrantClient.getCollections();
  const exists = response.collections.some((c) => c.name === env.qdrantCollection);
  if (!exists) {
    await qdrantClient.createCollection(env.qdrantCollection, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  }
};
