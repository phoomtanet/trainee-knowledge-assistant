import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";
import { searchService } from "./search.service";
import { buildSystemContext } from "../utils/contextBuilder";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type OpenRouterMessage = { role: "system" | "user" | "assistant"; content: string };

const searchContext = async (messages: ChatMessage[]): Promise<string> => {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "";
  try {
    const results = await searchService.search(lastUser.content, 3);
    return buildSystemContext(results);
  } catch {
    // Qdrant not ready or collection missing — proceed without context
    return "";
  }
};

export const chatService = {
  chat: async (messages: ChatMessage[]): Promise<string> => {
    if (!env.openrouterApiKey) {
      throw new AppError(500, "OpenRouter API key not configured");
    }

    const context = await searchContext(messages);

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

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new AppError(502, "Empty response from AI");
    return content;
  },
};
