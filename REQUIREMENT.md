PART 1
Coding Task: Mini Knowledge Assistant
~20 ชั่วโมง
65
คะแนน

 
โจทย์
สร้าง web application ที่:
1.   Login Page (ใช้ mock user ได้ — admin/admin123)
2.   Chat Page คุยกับ AI (ใช้ Claude API / OpenAI API หาตัวฟรีหรือตัวอื่นทดแทนได้เลย)
3.   Upload Page — upload เอกสาร (PDF/TXT) แล้วถามคำถามเกี่ยวกับเอกสารได้
4.   Token Usage — แสดง token ที่ใช้ในแต่ละข้อความ
 
Tech Stack
Frontend
Next.js หรือ Nuxt.js (เลือก 1)
Backend
API routes ของ Next.js/Nuxt.js หรือแยก backend ก็ได้
Database
อะไรก็ได้ (SQLite, PostgreSQL, MongoDB, JSON file)
Vector DB
(ถ้าทำ RAG): Chroma, Pinecone, Qdrant, หรืออื่น ๆ
Deploy
Docker Compose (ต้องรันด้วย docker compose up เดียว)

 

Required Features (30 คะแนน — ต้องทำทั้งหมด)
#
Feature
คะแนน
เกณฑ์คะแนนเต็ม
1
Login + Protected Routes
5
ครบ + secure (bcrypt, session mgmt)
2
Upload File (PDF, TXT)
5
ครบ + validate type/size + sanitize path
3
Chat with AI (basic)
5
ครบ + error handling + timeout
4
Chat with Uploaded File Context
10
ครบ + ทำงานแม่นยำ + handle ไฟล์ใหญ่
5
Token Usage Counter
5
ครบ + แสดง total ต่อ session

 

Bonus Features (20 คะแนน — เลือกทำ cap ที่ 20)
#
Feature
คะแนน
A
Markdown rendering ในคำตอบ AI
3
B
Citation (แสดงที่มาของคำตอบจากเอกสาร)
5
C
Streaming response
3
D
RAG with Vector DB (chunking + embedding + retrieval)
8
E
Conversation history (save/load)
3
F
Rate limiting / API key rotation
3
G
Docker Compose + Healthcheck
3
H
Unit tests (coverage ≥ 40%)
5

 
Code Quality (15 คะแนน — ประเมินจากการอ่านโค้ด)
มิติ
คะแนน
เกณฑ์คะแนนเต็ม
Code Structure & Clean Code
5
มี layering (route/service/repo), naming ดี, ไม่มี god file
Security Hardening
5
input validation + no hardcoded key + CORS + sanitization ครบ
Git Commit History
5
commit แยกขั้นตอน, message เขียนดี, logical unit

สิ่งที่ต้องส่งใน Part 1
1. GitHub Repository (Public)
URL format:
https://github.com/{username}/trainee-knowledge-assistant

 
2. README.md (บังคับ)
ต้องมีอย่างน้อย:
# Knowledge Assistant
 
## Tech Stack
[framework, database, vector DB]
 
## Setup & Run
[1-command setup, e.g. docker compose up]
 
## Features Done
- [x] Login + Protected Routes
- [x] File Upload
- [ ] RAG (not done yet)
 
## Architecture
[brief architecture description]
 
## Known Issues
[things you know are not great yet]

 
3. AI_JOURNAL.md (บังคับ — มีผลต่อคะแนน Bonus)
Template:
# AI Usage Journal
 
## Session 1: Setting up Next.js project
**Prompt:** "help me setup next.js 14 with typescript and tailwind"
**AI Response:** [short summary of what AI replied]
**My Adjustment:** [what you changed, e.g. version, added ESLint]
 
## Session 2: Implementing file upload
**Prompt:** ...
**AI Response:** ...
**My Adjustment:** ...

 
เกณฑ์คะแนน Bonus (10 คะแนน):
จำนวน Sessions
คะแนน
ความหมาย
0 sessions
0
ไม่มีไฟล์
1-4 sessions
2
น่าสงสัยว่าทำเองทั้งหมด
5-14 sessions
5
พอใช้
15-30 sessions
8
Ideal — ใช้ AI เป็น
30+ sessions
6
ต้องดู quality

 
+2 คะแนน ถ้ามี "My Adjustment" ชัดเจนในเกือบทุก session
4. DECISIONS.md (บังคับ)
อธิบาย 3 decision สำคัญที่คุณเลือก (แต่ละข้อ 100-200 คำ):
# Architecture Decisions
 
## Decision 1: Chose SQLite over PostgreSQL
 
### Context
[describe the situation]
 
### Alternatives Considered
[other options you looked at]
 
### Why SQLite
[reasoning behind the choice]
 
### Trade-offs
[what you're willing to give up]

