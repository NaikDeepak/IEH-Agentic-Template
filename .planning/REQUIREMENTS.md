# Requirements: IEH (AI Job Board)

**Defined:** 2026-01-16
**Core Value:** Active ecosystem connecting IT/ITES talent with opportunity using semantic matching and AI tools.

## v1 Requirements

### Authentication & Roles

- [ ] **AUTH-01**: Users can sign up/login as Job Seeker or Employer (Email/Password, Google)
- [ ] **AUTH-02**: Granular RBAC for Employers (Owner, Recruiter, Hiring Manager)
- [ ] **AUTH-03**: Super Admin dashboard for system oversight and approvals

### Marketplace Mechanics ("The Active System")

- [ ] **MKT-01**: Jobs automatically marked "Passive" if no recruiter action in 4 days
- [ ] **MKT-02**: Candidates automatically marked "Passive" if no application made in 4 days
- [ ] **MKT-03**: Ghost Job Filter to flag and downrank inactive/spam postings

### Matching & Search

- [ ] **MATCH-01**: Bi-directional semantic matching (Candidate <-> Job) using Vector Search
- [ ] **MATCH-02**: Domain-specific tuning for India IT/ITES/BPO/KPO sectors
- [ ] **MATCH-03**: Candidate Scoring Engine based on Experience, Skills, and Industry Context

### Employer Tools

- [ ] **EMP-01**: AI JD Generator (Gemini-powered) with optimization suggestions
- [ ] **EMP-02**: AI Screening Question Generator based on job role
- [ ] **EMP-03**: Built-in Basic ATS (Kanban pipeline, status tracking, automated follow-ups)
- [ ] **EMP-04**: Employer Branding Page (Culture, Video, Job Library)

### Job Seeker Tools

- [ ] **SEEK-01**: AI Resume Analyzer (ATS score, keyword matching, missing skills)
- [ ] **SEEK-02**: Real-time Skill Gap Analysis against target roles
- [ ] **SEEK-03**: Simulated Interview Prep (Role-specific questions & feedback)
- [ ] **SEEK-04**: Verified Skill Proofs (AI-driven assessments)
- [ ] **SEEK-05**: Real-time Salary/Market Index
- [ ] **SEEK-06**: Insider Connections (Identify alumni/network at target companies)

### Growth & Monetization

- [ ] **GROW-01**: Referral System (Cash/Credits for successful hires)
- [ ] **GROW-02**: Affiliate Program for job seekers (Points for referrals)
- [ ] **GROW-03**: Subscription management (Employer tiers, Seeker premium packs)

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
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| MKT-01 | Phase 2 | Pending |
| MKT-02 | Phase 2 | Pending |
| MKT-03 | Phase 2 | Pending |
| MATCH-01 | Phase 3 | Pending |
| MATCH-02 | Phase 3 | Pending |
| MATCH-03 | Phase 3 | Pending |
| EMP-01 | Phase 4 | Pending |
| EMP-02 | Phase 4 | Pending |
| EMP-03 | Phase 4 | Pending |
| EMP-04 | Phase 4 | Pending |
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
