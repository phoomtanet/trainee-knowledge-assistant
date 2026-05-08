import { Response, NextFunction } from "express";
import { chatService, ChatMessage } from "../services/chat.service";
import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";
import { sendSuccess } from "../utils/response";
import { AuthRequest } from "../middlewares/auth.middleware";

export const chatController = {
  chat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { messages, filename } = req.body as { messages: ChatMessage[]; filename?: string };

      if (!Array.isArray(messages) || messages.length === 0) {
        throw new AppError(400, "Messages are required");
      }

      const result = await chatService.chat(messages, filename);
      sendSuccess(res, { reply: result.reply, sources: result.sources, tokenUsage: result.tokenUsage });
    } catch (err) {
      next(err);
    }
  },

  streamChat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { messages, filename } = req.body as { messages: ChatMessage[]; filename?: string };

    if (!Array.isArray(messages) || messages.length === 0) {
      return next(new AppError(400, "Messages are required"));
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      const { openRouterMessages, sources } = await chatService.prepareMessages(messages, filename);

      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.openrouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: env.openrouterModel, messages: openRouterMessages, stream: true }),
      });

      if (!orRes.ok || !orRes.body) {
        const err = await orRes.json().catch(() => ({})) as { error?: { message?: string } };
        send({ type: "error", message: err.error?.message || "OpenRouter API error" });
        res.end();
        return;
      }

      const reader = orRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            send({ type: "done", sources, tokenUsage });
            res.end();
            return;
          }
          try {
            const chunk = JSON.parse(raw) as {
              choices?: { delta?: { content?: string } }[];
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
            };
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) send({ type: "token", content });
            if (chunk.usage) {
              tokenUsage = {
                promptTokens: chunk.usage.prompt_tokens ?? 0,
                completionTokens: chunk.usage.completion_tokens ?? 0,
                totalTokens: chunk.usage.total_tokens ?? 0,
              };
            }
          } catch { /* skip malformed chunk */ }
        }
      }

      send({ type: "done", sources, tokenUsage });
      res.end();
    } catch (err) {
      send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
      res.end();
    }
  },
};
