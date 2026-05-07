import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatService = {
  chat: async (messages: ChatMessage[]): Promise<string> => {
    if (!env.openrouterApiKey) {
      throw new AppError(500, "OpenRouter API key not configured");
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openrouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.openrouterModel,
        messages,
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
