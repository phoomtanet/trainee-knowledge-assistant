"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, DragEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/document.service";
import { chatService } from "@/services/chat.service";
import { authService } from "@/services/auth.service";
import { ChatMessage, TokenUsage } from "@/types/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokenUsage?: TokenUsage;
  sources?: string[];
  type?: "text" | "file";
  fileName?: string;
  fileSize?: number;
  uploadError?: boolean;
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

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

export default function UploadPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [latestFile, setLatestFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading, uploading]);

  const handleUpload = async (file: File) => {
    if (uploading || chatLoading) return;
    setUploading(true);

    const fileMsgId = crypto.randomUUID();
    const fileMsg: Message = {
      id: fileMsgId,
      role: "user",
      type: "file",
      content: `อัปโหลดไฟล์: ${file.name}`,
      fileName: file.name,
      fileSize: file.size,
    };
    setMessages((prev) => [...prev, fileMsg]);

    try {
      await documentService.upload(file);
      const displayName = file.name;
      setLatestFile(displayName);
      setUploading(false);

      setChatLoading(true);
      try {
        // Include the full conversation history so the AI has context about the uploaded file
        const history: ChatMessage[] = messages
          .filter((m) => m.id !== "system")
          .map((m) => ({ role: m.role, content: m.content }));
        
        // Add the analysis request
        history.push({ role: "user", content: `ฉันได้อัปโหลดไฟล์ "${displayName}" แล้ว กรุณาสรุปเนื้อหาสำคัญในไฟล์นี้ให้กระชับ` });
        
        const result = await chatService.send(history);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.reply,
            tokenUsage: result.tokenUsage,
            sources: result.sources,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `อัปโหลด **${displayName}** สำเร็จแล้วครับ ✓\nสามารถถามคำถามเกี่ยวกับเอกสารได้เลย`,
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    } catch (err) {
      setUploading(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === fileMsgId ? { ...m, uploadError: true } : m))
      );
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
    if (!text || chatLoading || uploading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatLoading(true);

    try {
      const history: ChatMessage[] = messages
        .filter((m) => m.type !== "file")
        .map((m) => ({ role: m.role, content: m.content }));

      const queryText = latestFile
        ? `[กรุณาตอบโดยอ้างอิงจากเอกสาร "${latestFile}" เป็นหลัก] ${text}`
        : text;
      history.push({ role: "user", content: queryText });

      const result = await chatService.send(history);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply,
          tokenUsage: result.tokenUsage,
          sources: result.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อ AI ได้" },
      ]);
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
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">K</div>
          <span className="font-semibold">Document Q&amp;A</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            แชท
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !uploading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-3xl">
              📄
            </div>
            <p className="text-gray-400 text-sm">
              อัปโหลดไฟล์ PDF หรือ TXT เพื่อเริ่มต้น<br />
              หรือลากไฟล์มาวางที่นี่
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0">
                AI
              </div>
            )}
            <div className="flex flex-col gap-1 max-w-[70%]">
              {msg.type === "file" ? (
                <div
                  className={`px-4 py-3 rounded-2xl border ${
                    msg.uploadError
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-blue-600/20 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{msg.uploadError ? "❌" : "📄"}</span>
                    <span className={`font-medium text-sm truncate max-w-[200px] ${msg.uploadError ? "text-red-300" : "text-white"}`}>
                      {msg.fileName}
                    </span>
                    {!msg.uploadError && msg.fileName === latestFile && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                        ใช้งานอยู่
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${msg.uploadError ? "text-red-400" : "text-blue-300"}`}>
                    {msg.uploadError ? "อัปโหลดล้มเหลว" : formatSize(msg.fileSize ?? 0)}
                  </span>
                </div>
              ) : (
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              )}

              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-1">
                  {msg.sources.map((src) => (
                    <span
                      key={src}
                      className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full"
                    >
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

        {/* Upload loading bubble */}
        {uploading && (
          <div className="flex justify-end">
            <div className="bg-blue-600/20 border border-blue-500/30 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm text-blue-300">
              <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
              กำลังอัปโหลดและสร้าง embeddings...
            </div>
          </div>
        )}

        {/* AI thinking bubble */}
        {chatLoading && (
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

      {/* Drag overlay */}
      {dragging && (
        <div className="fixed inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-2xl m-4 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center">
            <span className="text-4xl mb-2 block">📄</span>
            <p className="text-white font-medium text-lg">วางไฟล์เพื่ออัปโหลด</p>
            <p className="text-gray-300 text-sm">รองรับ PDF และ TXT</p>
          </div>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="px-4 pb-6 pt-3 border-t border-gray-800 bg-gray-900 shrink-0">
        {latestFile && (
          <div className="max-w-4xl mx-auto mb-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">โฟกัส:</span>
            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              📄 {latestFile}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || chatLoading}
            title="อัปโหลดไฟล์ PDF/TXT"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
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
            placeholder={latestFile ? `ถามเกี่ยวกับ ${latestFile}...` : "อัปโหลดไฟล์ก่อน หรือถามคำถามได้เลย..."}
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatLoading || uploading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors text-sm font-medium shrink-0"
          >
            ส่ง
          </button>
        </div>
      </form>
    </div>
  );
}
