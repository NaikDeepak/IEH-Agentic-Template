# SPEC.md — Project Specification

> **Status**: `FINALIZED`
> **Created**: 2026-01-16 | **Last Updated**: 2026-02-19

## Vision

IEH (Insider Edge Hiring) is an AI-powered job marketplace for the Indian IT/ITES sector that makes Naukri and Monster obsolete. It enforces an "Active Ecosystem" via 4-day timeouts to eliminate ghost jobs and passive candidates. The platform uses bi-directional semantic vector search (Gemini embeddings + Firestore Vector Search) to connect the right talent to the right roles by understanding context, not just keywords.

**Current state:** Phases 1–6 complete (48 plans executed). Now in Phase 7 — Stabilization & Production Readiness — targeting investor-demo launch.

## Goals

1. **Production deployment** — Live Firebase project, real Google OAuth, real Firestore, accessible via public URL
2. **Compelling demo experience** — Realistic seed data so the app never feels empty; smooth end-to-end flows for seeker and employer personas
3. **AI differentiation front-and-center** — Semantic candidate search, skill gap + training recommendations, and referral/Brownie Points system must work flawlessly
4. **Investor-pitch ready** — Admin financial dashboard polished; the app tells a coherent business story
5. **Partner handoff** — Self-serve enough that a business partner can demo it independently without guidance

## What's Already Built (Phases 1–6 ✅)

| Phase | Feature Area | Status |
|-------|-------------|--------|
| 1 | Auth & RBAC (Google/Email, seeker/employer/admin roles) | ✅ Complete |
| 2 | Active System (4-day expiry, ghost job filter, active-first sorting) | ✅ Complete |
| 3 | Semantic Matching Engine (bi-directional vector search) | ✅ Complete |
| 4 | Employer Suite (AI JD generator, screening Qs, ATS Kanban, branding) | ✅ Complete |
| 5 | Seeker Tools (resume analyzer, skill gap, interview prep, market index, networking) | ✅ Complete |
| 6 | Growth & Referrals (Brownie Points ledger, referral dashboard, phone/LinkedIn verification) | ✅ Complete |

## Non-Goals (Out of Scope)

- Mobile app (native iOS/Android)
- Payment processing / real monetization (Razorpay/Stripe — post-funding)
- Autonomous Career Agents (v2 — deferred pending funding)
- Explainable Scoring / XAI (v2 — deferred)
- Predictive Career Pathing (v2 — deferred)
- Self-hosted infrastructure (Firebase/Serverless only)
- Video Emotion AI (anti-feature — bias risk)
- Social Media Scraping (anti-feature — privacy)

## Users

| Persona | Entry | Key Journey |
|---------|-------|-------------|
| **Job Seeker** | Google Sign-in → Role: Seeker | Upload resume → AI analysis → Skill gap + training recs → Browse/apply to jobs → Track applications → Referral dashboard |
| **Employer** | Google Sign-in → Role: Employer | Post job (AI-assisted) → Semantic search candidates → Kanban pipeline → Shortlist |
| **Admin/Investor** | Admin credentials | Financial dashboard → Pitch numbers → Platform health |

## Constraints

- **Stack fixed**: React 19 + Vite + Firebase (Auth/Firestore/Functions) + Express BFF + Gemini AI + Tailwind v4
- **AI**: All Gemini calls through Cloud Functions (zero client-side keys)
- **No timeline deadline** — investor meeting is the forcing function
- **Deployment**: Vercel (frontend) + Firebase (backend + functions)
- **Demo mode**: Self-serve — no white-glove walkthrough required

## Success Criteria (Phase 7)

- [ ] Anyone with a Google account can sign up, pick a role, and complete their persona's core journey without hitting an error
- [ ] Semantic candidate search returns relevant results for at least 3 demo queries
- [ ] Skill gap analysis + training recommendations display for a sample resume
- [ ] Referral dashboard shows Brownie Points and referral data (not empty state)
- [ ] Admin financial dashboard renders with realistic demo numbers
- [ ] App loads in < 3s on first visit (Lighthouse performance ≥ 85)
- [ ] Zero console errors on the happy path flows
- [ ] Seed data: ≥ 10 jobs, ≥ 5 companies, ≥ 10 candidate profiles with embeddings
- [ ] Real Firebase Phone Auth (replacing simulation)
- [ ] E2E smoke tests pass for critical paths
