# Knowledge Assistant

A full-stack AI-powered knowledge assistant. Upload documents (PDF/TXT), chat with an AI, and ask questions about your documents using RAG.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB |
| Vector DB | Qdrant |
| AI | OpenRouter API (LLM + Embeddings), LangChain |
| Infrastructure | Docker Compose, Nginx |

## Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/phoomtanet/trainee-knowledge-assistant.git
cd trainee-knowledge-assistant

# 2. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env — fill in OPENROUTER_API_KEY, JWT_SECRET, REFRESH_TOKEN_SECRET

# 3. Start all services
docker compose up --build -d
```

App available at: http://localhost

Default credentials: `admin` / `admin123`

## Features Done

- [x] Login + Protected Routes (bcrypt, JWT, httpOnly cookie, refresh token)
- [x] File Upload (PDF, TXT) — validate type/size, sanitize path
- [x] Chat with AI (streaming SSE, error handling)
- [x] Chat with Uploaded File Context (RAG — chunking + embedding + Qdrant retrieval)
- [x] Token Usage Counter (per message + session total)
- [x] Markdown Rendering in AI responses
- [x] Citation — shows source filename under AI bubble
- [x] Streaming Response (Server-Sent Events + typewriter effect)
- [x] RAG with Vector DB (LangChain chunking + OpenRouter embeddings + Qdrant)
- [x] Conversation History (save/load, sidebar, auto-save)
- [x] Rate Limiting (chat: 30 req/min, upload: 10 req/min per IP)
- [x] Docker Compose + Healthcheck (all services have health probes)
- [x] Unit Tests (≥ 40% coverage on tested files)

## Architecture

```
┌─────────┐    ┌──────────────────────────────────┐
│  Nginx  │───▶│  Next.js 14 (Frontend)           │
│ :80     │    │  /login  /chat  /upload           │
└─────────┘    └──────────────┬───────────────────┘
                              │ fetch / SSE
               ┌──────────────▼───────────────────┐
               │  Express.js API (Backend) :4000   │
               │  Route → Controller → Service     │
               │           → Repository → Model    │
               └────────┬──────────────┬───────────┘
                        │              │
               ┌────────▼──┐  ┌────────▼──────┐
               │  MongoDB  │  │    Qdrant     │
               │  (users,  │  │  (document    │
               │  chats)   │  │   embeddings) │
               └───────────┘  └───────────────┘
```

**RAG Pipeline:** Upload → Parse text → Chunk (500 chars / 50 overlap) → Embed (OpenRouter) → Store in Qdrant → On chat: semantic search → inject top-k chunks as system context → AI response with citations.

## Known Issues

- No per-user isolation in Qdrant — all users share the same collection; a user could retrieve chunks from another user's document if the text is semantically similar
- Refresh token blacklist is in-memory only — server restart invalidates all refresh tokens and forces re-login
- Large PDFs (> 100 pages) may hit the OpenRouter embedding rate limit and cause upload to fail silently
- No file deduplication — uploading the same file twice creates duplicate chunks in Qdrant
