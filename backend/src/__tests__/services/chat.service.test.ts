jest.mock("../../services/search.service", () => ({
  searchService: {
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("../../utils/contextBuilder", () => ({
  buildSystemContext: jest.fn().mockReturnValue("mocked context"),
}));

import { chatService } from "../../services/chat.service";
import { searchService } from "../../services/search.service";
import { AppError } from "../../middlewares/errorHandler";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const okResponse = (body: object) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);

const errorResponse = (body: object, status = 400) =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve(body),
  } as Response);

describe("chatService.prepareMessages", () => {
  it("returns messages without system context when no filename", async () => {
    const messages = [{ role: "user" as const, content: "Hello" }];
    const { openRouterMessages, sources } = await chatService.prepareMessages(messages);
    expect(openRouterMessages).toEqual(messages);
    expect(sources).toEqual([]);
  });

  it("calls searchService when filename is provided", async () => {
    (searchService.search as jest.Mock).mockResolvedValueOnce([
      { text: "doc content", filename: "test.pdf", score: 0.9 },
    ]);
    const messages = [{ role: "user" as const, content: "What is in the doc?" }];
    const { sources } = await chatService.prepareMessages(messages, "test.pdf");
    expect(searchService.search).toHaveBeenCalledWith("What is in the doc?", 4, "test.pdf");
    expect(sources).toContain("test.pdf");
  });

  it("returns empty sources when search throws", async () => {
    (searchService.search as jest.Mock).mockRejectedValueOnce(new Error("Qdrant down"));
    const messages = [{ role: "user" as const, content: "question" }];
    const { sources } = await chatService.prepareMessages(messages, "file.pdf");
    expect(sources).toEqual([]);
  });
});

describe("chatService.chat", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns reply and tokenUsage on success", async () => {
    mockFetch.mockReturnValueOnce(
      okResponse({
        choices: [{ message: { content: "Hello from AI" } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      })
    );
    const result = await chatService.chat([{ role: "user", content: "Hi" }]);
    expect(result.reply).toBe("Hello from AI");
    expect(result.tokenUsage.totalTokens).toBe(15);
    expect(result.sources).toEqual([]);
  });

  it("throws AppError when OpenRouter response is not ok", async () => {
    mockFetch.mockReturnValueOnce(
      errorResponse({ error: { message: "rate limit" } })
    );
    await expect(chatService.chat([{ role: "user", content: "Hi" }])).rejects.toBeInstanceOf(AppError);
  });

  it("throws AppError when content is empty", async () => {
    mockFetch.mockReturnValueOnce(
      okResponse({ choices: [{ message: { content: "" } }], usage: {} })
    );
    await expect(chatService.chat([{ role: "user", content: "Hi" }])).rejects.toBeInstanceOf(AppError);
  });
});
