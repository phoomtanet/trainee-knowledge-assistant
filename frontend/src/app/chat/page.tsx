"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authService } from "@/services/auth.service";
import { chatService } from "@/services/chat.service";
import { conversationService } from "@/services/conversation.service";
import { ChatMessage, TokenUsage } from "@/types/chat";
import { ConversationSummary } from "@/types/conversation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokenUsage?: TokenUsage;
  sources?: string[];
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "สวัสดีครับ! ผมคือ Knowledge Assistant 👋\nถามคำถามได้เลยครับ ",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    conversationService.list("chat").then(setConversations).catch(() => {});
  }, []);

  const autoSave = useCallback(async (msgs: Message[], convId: string) => {
    const payload = msgs
      .filter((m) => m.id !== "welcome")
      .map(({ role, content, tokenUsage, sources }) => ({ role, content, tokenUsage, sources }));
    try {
      await conversationService.save(convId, payload);
      // refresh list silently
      conversationService.list("chat").then(setConversations).catch(() => {});
    } catch {
      // auto-save failure is non-critical
    }
  }, []);

  const startNewChat = () => {
    setMessages([WELCOME]);
    setActiveConvId(null);
    setTotalTokens(0);
    setInput("");
  };

  const loadConversation = async (id: string) => {
    try {
      const conv = await conversationService.get(id);
      const loaded: Message[] = conv.messages.map((m) => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        tokenUsage: m.tokenUsage,
        sources: m.sources,
      }));
      setMessages(loaded.length ? loaded : [WELCOME]);
      setActiveConvId(id);
      setTotalTokens(
        conv.messages.reduce((sum, m) => sum + (m.tokenUsage?.totalTokens ?? 0), 0)
      );
      setInput("");
    } catch {
      // ignore
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Create conversation on first real message
    let convId = activeConvIdRef.current;
    if (!convId) {
      try {
        const created = await conversationService.create(text, "chat");
        convId = created.id;
        setActiveConvId(created.id);
        setConversations((prev) => [
          { _id: created.id, title: created.title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ...prev,
        ]);
      } catch {
        // continue without saving
      }
    }

    try {
      const history: ChatMessage[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: text });

      const result = await chatService.send(history);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        tokenUsage: result.tokenUsage,
        sources: result.sources,
      };
      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);
      setTotalTokens((prev) => prev + (result.tokenUsage?.totalTokens ?? 0));

      if (convId) await autoSave(finalMessages, convId);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองใหม่อีกครั้ง" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">K</div>
          <span className="font-semibold text-white">Knowledge Assistant</span>
          {totalTokens > 0 && (
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-lg">
              {totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/upload"
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            อัปโหลดเอกสาร
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-60 shrink-0 flex flex-col bg-gray-900 border-r border-gray-800">
            <div className="p-3 border-b border-gray-800">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-6">ยังไม่มีประวัติการสนทนา</p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeConvId === conv._id
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <p className="truncate font-medium leading-snug">{conv.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(conv.updatedAt)}</p>
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Chat panel */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0">
                    AI
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
                        : "bg-gray-800 text-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                          a: ({ href, children }) => <a href={href} className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">{children}</a>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-500 pl-3 text-gray-400 italic my-2">{children}</blockquote>,
                          pre: ({ children }) => <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto my-2 text-xs font-mono">{children}</pre>,
                          code: ({ className, children }) => {
                            const isBlock = /language-/.test(className || "");
                            return isBlock
                              ? <code className={className}>{children}</code>
                              : <code className="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-pink-300">{children}</code>;
                          },
                          table: ({ children }) => <table className="w-full text-xs border-collapse my-2">{children}</table>,
                          th: ({ children }) => <th className="border border-gray-600 px-2 py-1 bg-gray-700 font-semibold text-left">{children}</th>,
                          td: ({ children }) => <td className="border border-gray-600 px-2 py-1">{children}</td>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-1">
                      {msg.sources.map((src) => (
                        <span key={src} className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          📄 {src}
                        </span>
                      ))}
                    </div>
                  )}
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
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mr-2 shrink-0">AI</div>
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
          <form onSubmit={handleSend} className="px-4 pb-6 pt-3 border-t border-gray-800 bg-gray-900 shrink-0">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
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
      </div>
    </div>
  );
}
