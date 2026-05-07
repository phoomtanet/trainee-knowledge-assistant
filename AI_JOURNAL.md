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
