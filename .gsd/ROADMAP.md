# ROADMAP.md

> **Current Phase**: Phase 7 — Stabilization & Production Readiness
> **Milestone**: v1.0 — Investor Demo Launch
> **Last Updated**: 2026-02-19

## Progress Summary

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 1. Foundation & Identity | 3/3 | ✅ Complete | 2026-01-16 |
| 2. Marketplace Mechanics | 8/8 | ✅ Complete | 2026-02-08 |
| 3. Semantic Matching Engine | 6/6 | ✅ Complete | 2026-02-08 |
| 4. Employer Suite | 12/12 | ✅ Complete | 2026-02-16 |
| 5. Seeker Tools | 13/13 | ✅ Complete | 2026-02-11 |
| 6. Growth & Monetization | 6/6 | ✅ Complete | 2026-02-17 |
| **7. Stabilization & Prod Readiness** | **1/10** | **🔄 In Progress** | — |

**Total plans executed:** 48/58 (83%)

---

## Must-Haves for Launch

- [ ] End-to-end seeker journey works without errors in production
- [ ] End-to-end employer journey works without errors in production
- [ ] Semantic candidate search returns real results
- [ ] Skill gap + training recommendations work on sample resume
- [ ] Referral/Brownie Points dashboard shows data (not empty)
- [ ] Admin financial dashboard polished with demo numbers
- [ ] Rich seed data: 10+ jobs, 5+ companies, 10+ candidates with embeddings
- [ ] Deployed to production (Vercel + Firebase)
- [ ] Lighthouse performance ≥ 85, zero console errors on happy path

---

## Completed Phases

### ✅ Phase 1: Foundation & Identity
**Goal**: Secure RBAC auth and admin oversight
- [x] 01-01: Setup Authentication & RBAC
- [x] 01-02: Protected Routes & Role Selection
- [x] 01-03: Super Admin Dashboard Scaffolding

### ✅ Phase 2: Marketplace Mechanics
**Goal**: "Active System" — 4-day expiry, ghost job filter, active-first sorting
- [x] 02-01 through 02-08 (8 plans complete)

### ✅ Phase 3: Semantic Matching Engine
**Goal**: Bi-directional vector search (Candidate ↔ Job)
- [x] 03-01 through 03-06 (6 plans complete)

### ✅ Phase 4: Employer Suite
**Goal**: AI JD generator, screening Qs, ATS Kanban, company branding
- [x] 04-01 through 04-12 (12 plans complete)

### ✅ Phase 5: Seeker Tools
**Goal**: Resume analyzer, skill gap, interview prep, market index, networking, follow-up nudges
- [x] 05-01 through 05-13 (13 plans complete)

### ✅ Phase 6: Growth & Monetization
**Goal**: Brownie Points atomic ledger, referral dashboard, phone/LinkedIn verification
- [x] 06-01 through 06-06 (6 plans complete)

---

## 🔄 Phase 7: Stabilization & Production Readiness

**Status**: In Progress (1/10 plans complete)
**Goal**: Harden the platform for real users — real auth, E2E tests, performance, CI/CD, investor demo polish

### Plans

- [x] **07-01**: Sentry Enhancement & Structured Logging ✅
- [ ] **07-02**: E2E Smoke Tests (Playwright) — critical paths: login → apply → referral
- [ ] **07-03**: Firestore Security Rules Audit
- [ ] **07-04**: Performance & Accessibility Audit (Lighthouse ≥ 85)
- [ ] **07-05**: Error Handling & Resilience Hardening
- [ ] **07-06**: CI/CD Pipeline & Deployment Automation
- [ ] **07-07**: SEO & Meta Tags Hardening
- [ ] **07-08**: API Security Headers & Input Validation
- [ ] **07-09**: Environment & Deployment Hardening (real Firebase Phone Auth, production env vars)
- [ ] **07-10**: UX Polish & Loading States (demo-ready, zero console errors)

### Phase 7 Success Criteria

1. ✅ Phone OTP uses real Firebase Phone Auth (no simulation)
2. LinkedIn verification uses real OAuth2 flow
3. E2E smoke tests pass for critical paths (login → apply → referral)
4. Lighthouse performance score ≥ 85 (target 90)
5. CI/CD pipeline deploys to staging automatically
6. Seed data populated — app never feels empty on fresh login
7. Demo script documented for business partner self-serve walkthrough

---

## v2 Roadmap (Post-Funding, Deferred)

- Autonomous Career Agents
- Explainable Scoring (XAI)
- Predictive Career Pathing (5-year trajectory)
- Conversational Discovery (natural language search)
- Subscription / Monetization (Razorpay/Stripe)
