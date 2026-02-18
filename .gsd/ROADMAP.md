# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 — Investor Demo Launch
> **Created**: 2026-02-19

## Must-Haves (from SPEC)

- [ ] End-to-end seeker journey works without errors
- [ ] End-to-end employer journey works without errors
- [ ] Semantic candidate search returns real results
- [ ] Skill gap + training recommendations work on sample resume
- [ ] Referral dashboard shows data (not empty)
- [ ] Admin financial dashboard polished with demo numbers
- [ ] Rich seed data: 10+ jobs, 5+ companies, 10+ candidates with embeddings
- [ ] Deployed to production (Vercel + Firebase)
- [ ] < 3s load time, zero console errors on happy path

---

## Phases

### Phase 1: Production Deployment & Environment Hardening
**Status**: ⬜ Not Started
**Objective**: Get the app live on a real production URL with real Firebase project, correct environment variables, and working Google OAuth. Verify the full auth flow (sign up → role selection → dashboard) works end-to-end in production.
**Requirements**: REQ-01, REQ-02, REQ-03

### Phase 2: Seed Data & Demo Content
**Status**: ⬜ Not Started
**Objective**: Populate Firestore with high-quality, realistic demo data — 10+ jobs across diverse roles, 5+ company profiles, 10+ candidate profiles with embeddings pre-generated. The app must never feel empty when a new user signs in.
**Requirements**: REQ-04, REQ-05

### Phase 3: AI Feature Polish — The "Wow" Moments
**Status**: ⬜ Not Started
**Objective**: Ensure the three hero AI features work flawlessly and impressively: (1) Semantic candidate search returns relevant ranked results, (2) Skill gap analysis + training recommendations display correctly for a sample resume, (3) Referral dashboard shows real referral data and points. Fix any broken states or empty UI.
**Requirements**: REQ-06, REQ-07, REQ-08

### Phase 4: Demo UX & Investor Polish
**Status**: ⬜ Not Started
**Objective**: Tighten the end-to-end demo flow for both personas. Fix any rough edges, loading states, error messages, or confusing UX that would distract in a demo. Polish the admin financial dashboard with realistic investor-facing numbers. Ensure zero console errors on all happy-path flows.
**Requirements**: REQ-09, REQ-10, REQ-11

### Phase 5: Performance, QA & Launch Verification
**Status**: ⬜ Not Started
**Objective**: Run Lighthouse audits (target ≥ 85 performance), fix any critical accessibility issues, run full E2E test suite against production, and do a complete walkthrough of both seeker and employer demo flows. Document the demo script for the business partner.
**Requirements**: REQ-12, REQ-13, REQ-14
