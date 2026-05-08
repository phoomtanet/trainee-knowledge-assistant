# Architecture Decisions

## Decision 1: MongoDB over PostgreSQL / SQLite

### Context
The application stores three main data types: users, conversations, and messages. Conversations contain a dynamically growing array of messages, each with role, content, token counts, and optional citation sources. The schema is inherently nested and variable in length.

### Alternatives Considered
**SQLite** — zero setup, file-based, suitable for prototypes. However, it struggles with concurrent writes and does not scale beyond a single server.  
**PostgreSQL** — robust relational database with strong ACID guarantees, JSON column support, and excellent tooling. Would require a `messages` join table or JSONB column to handle nested message arrays.

### Why MongoDB
MongoDB's document model maps directly to the conversation schema. A `Conversation` document naturally embeds its `messages[]` array, eliminating join queries entirely. Reads are a single document fetch regardless of message count. The official `mongo:7` Docker image integrates into the compose stack with no extra configuration, and Mongoose provides familiar schema validation with TypeScript support.

### Trade-offs
There is no enforced foreign-key relationship between users and conversations — referential integrity is handled at the application layer. Conversation documents grow unbounded unless a message limit is enforced. These are acceptable trade-offs for a self-contained demo application where data volume is predictable.

---

## Decision 2: Qdrant over Chroma / Pinecone

### Context
RAG requires a vector database to store document chunk embeddings and retrieve the most semantically relevant chunks for a given user query. The database must integrate into a self-hosted Docker Compose stack and support LangChain out of the box.

### Alternatives Considered
**Chroma** — popular for Python RAG prototypes, runs in-process or as a server. Its primary SDK is Python; using it from Node.js requires the HTTP client, adding extra complexity and a separate Python container.  
**Pinecone** — fully managed, excellent performance, no infrastructure overhead. However, it requires an external API key, has a free-tier index limit, and introduces a cloud dependency that prevents fully offline operation.

### Why Qdrant
Qdrant ships an official Docker image (`qdrant/qdrant`) that integrates directly into `docker-compose.yml` with a named volume for persistence. It exposes a REST API that LangChain's `QdrantVectorStore` supports natively. The `/healthz` endpoint made adding a Docker healthcheck straightforward. The entire stack remains self-hosted with no external service dependencies beyond the LLM provider.

### Trade-offs
Operating Qdrant in production requires managing snapshot schedules and volume backups manually. The current setup has no per-user collection isolation, meaning all users share one Qdrant collection and could theoretically retrieve each other's document chunks if queries are semantically similar. This is a known issue acceptable for a single-user demo but would need to be addressed before multi-tenant deployment.

---

## Decision 3: OpenRouter over Direct OpenAI API

### Context
The application needs two AI capabilities: a chat LLM for generating responses and a text embedding model for the RAG pipeline. Both must be accessible via a single, simple API integration.

### Alternatives Considered
**OpenAI API directly** — first-party, well-documented, reliable. Requires a paid account with billing set up; the free tier is limited and embeddings are not free.  
**Anthropic Claude API** — powerful LLM but provides no embedding endpoint, so a second provider would still be needed for embeddings.  
**Local Ollama** — zero cost, fully offline. Requires a GPU for acceptable performance and complicates the Docker Compose setup significantly.

### Why OpenRouter
OpenRouter provides a single unified API key that routes requests to multiple model providers (OpenAI, Anthropic, Mistral, Meta, and others). This means the chat model and embedding model can both be accessed through one endpoint and one key. More importantly, switching models requires only changing two environment variables (`OPENROUTER_MODEL`, `EMBEDDING_MODEL`) with zero code changes. OpenRouter also offers free-tier access to capable open-source models, making development cost-free.

### Trade-offs
OpenRouter adds one additional network hop and a third-party dependency between the application and the underlying model providers. If OpenRouter experiences downtime, both chat and embedding features become unavailable simultaneously. Free-tier rate limits can be more restrictive than direct provider access during peak hours. For production, a fallback to direct provider APIs or request retry logic would be advisable.
