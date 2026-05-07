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

