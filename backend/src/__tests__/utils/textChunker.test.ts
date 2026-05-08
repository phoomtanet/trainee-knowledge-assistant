jest.mock("@langchain/textsplitters", () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(({ chunkSize }) => ({
    splitText: async (text: string) => {
      if (!text) return [];
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    },
  })),
}));

import { chunkText } from "../../utils/textChunker";

describe("chunkText", () => {
  it("returns empty array for empty string", async () => {
    const result = await chunkText("");
    expect(result).toEqual([]);
  });

  it("returns single chunk for short text", async () => {
    const result = await chunkText("short text");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("short text");
  });

  it("splits long text into multiple chunks", async () => {
    const longText = "a".repeat(2500);
    const result = await chunkText(longText);
    expect(result.length).toBeGreaterThan(1);
  });

  it("returns array of strings", async () => {
    const result = await chunkText("some content here");
    expect(Array.isArray(result)).toBe(true);
    result.forEach((chunk) => expect(typeof chunk).toBe("string"));
  });
});
