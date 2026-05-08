const mockUpsert = jest.fn().mockResolvedValue({});
const mockEnsureCollection = jest.fn().mockResolvedValue(undefined);

jest.mock("../../lib/embedder", () => ({
  embedTexts: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
}));

jest.mock("../../lib/qdrant", () => ({
  qdrantClient: { upsert: mockUpsert },
  ensureCollection: mockEnsureCollection,
}));

jest.mock("../../utils/textChunker", () => ({
  chunkText: jest.fn().mockResolvedValue(["chunk one", "chunk two"]),
}));

import { embeddingService } from "../../services/embedding.service";
import { embedTexts } from "../../lib/embedder";
import { chunkText } from "../../utils/textChunker";

describe("embeddingService.storeDocument", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns number of chunks stored", async () => {
    (embedTexts as jest.Mock).mockResolvedValueOnce([[0.1, 0.2], [0.3, 0.4]]);
    const count = await embeddingService.storeDocument("some text", "file.pdf");
    expect(count).toBe(2);
  });

  it("calls ensureCollection and qdrantClient.upsert", async () => {
    await embeddingService.storeDocument("text", "doc.pdf");
    expect(mockEnsureCollection).toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("returns 0 when chunkText returns empty array", async () => {
    (chunkText as jest.Mock).mockResolvedValueOnce([]);
    const count = await embeddingService.storeDocument("", "empty.pdf");
    expect(count).toBe(0);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("stores correct filename in payload", async () => {
    (embedTexts as jest.Mock).mockResolvedValueOnce([[0.1]]);
    (chunkText as jest.Mock).mockResolvedValueOnce(["single chunk"]);
    await embeddingService.storeDocument("content", "report.pdf");
    const upsertCall = mockUpsert.mock.calls[0];
    const points = upsertCall[1].points;
    expect(points[0].payload.filename).toBe("report.pdf");
  });
});
