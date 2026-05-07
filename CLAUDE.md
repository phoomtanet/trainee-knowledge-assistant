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
