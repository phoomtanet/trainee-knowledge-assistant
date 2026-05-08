## Session 1

**Prompt:**
สร้างโครงสร้าง Next.js project ตาม spec ใน CLAUDE.md — frontend/ directory พร้อม App Router, TypeScript, Tailwind CSS และ Docker setup

**AI Response:**
- Scaffolded Next.js 14.2.35 ด้วย `create-next-app` (TypeScript + Tailwind + App Router + src/)
- สร้าง directories ใน `src/`: components, features, services, stores, hooks, lib, providers, types, constants, utils, config
- สร้าง `src/middleware.ts` (pass-through, พร้อมขยายในภายหลัง)
- สร้าง `docker/nginx/default.conf` — reverse proxy ไปยัง Next.js container port 3000
- สร้าง `Dockerfile` (multi-stage: deps → builder → runner) ใช้ standalone output
- สร้าง `docker-compose.yml` — services: frontend + nginx
- สร้าง `.dockerignore`, `.env.local`, `.env.example`
- สร้าง `next.config.js` (แทน `.mjs`) พร้อม `output: "standalone"` สำหรับ Docker
- สร้าง `prettier.config.js` พร้อม prettier-plugin-tailwindcss
- สร้าง `eslint.config.js` (flat config format) ด้วย `FlatCompat` แทน `.eslintrc.json`
- อัปเดต `tailwind.config.ts` ให้ใช้ `./src/**/*` แทน path เฉพาะ

**My Adjustment:**
- ย้าย `Dockerfile` และ `docker-compose.yml` ออกจาก `frontend/` ไปที่ project root เพื่อรองรับ monorepo structure (frontend + backend)
- อัปเดต `docker-compose.yml`: build context เป็น `./frontend`, env_file เป็น `./frontend/.env.local`, nginx volume path เป็น `./frontend/docker/nginx/default.conf`
- แทนที่ default Next.js template page ด้วยหน้า Get Started — hero section + feature cards 4 รายการ (Chat, Upload, Search, Token Tracking)
- ลบ external image URLs ใช้ emoji แทนเพื่อไม่ต้องพึ่ง remotePatterns
- ปุ่ม "เริ่มต้นใช้งาน" link ไปที่ `/login` พร้อมสำหรับ Session ถัดไป
- เพิ่ม `.gitkeep` ใน 11 directories ว่างใน `src/` เพื่อให้ git track โครงสร้างได้แม้ยังไม่มีไฟล์จริง

**Git Commit:**
```
feat: scaffold Next.js 14 frontend structure and add get started page

- Initialize Next.js 14 with TypeScript, Tailwind CSS, App Router
- Add feature-based src directories (features, services, stores, etc.)
- Add Docker setup with multi-stage Dockerfile and nginx reverse proxy
- Add eslint flat config, prettier config, and environment templates
- Replace default template with Get Started landing page
- Initialize git at project root with monorepo .gitignore

```

---

## Session 2

**Prompt:**
สร้าง backend service layer ตาม architecture ใน CLAUDE.md — Express.js + TypeScript + clean architecture

**AI Response:**
- สร้าง `backend/` directory structure ครบตาม spec: config, routes, controllers, services, repositories, models, middlewares, lib, utils, types, constants
- สร้าง `package.json` — dependencies: express, cors, dotenv, mongoose, multer / devDependencies: typescript, ts-node, nodemon, @types/*
- สร้าง `tsconfig.json` — target ES2020, commonjs, strict mode, outDir: dist
- สร้าง `src/config/env.ts` — centralized env config พร้อม type-safe ด้วย `as const`
- สร้าง `src/config/database.ts` — MongoDB connection/disconnection ผ่าน mongoose
- สร้าง `src/types/common.ts` — ApiResponse, PaginatedResponse, RequestWithUser interfaces
- สร้าง `src/middlewares/errorHandler.ts` — AppError class + centralized error middleware
- สร้าง `src/utils/response.ts` — sendSuccess, sendCreated, sendPaginated helpers
- สร้าง `src/constants/index.ts` — HTTP_STATUS และ MESSAGES constants
- อัปเดต `src/app.ts` — ใช้ errorHandler จาก middleware แทน inline handler
- อัปเดต `src/server.ts` — เรียก connectDatabase() ก่อน listen
- สร้าง `.env`, `.env.example`, `Dockerfile`, `docker-compose.yml` (backend + MongoDB + Qdrant)
- เพิ่ม `.gitkeep` ใน 13 directories ว่าง (src subdirs + uploads + docker)

**My Adjustment:**
- รวม backend services (backend, mongodb, qdrant) เข้า root `docker-compose.yml` เดียวกับ frontend — สามารถรัน `docker-compose up` จาก root เพื่อ start ทุก service พร้อมกัน
- ลบ `backend/docker-compose.yml` ออก เพราะถูกแทนที่ด้วย root compose แล้ว
- backend service ใช้ `context: ./backend, dockerfile: Dockerfile` — build จาก `backend/Dockerfile` โดยตรง

**Git Commit:**
```
feat: scaffold backend service layer with Express.js and TypeScript

- Add clean architecture structure (routes/controllers/services/repositories)
- Add centralized config for env variables and MongoDB connection
- Add consistent error handling with AppError class and middleware
- Add shared types, response helpers, and HTTP constants
- Add Docker setup with MongoDB and Qdrant services
```

---

## Session 3

**Prompt:**
สร้าง Structure Information File สำหรับให้ AI อ่านแล้วเข้าใจโครงสร้างโปรเจกต์ได้ทันที

**AI Response:**
- สร้าง `PROJECT.md` ที่ project root — ครอบคลุม: project overview, tech stack table, monorepo directory layout, frontend/backend structure พร้อม key files, Docker services, API response convention, error handling pattern, planned features by session
- เพิ่ม 2 กฎใน `CLAUDE.md` ภายใต้ AI Working Rules:
  - "Before starting ANY session, read `PROJECT.md`"
  - "Keep `PROJECT.md` updated when making structural changes"

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
docs: add PROJECT.md structure information file for AI context

- Document complete monorepo structure (frontend + backend)
- Add architecture flow, key files, API conventions
- Add rule in CLAUDE.md to read PROJECT.md before each session
```

---

## Session 4

**Prompt:**
สร้าง Login flow ครบวงจร — หน้า /login, API login/logout, JWT httpOnly cookie, protected routes, seed admin, rate limit

**AI Response:**

_Backend:_
- ติดตั้ง packages: bcryptjs, jsonwebtoken, cookie-parser, express-rate-limit + types
- `models/user.model.ts` — Mongoose schema: username, password, role (admin/user), timestamps
- `repositories/user.repository.ts` — findByUsername, create, existsByUsername
- `services/auth.service.ts` — trim/sanitize input, bcrypt.compare, jwt.sign → return token + user
- `controllers/auth.controller.ts` — validate required fields, set httpOnly cookie, clearCookie on logout
- `routes/auth.routes.ts` — POST /api/auth/login (+ rate limiter), POST /api/auth/logout
- `middlewares/auth.middleware.ts` — verify JWT from cookie, attach user to req
- `middlewares/rateLimiter.ts` — 10 attempts per 15 min per IP
- `utils/seed.ts` — สร้าง admin/admin123 (bcrypt hash) ถ้ายังไม่มี
- อัปเดต `app.ts` — เพิ่ม cookieParser, cors credentials, register /api/auth routes
- อัปเดต `server.ts` — เรียก seedAdminUser() หลัง connectDatabase()
- อัปเดต `config/env.ts` + `.env` — เพิ่ม FRONTEND_URL

_Frontend:_
- `types/auth.ts` — LoginRequest, AuthUser, LoginResponse interfaces
- `services/auth.service.ts` — fetch POST /api/auth/login และ /logout พร้อม credentials: "include"
- `app/login/page.tsx` — login form: username/password input, loading state, error message
- `middleware.ts` — redirect /chat, /documents → /login ถ้าไม่มี token; redirect /login → / ถ้ามี token

**My Adjustment:**
- เพิ่ม Refresh Token: accessToken (15m) + refreshToken (7d) แยก secret คนละตัว
- เพิ่ม field `refreshToken` ใน User model สำหรับ revocation — logout จะ clear ทั้งใน DB และ cookie
- เพิ่ม `POST /api/auth/refresh` endpoint — verify refreshToken จาก cookie และ DB → issue accessToken ใหม่
- เพิ่ม `refresh()` ใน frontend `auth.service.ts`

**Git Commit:**
```
feat: implement full login flow with JWT authentication

- Add User model, repository, service, controller, and routes
- Hash password with bcryptjs, sign/verify JWT in httpOnly cookie
- Add rate limiter (10 attempts/15min) on login endpoint
- Seed admin user (admin/admin123) on server start
- Add Next.js login page with loading/error states
- Add route protection middleware for /chat and /documents
```

---

## Session 5

**Prompt:**
สร้าง Chat UI หน้า /chat ล้ำสมัย และ redirect หลัง login ไปหน้า chat

**AI Response:**
- สร้าง `app/chat/page.tsx` — Chat UI เต็มหน้าจอ dark theme
  - Header: ชื่อ app + ปุ่มออกจากระบบ
  - Message list: AI bubble (ซ้าย) + User bubble (ขวา) พร้อม auto-scroll
  - Loading indicator: 3 dots bounce animation ขณะรอ AI
  - Textarea input: Enter ส่ง, Shift+Enter ขึ้นบรรทัด
  - Placeholder AI response (จะเชื่อม API จริงใน session ถัดไป)
- อัปเดต `login/page.tsx` — redirect ไป `/chat` หลัง login สำเร็จ

**My Adjustment:**
[รอ manual review จาก developer]

**fix1 — แก้ปุ่ม "เริ่มต้นใช้งาน →" ไม่พาไปหน้า /login:**
- Root Cause: `middleware.ts` redirect `/login` → `/` เมื่อ user มี `token` cookie อยู่แล้ว — ทำให้ผู้ใช้ที่ login แล้วกดปุ่มแล้ววนกลับ home ดูเหมือนปุ่มไม่ทำงาน
- Fix: แก้ `frontend/src/middleware.ts` บรรทัด 19 — `new URL("/", ...)` → `new URL("/chat", ...)` เพื่อให้ redirect ไป `/chat` แทน

**fix2 — แก้ปุ่มออกจากระบบใน /chat ไม่ทำงาน:**
- Root Cause: route `POST /api/auth/logout` ใช้ `authenticate` middleware ตรวจ access token — ถ้า token หมดอายุ (15 นาที) จะได้ 401 กลับ cookies ไม่ถูก clear และ redirect ไม่เกิดขึ้น
- Fix:
  - `auth.routes.ts` — ลบ `authenticate` ออกจาก logout route
  - `auth.controller.ts` — อ่าน `refreshToken` จาก cookie โดยตรงแทน `req.user.id`
  - `auth.service.ts` — `logout()` รับ `refreshToken` แล้วหา user จาก DB เพื่อ clear — ออกจากระบบได้เสมอแม้ access token หมดอายุ

**Git Commit:**
```
feat: add Chat UI page with modern dark design

- Add full-screen chat interface with message bubbles
- Add loading animation while waiting for AI response
- Add auto-scroll to latest message
- Redirect to /chat after successful login
- fix1: redirect authenticated users from /login to /chat in middleware
- fix2: allow logout without valid access token by removing authenticate guard
```

---

## Session 6

**Prompt:**
สร้าง API สำหรับหน้า Chat บอท โดยใช้ OPENROUTER_API_KEY และ OPENROUTER_MODEL จาก .env และเชื่อม Chat UI ให้ถามตอบได้

**AI Response:**
- เพิ่ม `openrouterApiKey`, `openrouterModel` ใน `backend/src/config/env.ts`
- สร้าง `backend/src/services/chat.service.ts` — เรียก OpenRouter API (`/v1/chat/completions`) พร้อม Authorization header
- สร้าง `backend/src/controllers/chat.controller.ts` — validate messages[], เรียก chatService, ส่ง reply กลับ
- สร้าง `backend/src/routes/chat.routes.ts` — POST `/api/chat` ป้องกันด้วย `authenticate`
- อัปเดต `backend/src/app.ts` — register `/api/chat`
- สร้าง `frontend/src/types/chat.ts` — ChatMessage, ChatResponse interfaces
- สร้าง `frontend/src/services/chat.service.ts` — fetch POST /api/chat พร้อม credentials: include
- อัปเดต `frontend/src/app/chat/page.tsx` — แทนที่ setTimeout placeholder ด้วย chatService.send() พร้อม error message fallback

**My Adjustment:**
 เพิ่ม OPENROUTER_API_KEY และ OPENROUTER_MODEL

**Git Commit:**
```
feat: connect Chat UI to OpenRouter API

- Add OpenRouter config (API key, model) to backend env
- Add chat service calling OpenRouter chat completions endpoint
- Add chat controller and route (POST /api/chat) with auth guard
- Add frontend chat service and types
- Replace placeholder response with real AI reply in chat page
```

---

## Session 7

**Prompt:**
สร้าง Document Upload และ RAG Preparation — upload API สำหรับ PDF/TXT, validate, parse text, Upload UI

**AI Response:**
- ติดตั้ง `pdf-parse` + `@types/pdf-parse`
- สร้าง `backend/src/types/document.ts` — ParsedDocument interface
- สร้าง `backend/src/utils/fileParser.ts` — `parsePdf()` (ใช้ pdf-parse via require()), `parseTxt()` (fs.readFile utf-8)
- สร้าง `backend/src/middlewares/upload.middleware.ts` — multer: diskStorage, UUID filename, filter PDF/TXT only, max 10MB
- สร้าง `backend/src/services/document.service.ts` — เรียก parser ตาม mimetype, return ParsedDocument
- สร้าง `backend/src/controllers/document.controller.ts` — validate req.file, return filename/size/mimetype/preview (500 chars)
- สร้าง `backend/src/routes/document.routes.ts` — POST `/api/documents/upload` ป้องกันด้วย `authenticate`
- อัปเดต `backend/src/app.ts` — register `/api/documents`
- สร้าง `frontend/src/types/document.ts` — UploadResponse interface
- สร้าง `frontend/src/services/document.service.ts` — FormData POST พร้อม credentials: include
- สร้าง `frontend/src/app/documents/page.tsx` — Upload UI: drag & drop zone, loading spinner, success card (preview), error state, nav bar

**My Adjustment:**
[รอ manual review จาก developer]

**fix1 — ย้าย upload เข้า Chat page เหมือนแชตบอททั่วไป:**
- ลบ separate `/documents` page ออก — ย้าย upload functionality เข้าไปใน `chat/page.tsx` โดยตรง
- เพิ่มปุ่ม 📎 (paperclip icon) ซ้ายของ textarea — คลิกเพิ่ม hidden file input
- เมื่ออัปโหลดสำเร็จ: แสดง AI message แจ้งผู้ใช้ + status badge สีเขียวที่ input bar
- เมื่ออัปโหลด error: แสดง status badge สีแดง + auto-dismiss 4 วินาที
- ระหว่างอัปโหลด: spinner + disable ปุ่ม 📎

**fix2 — แก้ TypeError: pdfParse is not a function ตอนอัปโหลด PDF:**
- Root Cause: TypeScript compile `require("pdf-parse")` แล้วผล object มี `.default` property — ทำให้ call โดยตรงไม่ได้
- Fix 1: `backend/src/utils/fileParser.ts` — เปลี่ยนเป็น `const _pdfMod = require("pdf-parse"); const pdfParse = (_pdfMod.default ?? _pdfMod)` เพื่อ unwrap .default อัตโนมัติ
- Fix 2: `backend/Dockerfile` — เพิ่ม `RUN mkdir -p uploads` ใน runner stage เพื่อสร้าง directory ที่ multer ต้องการ

**Git Commit:**
```
feat: add document upload API and upload UI

- Add multer upload middleware (PDF/TXT only, 10MB limit, UUID filename)
- Add pdf-parse and txt file parser utilities
- Add document service, controller, and route (POST /api/documents/upload)
- fix1: move upload into chat page with paperclip button next to input
- fix2: fix pdfParse not a function by unwrapping .default, add uploads dir in Dockerfile
```

---

## Session 8

**Prompt:**
สร้าง Vector Embedding และ Qdrant Integration สำหรับ RAG — chunk text, embed, store, search

**AI Response:**
- ติดตั้ง `@langchain/openai`, `@langchain/textsplitters`, `@qdrant/js-client-rest`
- สร้าง `backend/src/lib/qdrant.ts` — QdrantClient singleton + `ensureCollection()` สร้าง collection อัตโนมัติถ้าไม่มี
- สร้าง `backend/src/utils/textChunker.ts` — `chunkText()` ใช้ RecursiveCharacterTextSplitter (size: 1000, overlap: 200)
- สร้าง `backend/src/services/embedding.service.ts` — `storeDocument()`: chunk → embed (OpenAI) → upsert to Qdrant พร้อม payload (text, filename, chunkIndex)
- สร้าง `backend/src/services/search.service.ts` — `search()`: embed query → Qdrant similarity search → return top-K results
- อัปเดต `types/document.ts` — เพิ่ม `chunksStored: number`
- อัปเดต `document.service.ts` — เรียก `embeddingService.storeDocument()` หลัง parse (best-effort, skip if no OPENAI_API_KEY)
- อัปเดต `document.controller.ts` — return `chunksStored` ใน response

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: add vector embedding and Qdrant integration for RAG

- Add QdrantClient lib with auto collection creation
- Add text chunker using RecursiveCharacterTextSplitter (1000/200)
- Add embedding service storing chunks to Qdrant via OpenAI embeddings
- Add search service for semantic similarity search
- Wire embedding into document upload flow (best-effort)
```

---

## Session 9

**Prompt:**
เชื่อม Vector Search เข้ากับ Chat API (RAG) — ให้ AI ตอบคำถามจากเนื้อหาเอกสารที่อัปโหลด

**AI Response:**
- สร้าง `backend/src/utils/contextBuilder.ts` — `buildSystemContext()` รับ SearchResult[] แล้วสร้าง system prompt พร้อม chunks และ source filename
- อัปเดต `backend/src/services/chat.service.ts`:
  - ดึง last user message → `searchService.search(query, 3)` → `buildSystemContext()`
  - ถ้ามี context: prepend `{ role: "system", content: context }` ก่อน user messages
  - ถ้า search ล้มเหลว (Qdrant ไม่พร้อม/collection ไม่มี): fallback ตอบปกติ ไม่ error
  - Frontend ไม่ต้องเปลี่ยนเลย

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: integrate RAG into chat — search Qdrant context before AI call

- Add contextBuilder util to format document chunks as system prompt
- Update chat service to search Qdrant with last user message
- Inject relevant chunks as system context before forwarding to OpenRouter
- Fallback to normal chat if no documents found or Qdrant unavailable
```

---

## Session 10

**Prompt:**
เมื่อพิมแชต ให้แสดง Token Usage Counter — แสดงจำนวน token ใต้ AI bubble และ cumulative total ที่ header

**AI Response:**
- อัปเดต `backend/src/services/chat.service.ts`:
  - เพิ่ม `TokenUsage` และ `ChatResult` interfaces
  - เปลี่ยน return type จาก `Promise<string>` เป็น `Promise<ChatResult>`
  - Extract `usage.prompt_tokens`, `completion_tokens`, `total_tokens` จาก OpenRouter response
- อัปเดต `backend/src/controllers/chat.controller.ts` — ส่ง `{ reply, tokenUsage }` ใน response
- อัปเดต `frontend/src/types/chat.ts` — เพิ่ม `TokenUsage` interface, อัปเดต `ChatResponse`
- อัปเดต `frontend/src/services/chat.service.ts` — return `{ reply, tokenUsage }` แทน `string`
- อัปเดต `frontend/src/app/chat/page.tsx`:
  - เพิ่ม `tokenUsage?: TokenUsage` ใน `Message` interface
  - เพิ่ม `totalTokens` state
  - เก็บ tokenUsage ใน message หลังได้รับ reply
  - แสดงใต้ AI bubble: `↑ {prompt} · ↓ {completion} · total {total}`
  - แสดงที่ header: `{totalTokens} tokens` badge (แสดงเมื่อ > 0)
- Rebuild และ restart backend + frontend containers

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: add token usage counter to chat UI

- Extract prompt/completion/total tokens from OpenRouter response in chat service
- Return tokenUsage alongside reply from backend chat endpoint
- Display per-message token count under each AI bubble
- Show cumulative session token total in chat header
```

---

## Session 11

**Prompt:**
เพิ่ม Docker Healthcheck ให้ทุก service ใน docker-compose.yml

**AI Response:**
- ยืนยัน backend `/health` endpoint มีอยู่แล้วใน `app.ts`
- อัปเดต `docker-compose.yml` เพิ่ม `healthcheck` ทุก service:
  - `frontend`: `wget --spider http://127.0.0.1:3000` (node:alpine, IPv4)
  - `nginx`: `wget --spider http://127.0.0.1:80` (alpine, IPv4)
  - `backend`: `wget --spider http://127.0.0.1:4000/health` (node:alpine, IPv4)
  - `mongodb`: `mongosh --eval "db.adminCommand('ping')"` (built-in tool)
  - `qdrant`: `bash -c "exec 3<>/dev/tcp/127.0.0.1/6333"` (ไม่มี wget/curl ใช้ bash TCP แทน)
- อัปเดต `depends_on` ใน backend ให้ใช้ `condition: service_healthy` รอ mongodb + qdrant พร้อม
- อัปเดต `depends_on` ใน nginx ให้รอ frontend healthy ก่อน
- แก้ไข IPv6 issue: `localhost` resolve ไป `[::1]` แต่ services listen บน IPv4 ต้องใช้ `127.0.0.1` แทน

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: add Docker healthchecks to all services

- Add healthcheck to frontend, nginx, backend, mongodb, qdrant
- Use condition: service_healthy in depends_on for backend and nginx
- Fix IPv6 issue: use 127.0.0.1 instead of localhost in healthcheck URLs
- Use bash /dev/tcp for qdrant (no wget/curl in qdrant image)
```

---

## Session 12

**Prompt:**
แสดง Markdown ในคำตอบของ AI — ติด react-markdown + wrap AI bubble

**AI Response:**
- ติดตั้ง `react-markdown@10` และ `remark-gfm`
- อัปเดต `frontend/src/app/chat/page.tsx`:
  - import `ReactMarkdown` และ `remarkGfm`
  - AI bubble ใช้ `<ReactMarkdown remarkPlugins={[remarkGfm]}>` แทน plain text
  - User bubble ยังคงเป็น plain text + `whitespace-pre-wrap`
  - custom `components`: p, h1-h3, ul, ol, li, strong, em, a, blockquote, pre, code, table, th, td
  - inline code: `bg-gray-700` + `text-pink-300` + monospace
  - code block: `bg-gray-900` + rounded + overflow-x-auto
  - ตรวจ inline vs block code ด้วย `/language-/.test(className)`

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: add Markdown rendering to AI chat responses

- Install react-markdown and remark-gfm
- Render AI bubble content with ReactMarkdown (GFM support)
- Style code blocks, inline code, lists, tables for dark theme
- Keep user bubble as plain text
```

---

## Session 13

**Prompt:**
เพิ่ม Rate Limiting ให้ครอบคลุม chat และ upload routes

**AI Response:**
- `express-rate-limit` ติดตั้งอยู่แล้ว และมี `loginRateLimiter` แล้ว
- เพิ่ม `chatRateLimiter` (30 req/min) และ `uploadRateLimiter` (10 req/min) ใน `middlewares/rateLimiter.ts`
- apply `chatRateLimiter` ใน `routes/chat.routes.ts` ก่อน `authenticate`
- apply `uploadRateLimiter` ใน `routes/document.routes.ts` ก่อน `authenticate`
- ตอบ 429 พร้อม message อ่านง่ายเมื่อเกิน limit

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: add rate limiting to chat and upload routes

- Add chatRateLimiter (30 req/min) and uploadRateLimiter (10 req/min)
- Apply limiters to /api/chat and /api/documents/upload
- Existing loginRateLimiter (10 req/15min) unchanged
```

---

## Session 14

**Prompt:**
แสดง Citation — ที่มาของคำตอบ AI จากเอกสารที่อัปโหลด

**AI Response:**
- อัปเดต `backend/src/services/chat.service.ts`:
  - `searchContext()` return `{ context, sources }` แทน string เดิม
  - deduplicate filenames ด้วย `Set`
  - เพิ่ม `sources: string[]` ใน `ChatResult` interface
- อัปเดต `backend/src/controllers/chat.controller.ts` — pass `sources` ใน response
- อัปเดต `frontend/src/types/chat.ts` — เพิ่ม `sources: string[]` ใน ChatResponse.data
- อัปเดต `frontend/src/services/chat.service.ts` — return `sources` พร้อม reply/tokenUsage
- อัปเดต `frontend/src/app/chat/page.tsx`:
  - เพิ่ม `sources?: string[]` ใน Message interface
  - เก็บ sources ใน message state หลังได้รับ reply
  - แสดง source badges ใต้ AI bubble: `📄 filename.pdf` (blue pill)
  - แสดงเฉพาะเมื่อ sources มีค่า (AI ตอบจากเอกสาร)

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: add citation — show source documents under AI responses

- Return source filenames from Qdrant search in chat service
- Pass sources through controller to frontend response
- Display source file badges under AI bubble when RAG context is used
```

---

## Session 15

**Prompt:**
แยก Upload Document ออกมาเป็นหน้าของตัวเอง `/upload` และลบ upload feature ออกจาก Chat Page

**AI Response:**
- อัปเดต `frontend/src/middleware.ts` — เพิ่ม `/upload` ใน protectedRoutes
- อัปเดต `frontend/src/types/document.ts` — เพิ่ม `chunksStored` ใน UploadResponse.data
- สร้าง `frontend/src/app/upload/page.tsx`:
  - drag & drop zone + click to browse
  - loading state พร้อม spinner
  - success state: แสดงชื่อไฟล์, ขนาด, จำนวน chunks embedded
  - error state พร้อมปุ่ม retry
  - ปุ่ม "ไปถามคำถาม →" ลิงก์ไป /chat หลัง upload สำเร็จ
- อัปเดต `frontend/src/app/chat/page.tsx`:
  - ลบ: UploadStatus type, uploadStatus/uploadLabel state, fileInputRef, handleFileChange, documentService import, ChangeEvent import
  - ลบ JSX: upload status bar, paperclip button, hidden file input
  - เพิ่ม link "อัปโหลดเอกสาร" ใน header → /upload
  - อัปเดต welcome message

**My Adjustment:**
[รอ manual review จาก developer]

**Git Commit:**
```
feat: separate upload into dedicated /upload page

- Create /upload page with drag & drop, loading, success, error states
- Show filename, size, and chunks embedded after successful upload
- Remove upload UI from Chat page
- Add "อัปโหลดเอกสาร" nav link in Chat header
- Protect /upload route in middleware
```

---

## Session 17

**Prompt:**
บันทึกและโหลดประวัติการสนทนา — สร้าง Conversation model ใน MongoDB, API สำหรับ CRUD, และ Frontend sidebar แสดงรายการ conversations

**AI Response:**

Backend:
- สร้าง `backend/src/models/conversation.model.ts` — IConversation (userId, title, messages[], timestamps) และ IMessage (role, content, tokenUsage?, sources?)
- สร้าง `backend/src/repositories/conversation.repository.ts` — create, findAllByUser, findByIdAndUser, updateMessages
- สร้าง `backend/src/services/conversation.service.ts` — create (auto-title จาก firstMessage), save, list, get พร้อม AppError 404
- สร้าง `backend/src/controllers/conversation.controller.ts` — create, save, list, get handlers
- สร้าง `backend/src/routes/conversation.routes.ts` — POST /, GET /, GET /:id, PUT /:id (ทุก route ผ่าน authenticate)
- อัปเดต `backend/src/app.ts` — register `/api/conversations`

Frontend:
- สร้าง `frontend/src/types/conversation.ts` — ConversationMessage, ConversationSummary, ConversationDetail interfaces
- สร้าง `frontend/src/services/conversation.service.ts` — create, save, list, get API calls
- อัปเดต `frontend/src/app/chat/page.tsx`:
  - เพิ่ม sidebar แสดงรายการ conversations (toggle ได้ด้วยปุ่ม hamburger)
  - ปุ่ม "New Chat" reset messages และ activeConvId
  - auto-create conversation เมื่อ user ส่ง message แรก
  - auto-save หลัง AI ตอบทุกครั้ง
  - load conversation และ restore messages เมื่อกดใน sidebar

**My Adjustment:**
-

**Git Commit:**
```
feat: add conversation history with sidebar and auto-save

- Create Conversation model (userId, title, messages[])
- Add CRUD API: POST/GET /api/conversations, GET/PUT /api/conversations/:id
- Add sidebar to chat page with conversation list and New Chat button
- Auto-create and auto-save conversation after each AI reply
- Load conversation by clicking in sidebar
```

---

## Session 17 — Additional Changes

**Prompt:**
1. chat ให้เป็นแชตบอทปกติ ไม่ต้องผูกกับไฟล์
2. upload เพิ่มประวัติด้วย แล้วปรับให้อัปโหลดไฟล์ก่อนถึงถามได้ ถามได้แต่ตอบเป็นไฟล์ที่ส่งล่าสุดในห้องนั้นเท่านั้น
3. ประวัติห้องแชต และประวัติเอกสาร แยกกัน

**AI Response:**

Backend:
- `chat.service.ts` — ตัด RAG ออก ให้ AI ตอบจากความรู้ตัวเอง (ไม่ค้นหา Qdrant) สำหรับ /chat
- `conversation.model.ts` — เพิ่ม `type: "chat" | "document"` และ `lastUploadedFile?: string`
- `conversation.repository.ts` — เพิ่ม `updateFile()`, `findAllByUser()` filter ตาม type
- `conversation.service.ts` — เพิ่ม `updateFile()`, `list()` และ `create()` รับ type
- `conversation.controller.ts` — `create` รับ type จาก body, `list` รับ type จาก query string, เพิ่ม `updateFile` handler
- `conversation.routes.ts` — เพิ่ม `PATCH /:id/file`
- `search.service.ts` — เพิ่ม `filenameFilter` param ใน Qdrant search, ลบ double-decode ออก
- `chat.service.ts` — restore RAG: ถ้ามี `filename` ให้ search Qdrant กรองเฉพาะไฟล์นั้น ถ้าไม่มีก็ตอบปกติ
- `chat.controller.ts` — รับ `filename?` จาก request body ส่งต่อให้ service

Frontend:
- `types/conversation.ts` — เพิ่ม `lastUploadedFile?` ใน ConversationSummary และ ConversationDetail
- `services/conversation.service.ts` — `create()` และ `list()` รับ `type`, เพิ่ม `updateFile()`
- `services/chat.service.ts` — รับ `filename?` ส่งไปกับ request body
- `app/chat/page.tsx` — ส่ง type `"chat"` ทุก call
- `app/upload/page.tsx` — rewrite ใหม่ทั้งหมด:
  - sidebar + conversation history (type=document)
  - บล็อก input จนกว่าจะ upload ไฟล์
  - เมื่อ upload → สร้าง conversation (type=document), บันทึก lastUploadedFile, AI สรุปไฟล์อัตโนมัติ
  - เมื่อส่งข้อความ → pass filename ไปกับ chat request เพื่อ RAG เฉพาะไฟล์นั้น
  - auto-save หลังทุก AI reply
  - load conversation → restore messages + activeFile

**My Adjustment:**
-

**Git Commit:**
```
feat: separate chat and document history, add RAG-per-file upload chat

- Add type field (chat|document) to Conversation model
- GET /api/conversations?type= filters by type
- POST /api/conversations accepts type in body
- Add PATCH /api/conversations/:id/file to store lastUploadedFile
- Search service supports filenameFilter for Qdrant queries
- Chat service uses RAG only when filename is provided
- Rewrite /upload page: sidebar, conversation history, file-first gate, per-file RAG
- /chat page: pure chatbot with type=chat conversations
```

