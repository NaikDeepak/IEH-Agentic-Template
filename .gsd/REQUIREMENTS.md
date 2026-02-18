# REQUIREMENTS.md

> **Defined**: 2026-01-16 | **Updated**: 2026-02-19
> **Core Value**: Active ecosystem connecting IT/ITES talent with opportunity using semantic matching and AI tools.

## v1 Requirements (23 total — all mapped)

### Authentication & Roles

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| AUTH-01 | Users can sign up/login as Job Seeker or Employer (Email/Password, Google) | 1 | ✅ Complete |
| AUTH-02 | Granular RBAC for Employers (Owner, Recruiter, Hiring Manager) | 1 | ✅ Complete |
| AUTH-03 | Super Admin dashboard for system oversight and approvals | 1 | ✅ Complete |

### Marketplace Mechanics ("The Active System")

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| MKT-01 | Jobs automatically marked "Passive" if no recruiter action in 4 days | 2 | ✅ Complete |
| MKT-02 | Candidates automatically marked "Passive" if no application made in 4 days | 2 | ✅ Complete |
| MKT-03 | Ghost Job Filter to flag and downrank inactive/spam postings | 2 | ✅ Complete |

### Matching & Search

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| MATCH-01 | Bi-directional semantic matching (Candidate ↔ Job) using Vector Search | 3 | ✅ Complete |
| MATCH-02 | Domain-specific tuning for India IT/ITES/BPO/KPO sectors | 3 | ✅ Complete |
| MATCH-03 | Candidate Scoring Engine based on Experience, Skills, and Industry Context | 3 | ✅ Complete |

### Employer Tools

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| EMP-01 | AI JD Generator (Gemini-powered) with optimization suggestions | 4 | ✅ Complete |
| EMP-02 | AI Screening Question Generator based on job role | 4 | ✅ Complete |
| EMP-03 | Built-in Basic ATS (Kanban pipeline, status tracking, automated follow-ups) | 4 | ✅ Complete |
| EMP-04 | Employer Branding Page (Culture, Video, Job Library) | 4 | ✅ Complete |

### Job Seeker Tools

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| SEEK-01 | AI Resume Analyzer (ATS score, keyword matching, missing skills) | 5 | ✅ Complete |
| SEEK-02 | Real-time Skill Gap Analysis against target roles | 5 | ✅ Complete |
| SEEK-03 | Simulated Interview Prep (Role-specific questions & feedback) | 5 | ✅ Complete |
| SEEK-04 | Verified Skill Proofs (AI-driven assessments) | 5 | ✅ Complete |
| SEEK-05 | Real-time Salary/Market Index | 5 | ✅ Complete |
| SEEK-06 | Insider Connections (Identify alumni/network at target companies) | 5 | ✅ Complete |

### Growth & Monetization

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| GROW-01 | Referral System — Brownie Points credits for verified referrals | 6 | ✅ Complete |
| GROW-02 | Affiliate Program — Atomic ledger-based point system with audit trail | 6 | ✅ Complete |
| GROW-03 | Subscription management — Point redemption store implemented; full subscriptions deferred | 6 | ✅ Partial |

---

## Phase 7 Requirements (Production Readiness)

| ID | Requirement | Status |
|----|-------------|--------|
| PROD-01 | Real Firebase Phone Auth (replace simulation) | ⬜ Pending |
| PROD-02 | Real LinkedIn OAuth2 verification (replace simulation) | ⬜ Pending |
| PROD-03 | E2E smoke tests pass: login → apply → referral | ⬜ Pending |
| PROD-04 | Lighthouse performance score ≥ 85 on production URL | ⬜ Pending |
| PROD-05 | Firestore Security Rules audited and hardened | ⬜ Pending |
| PROD-06 | CI/CD pipeline deploys to staging automatically | ⬜ Pending |
| PROD-07 | Zero console errors on seeker and employer happy-path flows | ⬜ Pending |
| PROD-08 | Seed data: ≥ 10 jobs, ≥ 5 companies, ≥ 10 candidates with embeddings | ⬜ Pending |
| PROD-09 | Admin financial dashboard renders with realistic demo numbers | ⬜ Pending |
| PROD-10 | Demo script documented for business partner self-serve walkthrough | ⬜ Pending |

---

## v2 Requirements (Deferred — Post-Funding)

| ID | Requirement | Reason Deferred |
|----|-------------|----------------|
| COMP-01 | Explainable Scoring (XAI) | Regulatory (EU/NYC) — post-funding |
| COMP-02 | Autonomous Career Agents | Complex agentic flows — post-funding |
| COMP-03 | Predictive Career Pathing | 5-year trajectory mapping — post-funding |
| COMP-04 | Conversational Discovery | Natural language search — post-funding |

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video Emotion AI | Anti-feature: High bias risk and regulatory friction |
| Social Media Scraping | Anti-feature: Privacy concerns and data quality issues |
| Automated "Ghost" Applications | Anti-feature: Spam generation, degrades platform trust |
| Self-hosted Infrastructure | Constraint: Must use Firebase/Serverless ecosystem |
