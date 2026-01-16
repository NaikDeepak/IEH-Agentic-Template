# Stack Recommendation: AI Job Board (RAG & Agents)

**Researched:** 2026-01-16
**Domain:** AI Orchestration, Vector Search, Agentic Workflows
**Confidence:** HIGH

## Executive Summary
For a React 19 / Firebase / Gemini app, the 2026 "Golden Stack" avoids manual RAG plumbing in favor of **Firebase Genkit** for backend flows and **Vercel AI SDK** for frontend streaming. This combination leverages Firestore's native Vector Search for semantic job matching while using Gemini 2.x's high context window and native tool-calling for agentic behavior.

---

## Recommended Stack

### Core AI Orchestration
| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `genkit` | `^1.14.0` | Backend AI Framework | Official Firebase AI framework. Standardizes "Flows" (RAG/Indexing) with built-in observability and Firestore Vector Search integration. |
| `@genkit-ai/google-genai` | `^1.0.0` | Gemini Provider | Native plugin for Gemini 2.x, supporting multimodal inputs and optimized tool calling. |
| `ai` / `@ai-sdk/react` | `^6.0.0` | UI & Streaming | Industry standard for React 19. Provides `useChat` and `useAssistant` hooks that handle Server Actions and streaming UI parts out of the box. |

### Data & Search
| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `firebase-admin` | `^13.0.0` | Server-side Firebase | Required for Genkit server-side execution and Firestore Vector Search index management. |
| `zod` | `^3.24.0` | Schema Validation | Mandatory for Genkit tool definitions and Vercel AI SDK structured outputs. |

### Supporting Tools
| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `firebase-functions` | `^6.0.0` | Agent Hosting | 2nd Gen functions are the recommended environment for Genkit flows to ensure low-latency streaming. |

---

## Rationale: Why This Stack?

1. **Native Firestore Vector Search:** Genkit provides a first-class `retriever` for Firestore. Instead of managing a separate Pinecone/Weaviate instance, we keep Job and Talent embeddings directly in Firestore, reducing architectural complexity and latency.
2. **React 19 Synergy:** Vercel AI SDK v6 is built specifically for React 19's `use` hook and Server Actions. It handles the "streaming UI" problem (e.g., showing a "searching jobs..." spinner while the agent works) more elegantly than raw Firebase SDKs.
3. **Observability (Genkit UI):** Genkit includes a local Developer UI for inspecting traces. For a semantic matching engine, being able to see exactly what the retriever found before the LLM answered is critical for debugging "bad matches."

---

## What NOT to Use (and Why)

| Tool | Avoid Because... |
|------|------------------|
| **Manual Pinecone SDK** | Firestore Vector Search is now native. Adding another SaaS for vectors adds cost and "cold start" sync issues for job postings. |
| **LangChain (Heavy)** | Unless the app requires 50+ integrations, LangChain's abstraction layer often introduces "debug-hell." Genkit's code-centric approach is more "Firebase-native." |
| **Raw `fetch` for Gemini** | Using the raw REST API misses out on Genkit's automated tracing, retries, and structured Zod output handling. |

---

## Implementation Pattern: "Agentic Matching"

The recommended pattern is to define a **Genkit Flow** as a tool that the **Vercel AI SDK** calls via a Firebase Function.

### Pattern: The Semantic Matcher
1. **Frontend:** User asks "Find me React roles in NYC."
2. **UI:** `useChat` sends request to a Firebase Function.
3. **Backend (Genkit):**
   - A `defineFlow` uses a `retriever` to query Firestore Vector Search for `NYC + React`.
   - The flow uses `generate` with Gemini to rank these based on the user's inferred seniority.
4. **Streaming:** Results are streamed back as "Tool Parts" or markdown to the React 19 frontend.

---

## Common Pitfalls

- **Vector Index Latency:** Firestore vector indexes are "eventually consistent." Ensure that after a new Job is posted, there is a UI-level delay or "indexing" badge before it appears in semantic searches.
- **Function Timeouts:** Agentic workflows can exceed the default 60s timeout for Cloud Functions. Always configure AI-related functions with at least `timeoutSeconds: 300` and `memory: "1GB"`.
- **Zod Version Mismatch:** Genkit and Vercel AI SDK both rely heavily on Zod. Ensure project-wide singleton versioning to avoid "instanceof" schema errors.

---

## Sources
- [Firebase Genkit Documentation](https://firebase.google.com/docs/genkit) (HIGH Confidence)
- [Vercel AI SDK v6 Release Notes](https://sdk.vercel.ai/docs) (HIGH Confidence)
- [Firestore Vector Search Guide](https://firebase.google.com/docs/firestore/vector-search) (HIGH Confidence)
