# Mini Knowledge Assistant — Project Structure

> Read this file before starting any development task.
> This file describes the complete project structure, architecture, and key decisions.

---

## Overview

A full-stack AI-powered knowledge assistant that allows users to upload documents (PDF/TXT), chat with an AI, and search through their documents using RAG (Retrieval-Augmented Generation).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (user/chat data), Qdrant (vector embeddings) |
| AI | LangChain, OpenAI |
| Infrastructure | Docker, Nginx |

---

## Monorepo Structure

```
trainee-knowledge-assistant/
├── frontend/               Next.js 14 application
├── backend/                Express.js API server
├── Dockerfile              Frontend multi-stage build
├── docker-compose.yml      Orchestrates all services
├── .gitignore
├── PROJECT.md              (this file)
├── CLAUDE.md               AI working rules and sessions
└── AI_JOURNAL.md           Session history log
```

---

## Frontend — `frontend/`

### Directory Structure

```
frontend/src/
├── app/                    Next.js App Router pages and layouts
├── components/             Reusable UI components
├── features/               Feature-based modules (auth, chat, document)
├── services/               API call functions (talks to backend)
├── stores/                 Global state (Zustand or Context)
├── hooks/                  Custom React hooks
├── lib/                    Third-party client setup (axios, etc.)
├── providers/              React context providers (QueryClient, Theme)
├── types/                  TypeScript interfaces and types
├── constants/              App-wide constants
├── utils/                  Pure utility/helper functions
├── config/                 Frontend config values
└── middleware.ts            Next.js route middleware
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/page.tsx` | Landing / Get Started page |
| `src/middleware.ts` | Auth route protection (expand later) |
| `next.config.js` | `output: standalone` for Docker |
| `tailwind.config.ts` | Tailwind with `./src/**/*` content |

### Environment Variables (`frontend/.env.local`)

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Backend — `backend/`

### Directory Structure

```
backend/src/
├── config/
│   ├── env.ts              Typed environment variables (as const)
│   └── database.ts         MongoDB connect/disconnect via mongoose
├── routes/                 Express routers — define API endpoints
├── controllers/            Handle req/res — call service layer
├── services/               Business logic — call repository layer
├── repositories/           Database queries — call models
├── models/                 Mongoose schemas and models
├── middlewares/
│   └── errorHandler.ts     AppError class + global error middleware
├── lib/                    External clients (Qdrant, LangChain setup)
├── utils/
│   └── response.ts         sendSuccess / sendCreated / sendPaginated
├── types/
│   └── common.ts           ApiResponse, PaginatedResponse, RequestWithUser
├── constants/
│   └── index.ts            HTTP_STATUS, MESSAGES
├── app.ts                  Express app setup (middleware + routes + error handler)
└── server.ts               Entry point — connect DB then listen
```

### Architecture Flow

```
HTTP Request
    ↓
routes/          → defines endpoint (GET /api/auth/login)
    ↓
controllers/     → validates input, calls service, sends response
    ↓
services/        → business logic (hash password, generate token)
    ↓
repositories/    → database query (findOne, create, update)
    ↓
models/          → Mongoose schema
    ↓
MongoDB
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app.ts` | Express setup: cors, json, routes, errorHandler |
| `src/server.ts` | Connects MongoDB then starts HTTP server |
| `src/config/env.ts` | Single source of truth for all env variables |
| `src/config/database.ts` | `connectDatabase()` / `disconnectDatabase()` |
| `src/middlewares/errorHandler.ts` | `throw new AppError(400, "message")` pattern |
| `src/utils/response.ts` | Consistent JSON response format |

### Environment Variables (`backend/.env`)

```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://mongodb:27017/knowledge-assistant   ← Docker service name
QDRANT_URL=http://qdrant:6333                             ← Docker service name
QDRANT_COLLECTION=knowledge
OPENAI_API_KEY=
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

> When running locally (npm run dev), change mongodb → localhost and qdrant → localhost

---

## Docker — Root Level

### Services (`docker-compose.yml`)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `nginx` | nginx:alpine | 80 | Reverse proxy → frontend |
| `frontend` | (built) | 3000 (internal) | Next.js standalone |
| `backend` | (built) | 4000 | Express API |
| `mongodb` | mongo:7 | 27017 | Document database |
| `qdrant` | qdrant/qdrant | 6333 | Vector database |

### Dockerfiles

| File | Builds | Notes |
|------|--------|-------|
| `Dockerfile` (root) | Frontend | multi-stage: deps → builder → runner, standalone output |
| `backend/Dockerfile` | Backend | multi-stage: builder → runner, compiles TypeScript to dist/ |

### Run Everything

```bash
# From project root
docker-compose up --build -d

# Development (hot reload)
cd frontend && npm run dev     # localhost:3000
cd backend  && npm run dev     # localhost:4000
```

---

## API Design Convention

All API responses follow this shape:

```json
// Success
{ "message": "Success", "data": { ... } }

// Error
{ "message": "Error description" }

// Paginated
{ "message": "Success", "items": [...], "total": 10, "page": 1, "limit": 20 }
```

### Error Handling Pattern

```typescript
// In any service or controller:
throw new AppError(404, "User not found");

// Caught automatically by errorHandler middleware in app.ts
```

---

## Planned Features (by Session)

| Session | Feature |
|---------|---------|
| 1 | Next.js project structure ✅ |
| 2 | Backend service layer ✅ |
| 3 | Structure information file ✅ |
| Future | Login / Auth |
| Future | Chat with AI |
| Future | PDF/TXT upload |
| Future | RAG document search |
| Future | Token usage tracking |
