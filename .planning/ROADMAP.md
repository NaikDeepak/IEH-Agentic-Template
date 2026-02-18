# Roadmap: IEH (AI Job Board)

## Overview

IEH is an AI-powered job board for the Indian IT/ITES sector that enforces an "Active Ecosystem" via 4-day timeouts. The roadmap moves from core infrastructure to the unique marketplace mechanics, then layers on the semantic matching engine, and finally builds out the specialized tools for employers and seekers.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Identity** - Secure RBAC auth and admin oversight
- [x] **Phase 2: Marketplace Mechanics** - "Active System" logic and hygiene
- [x] **Phase 3: Semantic Matching Engine** - Bi-directional vector search
- [x] **Phase 4: Employer Suite** - AI generation and ATS tools
- [x] **Phase 5: Seeker Tools** - AI prep, analysis, and insights
- [x] **Phase 6: Growth & Monetization** - Referrals and Brownie Points
- [ ] **Phase 7: Stabilization & Production Readiness** - Hardening, real auth, testing, CI/CD

## Phase Details

### Phase 1: Foundation & Identity
**Goal**: Secure user access with granular roles and system oversight
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can sign up/login via Email or Google
  2. Employer can assign/restrict roles (Owner vs Recruiter vs Hiring Manager)
  3. Super Admin can access dashboard to view system status
**Research**: Unlikely (Standard Firebase Auth/Firestore patterns)
**Plans**: 3 plans
- [x] 01-foundation-identity-01-PLAN.md — Setup Authentication & RBAC
- [x] 01-foundation-identity-02-PLAN.md — Protected Routes & Role Selection
- [x] 01-foundation-identity-03-PLAN.md — Super Admin Dashboard Scaffolding

### Phase 2: Marketplace Mechanics
**Goal**: Implement the "Active System" rules to ensure platform freshness
**Depends on**: Phase 1
**Requirements**: MKT-01, MKT-02, MKT-03
**Success Criteria** (what must be TRUE):
  1. Jobs automatically expire to "Passive" status after 4 days of inactivity
  2. Candidates automatically expire to "Passive" status after 4 days of no applications
  3. Inactive/spam postings are flagged and downranked in listings
**Research**: Unlikely (Cloud Functions scheduled tasks)
**Plans**: 8 plans
- [x] 02-marketplace-mechanics-01-PLAN.md — Schema & Activity Tracking
- [x] 02-marketplace-mechanics-02-PLAN.md — The Reaper (Scheduled Function)
- [x] 02-marketplace-mechanics-03-PLAN.md — Notification System
- [x] 02-marketplace-mechanics-04-PLAN.md — Active-First Sorting Logic
- [x] 02-marketplace-mechanics-05-PLAN.md — Active System UI Components
- [x] 02-marketplace-mechanics-06-PLAN.md — Fix integration gaps (Enum & Email)
- [x] 02-marketplace-mechanics-07-PLAN.md — Create Jobs Page (Gap Closure)
- [x] 02-marketplace-mechanics-08-PLAN.md — Fix Job Creation Timestamps (Gap Closure)

### Phase 3: Semantic Matching Engine
**Goal**: Intelligent bi-directional matching between candidates and jobs
**Depends on**: Phase 2
**Requirements**: MATCH-01, MATCH-02, MATCH-03
**Success Criteria** (what must be TRUE):
  1. Candidates see relevant jobs based on semantic fit (not just keywords)
  2. Employers see candidates ranked by experience, skills, and context
  3. Matches reflect specific understanding of India IT/ITES/BPO domain
**Research**: Likely (Vector Search tuning)
**Research topics**: Firestore Vector Search tuning, embedding model selection for Indian context
**Plans**: 6 plans
- [x] 03-semantic-matching-01-PLAN.md — Backend Infrastructure & Indexes
- [x] 03-semantic-matching-02-PLAN.md — Intelligence Layer (Expansion & Scoring)
- [x] 03-semantic-matching-03-PLAN.md — Talent Search UI
- [x] 03-semantic-matching-04-PLAN.md — Job Search UI
- [x] 03-05-PLAN.md — Fix Vector Indexes and Search Responses (Gap Closure)
- [x] 03-06-PLAN.md — Standardize Status Logic and Filtering (Gap Closure)

### Phase 4: Employer Suite
**Goal**: Productivity tools for job creation and candidate management
**Depends on**: Phase 3
**Requirements**: EMP-01, EMP-02, EMP-03, EMP-04
**Success Criteria** (what must be TRUE):
  1. Employer can generate optimized JDs using AI inputs
  2. Employer can generate role-specific screening questions
  3. Employer can track applicants through Kanban pipeline stages
  4. Employer branding page is viewable by candidates
**Research**: Unlikely (Standard CRUD + GenAI SDK usage)
**Plans**: 12 plans
- [x] 04-01-PLAN.md — Employer Branding & Company Profile
- [x] 04-02-PLAN.md — AI-Powered Job Posting with Screening Questions
- [x] 04-03-PLAN.md — Basic ATS Kanban Board
- [x] 04-04-PLAN.md — Fix ESM Imports & AI Parsing (Gap Closure)
- [x] 04-05-PLAN.md — Add Manage Jobs Nav & Seed Data (Gap Closure)
- [x] 04-06-PLAN.md — AI Assist Backend & UX Optimization (Gap Closure)
- [x] 04-07-PLAN.md — Final ATS DND Refactor & Build Fixes (Gap Closure)
- [x] 04-08-PLAN.md — Standardize Embeddings & AI Payload (Gap Closure)
- [x] 04-09-PLAN.md — Context-Aware Job Posting Flow (Gap Closure)
- [x] 04-10-PLAN.md — Relaxed AI Validation & Employer Dashboard (Gap Closure)
- [x] 04-11-PLAN.md — Fix Dashboard Index & Company Prefill (Gap Closure)
- [x] 04-12-PLAN.md — Fix ATS Kanban Permissions (Gap Closure)

### Phase 5: Seeker Tools
**Goal**: Empower job seekers with AI-driven resume analysis, application tracking, and market insights.
**Depends on**: Phase 4
**Requirements**: SEEK-01, SEEK-02, SEEK-03, SEEK-04, SEEK-05, SEEK-06
**Success Criteria** (what must be TRUE):
  1. Candidate receives ATS score and skill gap analysis for resumes
  2. Candidate can track applications via visual Kanban board
  3. Candidate receives daily "Top 5" curated job shortlist
  4. Candidate sees real-time salary data and market trends
**Research**: Likely (Complex agentic flows)
**Research topics**: Gemini PDF analysis, Adzuna API proxying
**Plans**: 13 plans
- [x] 05-01-PLAN.md — Seeker Feature Scaffolding
- [x] 05-02-PLAN.md — Document Processing Service
- [x] 05-03-PLAN.md — Seeker Application Tracker
- [x] 05-04-PLAN.md — AI Resume Analysis Engine
- [x] 05-05-PLAN.md — Market Insights Proxy
- [x] 05-06-PLAN.md — Smart Job Shortlist
- [x] 05-07-PLAN.md — Skill Gap & Learning Loop
- [x] 05-08-PLAN.md — Seeker Dashboard & Navigation
- [x] 05-09-PLAN.md — Simulated Interview Prep
- [x] 05-10-PLAN.md — Verified Skill Proofs
- [x] 05-11-PLAN.md — Insider Connections
- [x] 05-12-PLAN.md — Follow-up Nudges
- [x] 05-13-PLAN.md — Environment Hardening & API Setup (Gap Closure)

### Phase 6: Growth & Monetization
**Goal**: Viral loops and revenue capture
**Depends on**: Phase 5
**Requirements**: GROW-01, GROW-02, GROW-03
**Success Criteria** (what must be TRUE):
  1. User can refer others and track rewards/credits
  2. Affiliates accrue points for successful referrals
  3. Employers and Seekers can purchase/manage subscriptions
**Research**: Completed (Referral architecture, ledger design)
**Research topics**: Atomic ledger patterns, Firebase Phone Auth, LinkedIn OAuth2
**Plans**: 6 plans
- [x] 06-01-PLAN.md — Referral Code Generation & Linking
- [x] 06-02-PLAN.md — Phone OTP Verification (Simulated)
- [x] 06-03-PLAN.md — LinkedIn Verification (Simulated)
- [x] 06-04-PLAN.md — Brownie Points Atomic Ledger
- [x] 06-05-PLAN.md — Referral Dashboard & Redemption Store
- [x] 06-06-PLAN.md — Backend Security & Referral API

### Phase 7: Stabilization & Production Readiness
**Goal**: Harden the platform for real users — real auth, E2E tests, performance, CI/CD
**Depends on**: Phase 6
**Requirements**: Production readiness (non-functional)
**Success Criteria** (what must be TRUE):
  1. Phone OTP uses real Firebase Phone Auth (no simulation)
  2. LinkedIn verification uses real OAuth2 flow
  3. E2E smoke tests pass for critical paths (login → apply → referral)
  4. Lighthouse performance score ≥ 90
  5. CI/CD pipeline deploys to staging automatically
**Research**: Unlikely (Standard production hardening)
**Plans**: 10 plans
- [x] 07-01-PLAN.md — Sentry Enhancement & Structured Logging
- [ ] 07-02-PLAN.md — E2E Smoke Tests (Playwright)
- [ ] 07-03-PLAN.md — Firestore Security Rules Audit
- [ ] 07-04-PLAN.md — Performance & Accessibility Audit
- [ ] 07-05-PLAN.md — Error Handling & Resilience Hardening
- [ ] 07-06-PLAN.md — CI/CD Pipeline & Deployment Automation
- [ ] 07-07-PLAN.md — SEO & Meta Tags Hardening
- [ ] 07-08-PLAN.md — API Security Headers & Input Validation
- [ ] 07-09-PLAN.md — Environment & Deployment Hardening
- [ ] 07-10-PLAN.md — UX Polish & Loading States

> **Note:** v2 features (Career Agents, XAI, Predictive Pathing) are deferred indefinitely pending funding.

## Progress

**Execution Order:**
Phases execute in numeric order.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Identity | 3/3 | Completed | 2026-01-16 |
| 2. Marketplace Mechanics | 8/8 | Completed | 2026-02-08 |
| 3. Semantic Matching Engine | 6/6 | Completed | 2026-02-08 |
| 4. Employer Suite | 12/12 | Completed | 2026-02-16 |
| 5. Seeker Tools | 13/13 | Completed | 2026-02-11 |
| 6. Growth & Monetization | 6/6 | Completed | 2026-02-17 |
| 7. Stabilization & Prod Readiness | 1/10 | In Progress | — |

## Requirements

**Defined:** 2026-01-16
**Core Value:** Active ecosystem connecting IT/ITES talent with opportunity using semantic matching and AI tools.

### v1 Requirements

#### Authentication & Roles
- [x] **AUTH-01**: Users can sign up/login as Job Seeker or Employer (Email/Password, Google)
- [x] **AUTH-02**: Granular RBAC for Employers (Owner, Recruiter, Hiring Manager)
- [x] **AUTH-03**: Super Admin dashboard for system oversight and approvals

#### Marketplace Mechanics ("The Active System")
- [x] **MKT-01**: Jobs automatically marked "Passive" if no recruiter action in 4 days
- [x] **MKT-02**: Candidates automatically marked "Passive" if no application made in 4 days
- [x] **MKT-03**: Ghost Job Filter to flag and downrank inactive/spam postings

#### Matching & Search
- [x] **MATCH-01**: Bi-directional semantic matching (Candidate <-> Job) using Vector Search
- [x] **MATCH-02**: Domain-specific tuning for India IT/ITES/BPO/KPO sectors
- [x] **MATCH-03**: Candidate Scoring Engine based on Experience, Skills, and Industry Context

#### Employer Tools
- [x] **EMP-01**: AI JD Generator (Gemini-powered) with optimization suggestions
- [x] **EMP-02**: AI Screening Question Generator based on job role
- [x] **EMP-03**: Built-in Basic ATS (Kanban pipeline, status tracking, automated follow-ups)
- [x] **EMP-04**: Employer Branding Page (Culture, Video, Job Library)

#### Job Seeker Tools
- [x] **SEEK-01**: AI Resume Analyzer (ATS score, keyword matching, missing skills)
- [x] **SEEK-02**: Real-time Skill Gap Analysis against target roles
- [x] **SEEK-03**: Simulated Interview Prep (Role-specific questions & feedback)
- [x] **SEEK-04**: Verified Skill Proofs (AI-driven assessments)
- [x] **SEEK-05**: Real-time Salary/Market Index
- [x] **SEEK-06**: Insider Connections (Identify alumni/network at target companies)

#### Growth & Monetization
- [x] **GROW-01**: Referral System (Cash/Credits for successful hires)
- [x] **GROW-02**: Affiliate Program for job seekers (Points for referrals)
- [x] **GROW-03**: Subscription management (Deferred, but point system implemented)

### v2 Requirements (Deferred)

#### Compliance & Advanced AI
- **COMP-01**: Explainable Scoring (XAI) - Regulatory requirement (EU/NYC) deferred
- **COMP-02**: Autonomous Career Agents - Proactive market monitoring
- **COMP-03**: Predictive Career Pathing - 5-year trajectory mapping
- **COMP-04**: Conversational Discovery - Natural language search interface

### Out of Scope

| Feature | Reason |
|---------|--------|
| Video Emotion AI | Anti-feature: High bias risk and regulatory friction |
| Social Media Scraping | Anti-feature: Privacy concerns and data quality issues |
| Automated "Ghost" Applications | Anti-feature: Spam generation, degrades platform trust |
| Self-hosted Infrastructure | Constraint: Must use Firebase/Serverless ecosystem |

### Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Completed |
| AUTH-02 | Phase 1 | Completed |
| AUTH-03 | Phase 1 | Completed |
| MKT-01 | Phase 2 | Completed |
| MKT-02 | Phase 2 | Completed |
| MKT-03 | Phase 2 | Completed |
| MATCH-01 | Phase 3 | Completed |
| MATCH-02 | Phase 3 | Completed |
| MATCH-03 | Phase 3 | Completed |
| EMP-01 | Phase 4 | Completed |
| EMP-02 | Phase 4 | Completed |
| EMP-03 | Phase 4 | Completed |
| EMP-04 | Phase 4 | Completed |
| SEEK-01 | Phase 5 | Completed |
| SEEK-02 | Phase 5 | Completed |
| SEEK-03 | Phase 5 | Completed |
| SEEK-04 | Phase 5 | Completed |
| SEEK-05 | Phase 5 | Completed |
| SEEK-06 | Phase 5 | Completed |
| GROW-01 | Phase 6 | Completed |
| GROW-02 | Phase 6 | Completed |
| GROW-03 | Phase 6 | Completed |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-16*
