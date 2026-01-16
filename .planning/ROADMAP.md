# Roadmap: IEH (AI Job Board)

## Overview

IEH is an AI-powered job board for the Indian IT/ITES sector that enforces an "Active Ecosystem" via 4-day timeouts. The roadmap moves from core infrastructure to the unique marketplace mechanics, then layers on the semantic matching engine, and finally builds out the specialized tools for employers and seekers.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Identity** - Secure RBAC auth and admin oversight
- [ ] **Phase 2: Marketplace Mechanics** - "Active System" logic and hygiene
- [ ] **Phase 3: Semantic Matching Engine** - Bi-directional vector search
- [ ] **Phase 4: Employer Suite** - AI generation and ATS tools
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
**Plans**: TBD

### Phase 2: Marketplace Mechanics
**Goal**: Implement the "Active System" rules to ensure platform freshness
**Depends on**: Phase 1
**Requirements**: MKT-01, MKT-02, MKT-03
**Success Criteria** (what must be TRUE):
  1. Jobs automatically expire to "Passive" status after 4 days of inactivity
  2. Candidates automatically expire to "Passive" status after 4 days of no applications
  3. Inactive/spam postings are flagged and downranked in listings
**Research**: Unlikely (Cloud Functions scheduled tasks)
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

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
| 1. Foundation & Identity | 0/TBD | Not started | - |
| 2. Marketplace Mechanics | 0/TBD | Not started | - |
| 3. Semantic Matching Engine | 0/TBD | Not started | - |
| 4. Employer Suite | 0/TBD | Not started | - |
| 5. Seeker Tools | 0/TBD | Not started | - |
| 6. Growth & Monetization | 0/TBD | Not started | - |
