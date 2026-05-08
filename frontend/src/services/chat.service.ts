import { ChatMessage, TokenUsage, StreamEvent } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const chatService = {
  send: async (messages: ChatMessage[], filename?: string): Promise<{ reply: string; tokenUsage: TokenUsage; sources: string[] }> => {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, ...(filename && { filename }) }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Chat failed");
    return {
      reply: data.data.reply as string,
      tokenUsage: data.data.tokenUsage as TokenUsage,
      sources: (data.data.sources as string[]) ?? [],
    };
  },

  async *stream(messages: ChatMessage[], filename?: string): AsyncGenerator<StreamEvent> {
    const res = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, ...(filename && { filename }) }),
      credentials: "include",
    });

    if (!res.ok || !res.body) throw new Error("Stream failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          yield JSON.parse(line.slice(6)) as StreamEvent;
        } catch { /* skip malformed */ }
      }
    }
  },
};
