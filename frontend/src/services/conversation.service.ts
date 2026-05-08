import { ConversationDetail, ConversationMessage, ConversationSummary } from "@/types/conversation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json.data as T;
}

export const conversationService = {
  create: (firstMessage?: string, type: "chat" | "document" = "chat") =>
    request<{ id: string; title: string }>("/conversations", {
      method: "POST",
      body: JSON.stringify({ firstMessage, type }),
    }),

  save: (id: string, messages: ConversationMessage[]) =>
    request<{ id: string }>(`/conversations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ messages }),
    }),

  list: (type: "chat" | "document" = "chat") =>
    request<ConversationSummary[]>(`/conversations?type=${type}`),

  get: (id: string) => request<ConversationDetail>(`/conversations/${id}`),

  updateFile: (id: string, filename: string) =>
    request<{ id: string }>(`/conversations/${id}/file`, {
      method: "PATCH",
      body: JSON.stringify({ filename }),
    }),
};
