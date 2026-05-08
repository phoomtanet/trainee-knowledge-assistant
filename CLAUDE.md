# Project Overview

Project Name: mini knowledge assistant

## Tech Stack

* Next.js 14
* Tailwind CSS
* shadcn/ui
* Node.js Express.js
* MongoDB
* LangChain
* Qdrant

---

# Requirements

1. Login page
2. Chat with AI
3. Upload PDF/TXT
4. RAG document search
5. Token usage tracking

---

# Coding Rules

* Use TypeScript
* Use clean architecture
* Avoid god files
* Use service/repository pattern
* Use async/await
* Use environment variables

---

# AI Working Rules

* Before starting ANY session, read `PROJECT.md` to understand the current project structure
* Keep `PROJECT.md` updated when making structural changes
* Work only ONE task at a time
* Do NOT skip tasks
* Before starting a task:

  * read and analyze the task
  * create a checklist automatically
* Execute checklist step-by-step
* After completing each item:

  * mark it as completed using `[x]`
* Do NOT mark unfinished items
* After task completion:

  * summarize completed work
  * suggest git commit message
* Append task history into `trainee-knowledge-assistant/AI_JOURNAL.md`

 * Do NOT modify unrelated files
* Always follow task order from top to bottom
* Continuously update checklist progress during execution

---

# Additional Rules

* Do NOT create unnecessary files
* Do NOT install unnecessary packages
* Keep architecture simple and scalable
* Use feature-based structure when appropriate
* Explain important decisions briefly
* Use clean and readable naming conventions
* Keep files small and modular
* Separate UI, business logic, and API logic clearly
* Always use TypeScript types/interfaces
* Use reusable components whenever possible
* Never hardcode secrets or API keys
* Use `.env` for environment variables
* Generate production-ready code
* Keep the implementation junior-friendly

---

# Output Rules

After task completion, always provide:

1. Updated checklist
2. Files/folders created
3. Important implementation notes
4. Suggested git commit
5. AI_JOURNAL.md entry


---


# Session Rules

1. Sessions marked with `[ ]` = pending session
2. Sessions marked with `[x]` = fully completed session that can be skipped without reading

* If a session contains `[x]`:

  * do NOT read the session
  * do NOT execute the session
  * skip immediately to the next available pending session

* Only work on the first available pending session `[ ]`

* Never work on multiple sessions at the same time

---

# AI_JOURNAL.md Format

Use this format:

```md id="nnm6up"
## Session 1

**Prompt:**
[prompt used]

**AI Response:**
[summary of generated code/config/structure]

**My Adjustment:**
[manual improvements, fixes, refactors, architecture decisions]
```

---

# Task





## Session 1 — Create the latest Next.js project structure [x]

```txt id="tl1gku"
frontend/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── services/
│   ├── stores/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   ├── config/
│   └── middleware.ts
│
├── docker/
│   └── nginx/
│       └── default.conf
│
├── .env.local
├── .env.example
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── package.json
└── README.md
```

---

## Session 2 — Create Service Layer [x]

Create a clean and scalable service layer for the application.

Requirements:

Create reusable service structure
Separate API logic from UI components
Create centralized API/client configuration
Prepare scalable architecture for future features
Handle API requests and responses cleanly
Handle errors consistently
Support environment variables/configuration
Keep implementation modular and maintainable

Architecture:

Separate services by feature/domain
Separate API client configuration into dedicated files
Separate request/response types into type files
Keep services reusable and scalable
Avoid duplicated request logic
Keep files small and focused on single responsibility


Structure
backend/
├── src/
│
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middlewares/
│   ├── lib/
│   ├── utils/
│   ├── types/
│   ├── constants/
│
│   ├── app.ts
│   └── server.ts
│
├── uploads/
├── docker/
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
Architecture Flow
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
Responsibility
routes/ → API endpoints
controllers/ → request/response handling
services/ → business logic
repositories/ → database queries
models/ → database schema/models
middlewares/ → auth/error/upload middleware
lib/ → external clients/config
utils/ → helper functions
types/ → TypeScript types/interfaces
constants/ → constant values/config
Add .gitkeep to the empty structure.


---

## Session 3 — Create Structure  Infomation File [x]
 - ใช่สำหรับให้ ai อ่านไฟล์ แล้วเข้าใจโครงสร้างของโปรเจค เพื่อให้พัฒนาระบบได้ง่ายขึ้น

---

## Session 4 — Create flow login [x]

หน้า /login
username/password
loading + error message
seed user data
admin / admin123
password hash ด้วย bcrypt
Database users 
API Login
ตรวจ username/password
generate JWT
เก็บ JWT ใน httpOnly cookie
Protected Routes
Middleware เช็ค login
Logout API
ลบ cookie
Validation
required fields
sanitize input
Security พื้นฐาน
bcrypt
env variables
rate limit login
Refresh token

---


## Session 5 — Create Chat UI  [x]
= สร้าง ui หน้า  Chat UI ตกแต่งล้ำสมัย
- เมื่อlogin ผ่านให้ไปหน้า Chat UI 
  ## 5.1 fix
- fix 1 : E:\project\trainee-knowledge-assistant\frontend\src\app\page.tsx  กดแล้วไม่ไปหน้า login
- fix 2 : E:\project\trainee-knowledge-assistant\frontend\src\app\chat\page.tsx  กดออกจากระบบไม่ได้ ปรับให้ทำงานได้ 

---


## Session 6 —  Chat Bot Api [x]
- สร้าง api สำหรับหน้า Chat บอท
- โดยใช้  key OPENROUTER_API_KEY และ โมเดล OPENROUTER_MODEL  จาก.env
- Chat UI เชื่อมกับ api ให้ถามตอบได้ 

---


## Session 7 — Upload Document And RAG Preparation [x]

Create document upload and preparation flow for future RAG functionality.

Requirements:

Create upload API for PDF/TXT files
Validate file type and file size
Sanitize upload path and filenames
Save uploaded files safely
Parse text from PDF/TXT files
Prepare document text for future chunking/embedding
Keep implementation modular and scalable
Handle upload and parsing errors properly

Architecture:

Separate routes, controllers, and services clearly
Separate upload logic from parsing logic
Separate reusable helper functions into utils/
Separate request/response types into dedicated files
Keep files reusable and focused on single responsibility
Avoid duplicated logic

Suggested Flow:

Upload File
    ↓
Validate File
    ↓
Save File
    ↓
Parse Text
    ↓
Return Parsed Content

Suggested Structure:

backend/src/
├── routes/
├── controllers/
├── services/
├── middlewares/
├── utils/
├── types/
└── lib/

Technical Requirements:

Use TypeScript
Use async/await
Use multer for upload handling
Use pdf-parse for PDF parsing
Support TXT file parsing
Use environment variables when needed
Handle invalid files safely

Frontend Requirements:

Create upload UI
Allow selecting PDF/TXT files
Show upload loading state
Show upload success/error state
Keep UI reusable and modular

  ##  7.1 fix
- fix 1: ส่วนของ uplaod documents ใหย้ายอยู่หน้า E:\project\trainee-knowledge-assistant\frontend\src\app\chat\page.tsx 
  ให้มีปุ่ม upload ข้าง input chat  เหมือนแชตบอททั่วไป
- fix 2: แก้ erorr 2026-05-07 23:25:41 Server running on port 4000
2026-05-07 23:28:56 TypeError: pdfParse is not a function
2026-05-07 23:28:56     at parsePdf (/app/dist/utils/fileParser.js:13:26)
2026-05-07 23:28:56     at async Object.parse (/app/dist/services/document.service.js:10:20)
2026-05-07 23:28:56     at async upload (/app/dist/controllers/document.controller.js:12:28)
ขึ้นตอนอัปโหลดไฟล์

---

## Session 8 — Vector Embedding And Qdrant Integration [x]

Create vector embedding and retrieval flow for RAG functionality.

Requirements:

Split parsed document text into chunks
Generate embeddings from document chunks
Store embeddings into Qdrant vector database
Create reusable vector search functionality
Retrieve relevant document chunks from user questions
Prepare scalable RAG architecture
Keep implementation modular and maintainable
Handle embedding/search errors properly

Architecture:

Separate embedding logic from upload logic
Separate vector database logic into dedicated services/lib
Separate chunking utilities into utils/
Separate request/response types into dedicated files
Keep files reusable and focused on single responsibility
Avoid duplicated logic

Technical Requirements:

Use TypeScript
Use async/await
Use LangChain
Use Qdrant
Use environment variables
Keep chunking reusable
Keep vector search reusable
Handle invalid embedding responses safely


---

## Session 9 — RAG Chat Integration [x]

เชื่อม Vector Search เข้ากับ Chat API เพื่อให้ AI ตอบคำถามจากเนื้อหาเอกสารที่อัปโหลดได้

Requirements:

- เมื่อ user ส่ง message ให้ค้นหา document chunks ที่เกี่ยวข้องจาก Qdrant ก่อน
- นำ chunks ที่ได้มาสร้างเป็น system context ส่งให้ AI
- ถ้าไม่มี document ใน Qdrant ให้ AI ตอบตามปกติ (ไม่ error)
- Chat UI แสดงผลตามปกติ ไม่ต้องเปลี่ยน UI

Architecture:

- แก้ chat.service.ts (backend) — ก่อน call AI ให้ search Qdrant แล้ว inject context
- แยก logic การสร้าง system prompt ออกเป็น util

Technical Requirements:

- Use searchService ที่สร้างใน Session 8
- Inject context เป็น system message ก่อน user messages
- Handle กรณีที่ Qdrant ยังไม่มี collection หรือ search ล้มเหลว (fallback ตอบปกติ)
- ไม่แก้ frontend

---

## Session 10 — Token Usage Counter [x]

เมื่อพิมแชต ให้แสดง Token Usage Counter

Requirements:

- Backend ดึง token usage จาก OpenRouter API response (prompt_tokens, completion_tokens, total_tokens)
- Return token usage กลับมาพร้อม reply ใน chat response
- Frontend แสดง token usage ของแต่ละ message ใต้ bubble ของ AI
- แสดงสะสม total tokens ที่ใช้ใน session ที่ header หรือ input bar

---

## Session 11 — Docker Healthcheck [x]

เพิ่ม healthcheck ให้ทุก service ใน docker-compose.yml

Requirements:

- เพิ่ม `healthcheck` ให้ครบทุก service: backend, frontend, mongodb, qdrant
- backend: GET /api/health → 200 OK
- frontend: GET / → 200 OK
- mongodb: mongosh ping
- qdrant: GET /healthz → 200 OK
- ใช้ `depends_on` + `condition: service_healthy` เพื่อให้ backend รอ mongodb และ qdrant พร้อมก่อน
- สร้าง health endpoint ใน backend (`GET /api/health`)

---

## Session 12 — Markdown Rendering [x]

แสดง Markdown ในคำตอบของ AI

Requirements:

- ติดตั้ง `react-markdown` และ `remark-gfm`
- wrap AI bubble content ด้วย `<ReactMarkdown>` แทนการแสดง plain text
- รองรับ: bold, italic, code block, inline code, list, heading, table
- style ให้เข้ากับ dark theme ของ chat UI
- ไม่แก้ backend

---

## Session 13 — Rate Limiting [x]

เพิ่ม rate limiting ให้ครอบคลุม chat และ upload

Requirements:

- ติดตั้ง `express-rate-limit`
- login มี rate limit อยู่แล้ว — เพิ่ม limit ให้ route `/api/chat` และ `/api/documents/upload`
- chat: 30 requests / 1 นาที ต่อ IP
- upload: 10 requests / 1 นาที ต่อ IP
- ตอบ 429 Too Many Requests พร้อม message ที่อ่านง่าย
- แยก limiter config ออกเป็น middleware ของตัวเอง

---

## Session 14 — Citation [X]

แสดงที่มาของคำตอบ AI จากเอกสารที่อัปโหลด

Requirements:

- Backend: หลัง search Qdrant ให้ return ชื่อไฟล์ที่ใช้เป็น context กลับมาพร้อม reply
- เพิ่ม `sources: string[]` ใน ChatResult (backend) และ response
- Frontend: ถ้า sources มีค่า ให้แสดงใต้ AI bubble เป็น badge/chip เช่น `📄 document.pdf`
- ถ้าไม่มี sources (AI ตอบจากความรู้ตัวเอง) ไม่ต้องแสดงอะไร

---

## Session 15 — Separate Upload Page [x]

แยก Upload Document ออกมาเป็นหน้าของตัวเอง `/upload` และลบ upload feature ออกจาก Chat Page

Requirements:

- สร้างหน้า `/upload` สำหรับ upload PDF/TXT โดยเฉพาะ
- UI หน้า upload: drag & drop zone หรือ file picker, แสดง loading, success, error state
- แสดงชื่อไฟล์และจำนวน chunks ที่ embedded หลัง upload สำเร็จ
- ลบปุ่ม upload (paperclip icon) และ hidden file input ออกจาก Chat Page (`chat/page.tsx`)
- เพิ่ม navigation link ไปหน้า Upload ใน Chat header
- Protected route — ต้อง login ก่อน

---

## Session 16 — Unit Tests [x]

เขียน unit test ให้ได้ coverage ≥ 40%

Requirements:

- ติดตั้ง `jest`, `ts-jest`, `@types/jest` ใน backend
- เขียน test สำหรับ:
  - `utils/contextBuilder.ts`
  - `utils/textChunker.ts`
  - `services/chat.service.ts` (mock fetch)
  - `services/embedding.service.ts` (mock embedder + qdrant)
  - `middlewares/errorHandler.ts`
- ตั้งค่า jest coverage threshold ≥ 40%
- เพิ่ม script `test` และ `test:coverage` ใน package.json
- ไม่ต้องเขียน test ฝั่ง frontend

---

## Session 17 — Conversation History [x]

บันทึกและโหลดประวัติการสนทนา

Requirements:

- สร้าง `Conversation` model ใน MongoDB (userId, title, type, messages[], lastUploadedFile?, timestamps)
- เพิ่ม field `type: "chat" | "document"` เพื่อแยกประวัติแชตบอทออกจากประวัติเอกสาร
- API:
  - `POST /api/conversations` — สร้าง conversation (รับ `type` จาก body)
  - `GET /api/conversations?type=chat|document` — ดึงรายการ conversations ของ user แยก type
  - `GET /api/conversations/:id` — โหลด conversation
  - `PUT /api/conversations/:id` — บันทึก messages
  - `PATCH /api/conversations/:id/file` — อัปเดต lastUploadedFile
- Frontend Chat (`/chat`):
  - แสดง sidebar รายการ conversations (type=chat)
  - ปุ่ม "New Chat" สร้าง conversation ใหม่
  - auto-save หลังทุก AI reply
  - load conversation → restore messages
- Frontend Upload (`/upload`):
  - แยกประวัติเป็น type=document
  - sidebar แสดงรายการ conversations พร้อม icon 📄
  - ต้อง upload ไฟล์ก่อนถึงจะพิมพ์ได้
  - AI ตอบโดย RAG เฉพาะไฟล์ที่อัปโหลดในห้องนั้น (filter by filename ใน Qdrant)
  - auto-save หลังทุก AI reply
  - load conversation → restore messages และ activeFile
- Chat service ใช้ RAG เมื่อมี filename ส่งมา ไม่มีก็ตอบปกติ

---

## Session 18 — Streaming Response [X]

แสดงคำตอบ AI แบบ streaming (ทีละ token)

Requirements:

- Backend: เปลี่ยน `/api/chat` ให้ส่ง Server-Sent Events (SSE) แทน JSON เดิม
- ใช้ OpenRouter streaming API (`stream: true` ใน request body)
- parse `data: {...}` chunks แล้ว stream กลับไป client ทีละ chunk
- Frontend: ใช้ `fetch` + `ReadableStream` รับ SSE
- แสดงข้อความ AI ที่กำลัง stream ใน bubble แบบ typewriter effect
- token usage ยังแสดงได้เมื่อ stream จบ (จาก `[DONE]` event)
