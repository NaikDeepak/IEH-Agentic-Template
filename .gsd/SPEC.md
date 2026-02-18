# SPEC.md — Project Specification

> **Status**: `FINALIZED`
> **Created**: 2026-02-19

## Vision

IEH (Insider Edge Hiring) is an AI-powered job marketplace that makes Naukri and Monster obsolete for the next generation of hiring. The goal is to reach production-ready, investor-demo quality — a self-serve link where anyone can sign in as a candidate or employer with Google and experience the full end-to-end workflow, powered by AI features that legacy platforms simply don't have.

## Goals

1. **Production deployment** — Live Firebase project, real auth, real Firestore, accessible via public URL
2. **Compelling demo experience** — Realistic seed data so the app never feels empty; smooth end-to-end flows for both seeker and employer personas
3. **AI differentiation front-and-center** — Semantic candidate search, skill gap + training recommendations, and referral system must work flawlessly and be immediately impressive
4. **Investor-pitch ready** — Admin financial dashboard (numbers calculator) polished and accurate; the app tells a coherent business story
5. **Partner handoff** — Self-serve enough that a business partner can demo it independently without guidance

## Non-Goals (Out of Scope)

- Mobile app (native iOS/Android)
- Payment processing / real monetization
- Production-scale infrastructure (this is demo/seed stage)
- Full admin user management UI (placeholder is acceptable for now)
- Multi-language / i18n

## Users

| Persona | Entry | Key Journey |
|---------|-------|-------------|
| **Job Seeker** | Google Sign-in → Role: Seeker | Upload resume → AI analysis → Skill gap → Training recs → Browse/apply to jobs → Track applications |
| **Employer** | Google Sign-in → Role: Employer | Post job → Semantic search candidates → Kanban pipeline → Shortlist |
| **Admin/Investor** | Admin credentials | Financial dashboard → Pitch numbers → Platform health |

## Constraints

- Stack is fixed: React 19 + Vite + Firebase + Express BFF + Gemini AI + Tailwind v4
- No timeline deadline (but investor meeting is the forcing function)
- Deployment target: Vercel (frontend) + Firebase (backend + functions)
- Must work as a self-serve demo — no white-glove walkthrough required

## Success Criteria

- [ ] Anyone with a Google account can sign up, pick a role, and complete their persona's core journey without hitting an error
- [ ] Semantic candidate search returns relevant results (not empty) for at least 3 demo queries
- [ ] Skill gap analysis + training recommendations display for a sample resume
- [ ] Referral dashboard shows referral data (not empty state)
- [ ] Admin financial dashboard renders with realistic demo numbers
- [ ] App loads in < 3s on first visit (Lighthouse performance ≥ 85)
- [ ] Zero console errors on the happy path flows
- [ ] Seed data: ≥ 10 jobs, ≥ 5 companies, ≥ 10 candidate profiles with embeddings
