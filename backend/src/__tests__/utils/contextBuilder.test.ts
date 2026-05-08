import { buildSystemContext } from "../../utils/contextBuilder";
import { SearchResult } from "../../services/search.service";

describe("buildSystemContext", () => {
  it("returns empty string when results are empty", () => {
    expect(buildSystemContext([])).toBe("");
  });

  it("includes the filename in the output", () => {
    const results: SearchResult[] = [
      { text: "Hello world", filename: "doc.pdf", score: 0.9 },
    ];
    const output = buildSystemContext(results);
    expect(output).toContain("doc.pdf");
    expect(output).toContain("Hello world");
  });

  it("numbers multiple chunks sequentially", () => {
    const results: SearchResult[] = [
      { text: "First chunk", filename: "a.pdf", score: 0.9 },
      { text: "Second chunk", filename: "b.pdf", score: 0.8 },
    ];
    const output = buildSystemContext(results);
    expect(output).toContain("[1]");
    expect(output).toContain("[2]");
    expect(output).toContain("First chunk");
    expect(output).toContain("Second chunk");
  });

  it("includes the instruction header", () => {
    const results: SearchResult[] = [
      { text: "content", filename: "file.txt", score: 0.7 },
    ];
    const output = buildSystemContext(results);
    expect(output).toContain("Knowledge Assistant");
    expect(output).toContain("ตอบคำถามโดยอ้างอิง");
  });
});
