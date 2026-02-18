# Requirements: IEH (AI Job Board)

**Defined:** 2026-01-16
**Core Value:** Active ecosystem connecting IT/ITES talent with opportunity using semantic matching and AI tools.

## v1 Requirements

### Authentication & Roles

- [x] **AUTH-01**: Users can sign up/login as Job Seeker or Employer (Email/Password, Google)
- [x] **AUTH-02**: Granular RBAC for Employers (Owner, Recruiter, Hiring Manager)
- [x] **AUTH-03**: Super Admin dashboard for system oversight and approvals

### Marketplace Mechanics ("The Active System")

- [x] **MKT-01**: Jobs automatically marked "Passive" if no recruiter action in 4 days
- [x] **MKT-02**: Candidates automatically marked "Passive" if no application made in 4 days
- [x] **MKT-03**: Ghost Job Filter to flag and downrank inactive/spam postings

### Matching & Search

- [x] **MATCH-01**: Bi-directional semantic matching (Candidate <-> Job) using Vector Search
- [x] **MATCH-02**: Domain-specific tuning for India IT/ITES/BPO/KPO sectors
- [x] **MATCH-03**: Candidate Scoring Engine based on Experience, Skills, and Industry Context

### Employer Tools

- [x] **EMP-01**: AI JD Generator (Gemini-powered) with optimization suggestions
- [x] **EMP-02**: AI Screening Question Generator based on job role
- [x] **EMP-03**: Built-in Basic ATS (Kanban pipeline, status tracking, automated follow-ups)
- [x] **EMP-04**: Employer Branding Page (Culture, Video, Job Library)

### Job Seeker Tools

- [x] **SEEK-01**: AI Resume Analyzer (ATS score, keyword matching, missing skills)
- [x] **SEEK-02**: Real-time Skill Gap Analysis against target roles
- [x] **SEEK-03**: Simulated Interview Prep (Role-specific questions & feedback)
- [x] **SEEK-04**: Verified Skill Proofs (AI-driven assessments)
- [x] **SEEK-05**: Real-time Salary/Market Index
- [x] **SEEK-06**: Insider Connections (Identify alumni/network at target companies)

### Growth & Monetization

- [x] **GROW-01**: Referral System — Implemented as Brownie Points credits for verified referrals
- [x] **GROW-02**: Affiliate Program — Atomic ledger-based point system with audit trail
- [x] **GROW-03**: Subscription management — Deferred to post-funding; point redemption store implemented as bridge

## v2 Requirements (Deferred)

### Compliance & Advanced AI
- **COMP-01**: Explainable Scoring (XAI) - Regulatory requirement (EU/NYC) deferred
- **COMP-02**: Autonomous Career Agents - Proactive market monitoring
- **COMP-03**: Predictive Career Pathing - 5-year trajectory mapping
- **COMP-04**: Conversational Discovery - Natural language search interface

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video Emotion AI | Anti-feature: High bias risk and regulatory friction |
| Social Media Scraping | Anti-feature: Privacy concerns and data quality issues |
| Automated "Ghost" Applications | Anti-feature: Spam generation, degrades platform trust |
| Self-hosted Infrastructure | Constraint: Must use Firebase/Serverless ecosystem |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| MKT-01 | Phase 2 | Complete |
| MKT-02 | Phase 2 | Complete |
| MKT-03 | Phase 2 | Complete |
| MATCH-01 | Phase 3 | Complete |
| MATCH-02 | Phase 3 | Complete |
| MATCH-03 | Phase 3 | Complete |
| EMP-01 | Phase 4 | Complete |
| EMP-02 | Phase 4 | Complete |
| EMP-03 | Phase 4 | Complete |
| EMP-04 | Phase 4 | Complete |
| SEEK-01 | Phase 5 | Complete |
| SEEK-02 | Phase 5 | Complete |
| SEEK-03 | Phase 5 | Complete |
| SEEK-04 | Phase 5 | Complete |
| SEEK-05 | Phase 5 | Complete |
| SEEK-06 | Phase 5 | Complete |
| GROW-01 | Phase 6 | Complete |
| GROW-02 | Phase 6 | Complete |
| GROW-03 | Phase 6 | Complete (partial — point system, subscriptions deferred) |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-16*
