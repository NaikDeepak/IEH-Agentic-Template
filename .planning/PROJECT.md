# IEH (AI Job Board)

## What This Is

An intelligent job board platform that matches candidates to jobs using semantic search and AI. Built with React, Firebase, and Google Gemini to understand job descriptions and search queries beyond simple keywords.

## Core Value

Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.

## Requirements

### Validated

- ✓ User Authentication (Google/Email, RBAC) — Phase 1
- ✓ Marketplace Mechanics (4-day Active System, Ghost Job Filter) — Phase 2
- ✓ Semantic Matching Engine (Bi-directional Vector Search) — Phase 3
- ✓ Employer Suite (AI JD Generator, Screening Questions, ATS Kanban, Branding) — Phase 4
- ✓ Seeker Tools (Resume Analyzer, Skill Gap, Interview Prep, Market Index) — Phase 5
- ✓ Growth & Referrals (Brownie Points, Verification, Referral Dashboard) — Phase 6

### Active

- [ ] Phase 7: Stabilization & Production Readiness (real auth, E2E tests, performance, CI/CD)

### Deferred (Post-Funding)

- Autonomous Career Agents
- Explainable Scoring (XAI)
- Predictive Career Pathing
- Subscription / Monetization (Razorpay/Stripe)

### Out of Scope

- Self-hosted infrastructure (Strictly Firebase/Serverless)

## Context

Brownfield project using:
- Frontend: React 19, Tailwind CSS, Vite
- Backend: Firebase Functions, Firestore (Vector Search)
- AI: Google Gemini SDK (@google/genai)
- Infrastructure: Firebase Auth, Hosting
- Growth: Referral engine with atomic Brownie Points ledger

## Constraints

- **Tech Stack**: Must use Firebase ecosystem (Auth, Firestore, Functions) — Core architectural decision
- **AI Model**: Google Gemini — Integrated via SDK
- **Language**: TypeScript — Enforced across stack

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vector Search | Uses Firestore Vector Search with Gemini embeddings | ✓ Good |
| Architecture | Serverless (Firebase Functions) for backend logic | ✓ Good |
| Secure AI Proxy | All Gemini calls through Cloud Functions, zero client-side keys | ✓ Good |
| Atomic Ledger | Firestore transactions for Brownie Points to prevent race conditions | ✓ Good |
| v2 Deferral | Career Agents, XAI deferred pending funding decision | ✓ Practical |

---
*Last updated: 2026-02-17 after Phase 6 closure*
