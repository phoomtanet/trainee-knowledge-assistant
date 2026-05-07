"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { chatService } from "@/services/chat.service";
import { documentService } from "@/services/document.service";
import { ChatMessage, TokenUsage } from "@/types/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokenUsage?: TokenUsage;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "สวัสดีครับ! ผมคือ Knowledge Assistant 👋\nอัปโหลดเอกสารหรือถามคำถามได้เลยครับ",
  timestamp: new Date(),
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadLabel, setUploadLabel] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history: ChatMessage[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: text });

      const result = await chatService.send(history);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result.reply, timestamp: new Date(), tokenUsage: result.tokenUsage },
      ]);
      setTotalTokens((prev) => prev + (result.tokenUsage?.totalTokens ?? 0));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองใหม่อีกครั้ง",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploadStatus("uploading");
    setUploadLabel(file.name);

    try {
      const data = await documentService.upload(file);
      setUploadStatus("success");
      setUploadLabel(data.filename);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `อัปโหลด "${data.filename}" สำเร็จแล้วครับ ✓\nคุณสามารถถามคำถามเกี่ยวกับเอกสารนี้ได้เลย`,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (err) {
      setUploadStatus("error");
      setUploadLabel(err instanceof Error ? err.message : "Upload failed");
      setTimeout(() => setUploadStatus("idle"), 4000);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
            K
          </div>
          <span className="font-semibold text-white">Knowledge Assistant</span>
          {totalTokens > 0 && (
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-lg">
              {totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0">
                AI
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.tokenUsage && (
                <p className="text-xs text-gray-500 ml-1">
                  ↑ {msg.tokenUsage.promptTokens} · ↓ {msg.tokenUsage.completionTokens} · total {msg.tokenUsage.totalTokens}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mr-2 shrink-0">
              AI
            </div>
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 pb-6 pt-3 border-t border-gray-800 bg-gray-900"
      >
        {/* Upload status */}
        {uploadStatus !== "idle" && (
          <div
            className={`max-w-4xl mx-auto mb-2 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
              uploadStatus === "uploading"
                ? "bg-gray-800 text-gray-400"
                : uploadStatus === "success"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {uploadStatus === "uploading" && (
              <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {uploadStatus === "success" && <span>✓</span>}
            {uploadStatus === "error" && <span>✕</span>}
            <span className="truncate">{uploadLabel}</span>
          </div>
        )}

        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadStatus === "uploading"}
            title="อัปโหลดเอกสาร PDF/TXT"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as FormEvent);
              }
            }}
            placeholder="พิมพ์คำถาม... (Enter ส่ง, Shift+Enter ขึ้นบรรทัด)"
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors text-sm font-medium shrink-0"
          >
            ส่ง
          </button>
        </div>
      </form>
    </div>
  );
}
