"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { documentService } from "@/services/document.service";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadResult {
  filename: string;
  size: number;
  mimetype: string;
  preview: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setStatus("uploading");
    setResult(null);
    setError("");
    try {
      const data = await documentService.upload(file);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
            K
          </div>
          <span className="font-semibold">Knowledge Assistant</span>
          <nav className="flex gap-1 ml-4">
            <a
              href="/chat"
              className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Chat
            </a>
            <a
              href="/documents"
              className="text-sm text-white px-3 py-1.5 rounded-lg bg-gray-800"
            >
              Documents
            </a>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-xl font-semibold mb-6">อัปโหลดเอกสาร</h1>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-500 bg-gray-900"
          }`}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-gray-300 font-medium">วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก</p>
          <p className="text-gray-500 text-sm mt-1">รองรับ PDF และ TXT ขนาดไม่เกิน 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {/* Uploading */}
        {status === "uploading" && (
          <div className="mt-6 flex items-center gap-3 text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">กำลังอัปโหลดและแยกข้อความ...</span>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {status === "success" && result && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <span>✓</span>
              <span>อัปโหลดสำเร็จ</span>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>
                <span className="text-gray-500">ไฟล์:</span>{" "}
                <span className="text-gray-200">{result.filename}</span>
              </p>
              <p>
                <span className="text-gray-500">ขนาด:</span>{" "}
                <span className="text-gray-200">{formatSize(result.size)}</span>
              </p>
              <p>
                <span className="text-gray-500">ประเภท:</span>{" "}
                <span className="text-gray-200">{result.mimetype}</span>
              </p>
            </div>
            {result.preview && (
              <div>
                <p className="text-xs text-gray-500 mb-1">ตัวอย่างเนื้อหา (500 ตัวอักษรแรก)</p>
                <pre className="text-xs text-gray-300 bg-gray-800 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {result.preview}
                </pre>
              </div>
            )}
            <button
              onClick={() => { setStatus("idle"); setResult(null); }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              อัปโหลดไฟล์อื่น
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
