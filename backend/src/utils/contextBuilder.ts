import { SearchResult } from "../services/search.service";

export const buildSystemContext = (results: SearchResult[]): string => {
  if (results.length === 0) return "";

  const chunks = results
    .map((r, i) => `[${i + 1}] (จากไฟล์: ${r.filename})\n${r.text}`)
    .join("\n\n");

  return (
    "คุณคือ Knowledge Assistant ที่ช่วยตอบคำถามจากเอกสารที่ผู้ใช้อัปโหลด\n\n" +
    "เนื้อหาที่เกี่ยวข้องจากเอกสาร:\n" +
    "---\n" +
    chunks +
    "\n---\n\n" +
    "ตอบคำถามโดยอ้างอิงจากเนื้อหาด้านบน ถ้าไม่มีข้อมูลเพียงพอให้แจ้งผู้ใช้ตรงๆ"
  );
};
