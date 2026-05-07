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
