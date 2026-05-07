import Link from "next/link";

const features = [
  {
    icon: "💬",
    title: "Chat with AI",
    description: "โต้ตอบกับ AI ได้ทันที ถามตอบเรื่องเอกสารและความรู้ต่างๆ",
  },
  {
    icon: "📄",
    title: "Upload Documents",
    description: "อัปโหลดไฟล์ PDF และ TXT เพื่อให้ AI เรียนรู้จากเอกสารของคุณ",
  },
  {
    icon: "🔍",
    title: "Smart Search",
    description: "ค้นหาข้อมูลจากเอกสารด้วย RAG — ได้คำตอบที่แม่นยำและมีแหล่งอ้างอิง",
  },
  {
    icon: "📊",
    title: "Token Tracking",
    description: "ติดตามการใช้งาน token แบบ real-time เพื่อควบคุมต้นทุน",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="inline-block bg-blue-600/20 text-blue-400 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-500/30">
          Mini Knowledge Assistant
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
          ผู้ช่วยความรู้
          <span className="text-blue-400"> อัจฉริยะ</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          อัปโหลดเอกสาร ถามตอบกับ AI และค้นหาข้อมูลจากไฟล์ของคุณ
          ด้วยเทคโนโลยี RAG ที่แม่นยำ
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-8 py-3 rounded-lg text-base"
          >
            เริ่มต้นใช้งาน →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full mt-20">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left space-y-2 hover:border-gray-700 transition-colors"
          >
            <div className="text-2xl">{feature.icon}</div>
            <h3 className="font-semibold text-white">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
