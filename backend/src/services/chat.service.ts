import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";
import { searchService } from "./search.service";
import { buildSystemContext } from "../utils/contextBuilder";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResult {
  reply: string;
  tokenUsage: TokenUsage;
  sources: string[];
}

type OpenRouterMessage = { role: "system" | "user" | "assistant"; content: string };

interface OpenRouterResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

const searchContext = async (messages: ChatMessage[]): Promise<{ context: string; sources: string[] }> => {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return { context: "", sources: [] };
  try {
    const results = await searchService.search(lastUser.content, 3);
    const unique = [...new Set(results.map((r) => r.filename))];
    return { context: buildSystemContext(results), sources: unique };
  } catch {
    return { context: "", sources: [] };
  }
};

export const chatService = {
  chat: async (messages: ChatMessage[]): Promise<ChatResult> => {
    if (!env.openrouterApiKey) {
      throw new AppError(500, "OpenRouter API key not configured");
    }

    const { context, sources } = await searchContext(messages);

    const openRouterMessages: OpenRouterMessage[] = [
      ...(context ? [{ role: "system" as const, content: context }] : []),
      ...messages,
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openrouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.openrouterModel,
        messages: openRouterMessages,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({})) as { error?: { message?: string } };
      throw new AppError(502, error.error?.message || "OpenRouter API error");
    }

    const data = await res.json() as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new AppError(502, "Empty response from AI");

    return {
      reply: content,
      sources,
      tokenUsage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  },
};
