# IEH (AI Job Board)

## What This Is

An intelligent job board platform that matches candidates to jobs using semantic search and AI. Built with React, Firebase, and Google Gemini to understand job descriptions and search queries beyond simple keywords.

## Core Value

Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.

## Requirements

### Validated

<!-- Inferred from codebase map -->
- ✓ User Authentication (Google Provider) — existing
- ✓ Job Creation with AI Embeddings — existing
- ✓ Semantic Job Search (Vector Search) — existing
- ✓ Frontend UI (React + Tailwind) — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Research new features and improvements for v2

### Out of Scope

- Self-hosted infrastructure (Strictly Firebase/Serverless)

## Context

Brownfield project using:
- Frontend: React 19, Tailwind CSS, Vite
- Backend: Firebase Functions, Firestore (Vector Search)
- AI: Google Gemini SDK (@google/genai)
- Infrastructure: Firebase Auth, Hosting

## Constraints

- **Tech Stack**: Must use Firebase ecosystem (Auth, Firestore, Functions) — Core architectural decision
- **AI Model**: Google Gemini — Integrated via SDK
- **Language**: TypeScript — Enforced across stack

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vector Search | Uses Firestore Vector Search with Gemini embeddings | ✓ Good |
| Architecture | Serverless (Firebase Functions) for backend logic | ✓ Good |

---
*Last updated: 2026-01-16 after initialization*
