import { ChatMessage } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const chatService = {
  send: async (messages: ChatMessage[]): Promise<string> => {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Chat failed");
    return data.data.reply as string;
  },
};
