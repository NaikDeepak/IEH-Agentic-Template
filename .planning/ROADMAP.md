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
- [ ] **Phase 5: Seeker Tools** - AI prep, analysis, and insights
- [ ] **Phase 6: Growth & Monetization** - Referrals and subscriptions

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
**Plans**: 11 plans
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

### Phase 5: Seeker Tools
**Goal**: AI-powered preparation, analysis, and career insights
**Depends on**: Phase 4
**Requirements**: SEEK-01, SEEK-02, SEEK-03, SEEK-04, SEEK-05, SEEK-06
**Success Criteria** (what must be TRUE):
  1. Candidate receives ATS score and skill gap analysis for resumes
  2. Candidate can practice role-specific interviews with AI feedback
  3. Candidate can complete AI-driven skill assessments
  4. Candidate sees real-time salary data and alumni connections
**Research**: Likely (Complex agentic flows)
**Research topics**: Interview agent conversational flow, real-time data sources
**Plans**: TBD

### Phase 6: Growth & Monetization
**Goal**: Viral loops and revenue capture
**Depends on**: Phase 5
**Requirements**: GROW-01, GROW-02, GROW-03
**Success Criteria** (what must be TRUE):
  1. User can refer others and track rewards/credits
  2. Affiliates accrue points for successful referrals
  3. Employers and Seekers can purchase/manage subscriptions
**Research**: Likely (Payment integration)
**Research topics**: Payment gateway selection (Razorpay/Stripe for India), webhook handling
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Identity | 3/3 | Completed | 2026-01-16 |
| 2. Marketplace Mechanics | 8/8 | Completed | 2026-02-08 |
| 3. Semantic Matching Engine | 6/6 | Completed | 2026-02-08 |
| 4. Employer Suite | 11/11 | Completed | 2026-02-10 |
| 5. Seeker Tools | 0/TBD | Not started | - |
| 6. Growth & Monetization | 0/TBD | Not started | - |

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
- [ ] **SEEK-01**: AI Resume Analyzer (ATS score, keyword matching, missing skills)
- [ ] **SEEK-02**: Real-time Skill Gap Analysis against target roles
- [ ] **SEEK-03**: Simulated Interview Prep (Role-specific questions & feedback)
- [ ] **SEEK-04**: Verified Skill Proofs (AI-driven assessments)
- [ ] **SEEK-05**: Real-time Salary/Market Index
- [ ] **SEEK-06**: Insider Connections (Identify alumni/network at target companies)

#### Growth & Monetization
- [ ] **GROW-01**: Referral System (Cash/Credits for successful hires)
- [ ] **GROW-02**: Affiliate Program for job seekers (Points for referrals)
- [ ] **GROW-03**: Subscription management (Employer tiers, Seeker premium packs)

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
| SEEK-01 | Phase 5 | Pending |
| SEEK-02 | Phase 5 | Pending |
| SEEK-03 | Phase 5 | Pending |
| SEEK-04 | Phase 5 | Pending |
| SEEK-05 | Phase 5 | Pending |
| SEEK-06 | Phase 5 | Pending |
| GROW-01 | Phase 6 | Pending |
| GROW-02 | Phase 6 | Pending |
| GROW-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-16*
