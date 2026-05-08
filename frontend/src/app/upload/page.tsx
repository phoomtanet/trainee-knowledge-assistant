"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, DragEvent, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/document.service";
import { chatService } from "@/services/chat.service";
import { conversationService } from "@/services/conversation.service";
import { authService } from "@/services/auth.service";
import { ChatMessage, TokenUsage } from "@/types/chat";
import { ConversationSummary } from "@/types/conversation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokenUsage?: TokenUsage;
  sources?: string[];
  isStreaming?: boolean;
}

type ChildProps = { children?: React.ReactNode };
type AnchorProps = { href?: string; children?: React.ReactNode };
type CodeProps = { className?: string; children?: React.ReactNode };

const MD_COMPONENTS = {
  p: ({ children }: ChildProps) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }: ChildProps) => <h1 className="text-base font-bold mb-2">{children}</h1>,
  h2: ({ children }: ChildProps) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
  h3: ({ children }: ChildProps) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
  ul: ({ children }: ChildProps) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }: ChildProps) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }: ChildProps) => <li>{children}</li>,
  strong: ({ children }: ChildProps) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }: ChildProps) => <em className="italic text-gray-300">{children}</em>,
  a: ({ href, children }: AnchorProps) => (
    <a href={href} className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  blockquote: ({ children }: ChildProps) => (
    <blockquote className="border-l-2 border-gray-500 pl-3 text-gray-400 italic my-2">{children}</blockquote>
  ),
  pre: ({ children }: ChildProps) => (
    <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto my-2 text-xs font-mono">{children}</pre>
  ),
  code: ({ className, children }: CodeProps) => {
    const isBlock = /language-/.test(className || "");
    return isBlock
      ? <code className={className}>{children}</code>
      : <code className="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-pink-300">{children}</code>;
  },
  table: ({ children }: ChildProps) => <table className="w-full text-xs border-collapse my-2">{children}</table>,
  th: ({ children }: ChildProps) => <th className="border border-gray-600 px-2 py-1 bg-gray-700 font-semibold text-left">{children}</th>,
  td: ({ children }: ChildProps) => <td className="border border-gray-600 px-2 py-1">{children}</td>,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export default function UploadPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const activeFileRef = useRef<string | null>(null);

  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);
  useEffect(() => { activeFileRef.current = activeFile; }, [activeFile]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading, uploading]);
  useEffect(() => { conversationService.list("document").then(setConversations).catch(() => {}); }, []);

  const autoSave = useCallback(async (msgs: Message[], convId: string) => {
    const payload = msgs.map(({ role, content, tokenUsage, sources }) => ({ role, content, tokenUsage, sources }));
    try {
      await conversationService.save(convId, payload);
      conversationService.list("document").then(setConversations).catch(() => {});
    } catch { /* non-critical */ }
  }, []);

  const startNewChat = () => {
    setMessages([]);
    setActiveFile(null);
    setActiveConvId(null);
    setTotalTokens(0);
    setInput("");
  };

  const loadConversation = async (conv: ConversationSummary) => {
    try {
      const detail = await conversationService.get(conv._id);
      const loaded: Message[] = detail.messages.map((m) => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        tokenUsage: m.tokenUsage,
        sources: m.sources,
      }));
      setMessages(loaded);
      setActiveConvId(conv._id);
      setActiveFile(detail.lastUploadedFile ?? null);
      setTotalTokens(detail.messages.reduce((s, m) => s + (m.tokenUsage?.totalTokens ?? 0), 0));
      setInput("");
    } catch { /* ignore */ }
  };

  const handleUpload = async (file: File) => {
    if (uploading || chatLoading) return;
    setUploading(true);

    try {
      const result = await documentService.upload(file);
      const filename = result.filename ?? file.name;
      setActiveFile(filename);

      // create or update conversation
      let convId = activeConvIdRef.current;
      if (!convId) {
        const created = await conversationService.create(filename, "document");
        convId = created.id;
        setActiveConvId(convId);
        setConversations((prev) => [
          { _id: convId!, title: created.title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastUploadedFile: filename },
          ...prev,
        ]);
      }
      await conversationService.updateFile(convId, filename);

      setUploading(false);

      // AI auto-summary
      setChatLoading(true);
      try {
        const history: ChatMessage[] = [
          { role: "user", content: `ฉันได้อัปโหลดไฟล์ "${filename}" แล้ว กรุณาสรุปเนื้อหาสำคัญให้กระชับ` },
        ];
        const res = await chatService.send(history, filename);
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.reply,
          tokenUsage: res.tokenUsage,
          sources: res.sources,
        };
        const nextMsgs = [...messages, aiMsg];
        setMessages(nextMsgs);
        setTotalTokens((t) => t + (res.tokenUsage?.totalTokens ?? 0));
        if (convId) await autoSave(nextMsgs, convId);
      } catch {
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `อัปโหลด **${filename}** สำเร็จแล้ว ✓\nสามารถถามคำถามเกี่ยวกับเอกสารได้เลยครับ`,
        };
        const nextMsgs = [...messages, aiMsg];
        setMessages(nextMsgs);
        if (convId) await autoSave(nextMsgs, convId);
      } finally {
        setChatLoading(false);
      }
    } catch (err) {
      setUploading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `อัปโหลดล้มเหลว: ${err instanceof Error ? err.message : "เกิดข้อผิดพลาด"}`,
        },
      ]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await handleUpload(file);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleUpload(file);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || chatLoading || uploading || !activeFile) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setChatLoading(true);

    let convId = activeConvIdRef.current;
    if (!convId) {
      try {
        const created = await conversationService.create(text, "document");
        convId = created.id;
        setActiveConvId(convId);
        setConversations((prev) => [
          { _id: convId!, title: created.title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ...prev,
        ]);
        if (activeFileRef.current) await conversationService.updateFile(convId, activeFileRef.current);
      } catch { /* continue */ }
    }

    const aiMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "", isStreaming: true }]);

    try {
      const history: ChatMessage[] = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      let fullContent = "";
      let finalMessages: Message[] = [];

      for await (const event of chatService.stream(history, activeFileRef.current ?? undefined)) {
        if (event.type === "token") {
          fullContent += event.content;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: fullContent } : m))
          );
        } else if (event.type === "done") {
          setMessages((prev) => {
            const updated = prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: fullContent, tokenUsage: event.tokenUsage, sources: event.sources, isStreaming: false }
                : m
            );
            finalMessages = updated;
            return updated;
          });
          setTotalTokens((t) => t + (event.tokenUsage?.totalTokens ?? 0));
          if (convId) await autoSave(finalMessages, convId);
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: "เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ AI ได้", isStreaming: false }
            : m
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <div
      className="flex flex-col h-screen bg-gray-950 text-white"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-bold">D</div>
          <span className="font-semibold">Document Q&amp;A</span>
          {totalTokens > 0 && (
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-lg">
              {totalTokens.toLocaleString()} tokens
            </span>
          )}
          {activeFile && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              📄 {activeFile}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/chat" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
            แชท
          </Link>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
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
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-6">ยังไม่มีประวัติ</p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => loadConversation(conv)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeConvId === conv._id ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {conv.lastUploadedFile && <span className="text-xs">📄</span>}
                    <p className="truncate font-medium leading-snug">{conv.title}</p>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(conv.updatedAt)}</p>
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

            {/* Upload zone — shown when no file in this conversation */}
            {!activeFile && !uploading && (
              <div className="flex flex-col items-center justify-center h-full gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-3xl">
                  📄
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">อัปโหลดไฟล์เพื่อเริ่มต้น</p>
                  <p className="text-gray-400 text-sm">รองรับ PDF และ TXT · ลากไฟล์มาวางที่นี่ได้เลย</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  เลือกไฟล์
                </button>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0">
                    AI
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[70%]">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
                        : "bg-gray-800 text-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "user" ? msg.content
                      : msg.isStreaming && !msg.content ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      ) : (
                        <>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                            {msg.content}
                          </ReactMarkdown>
                          {msg.isStreaming && <span className="inline-block w-0.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />}
                        </>
                      )}
                  </div>
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-1">
                      {msg.sources.map((src) => (
                        <span key={src} className="inline-flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
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

            {uploading && (
              <div className="flex justify-center">
                <div className="bg-emerald-600/20 border border-emerald-500/30 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm text-emerald-300">
                  <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  กำลังอัปโหลดและสร้าง embeddings...
                </div>
              </div>
            )}


            <div ref={bottomRef} />
          </main>

          {/* Input bar */}
          <form onSubmit={handleSend} className="px-4 pb-6 pt-3 border-t border-gray-800 bg-gray-900 shrink-0">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              {activeFile && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || chatLoading}
                  title="เปลี่ยนไฟล์"
                  className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as unknown as FormEvent);
                  }
                }}
                disabled={!activeFile || uploading}
                placeholder={activeFile ? `ถามเกี่ยวกับ ${activeFile}...` : "อัปโหลดไฟล์ก่อนเพื่อเริ่มถามคำถาม"}
                rows={1}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || chatLoading || uploading || !activeFile}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors text-sm font-medium shrink-0"
              >
                ส่ง
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Drag overlay */}
      {dragging && (
        <div className="fixed inset-0 bg-emerald-500/10 border-2 border-emerald-500 border-dashed rounded-2xl m-4 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center">
            <span className="text-4xl mb-2 block">📄</span>
            <p className="text-white font-medium text-lg">วางไฟล์เพื่ออัปโหลด</p>
            <p className="text-gray-300 text-sm">รองรับ PDF และ TXT</p>
          </div>
        </div>
      )}
    </div>
  );
}
