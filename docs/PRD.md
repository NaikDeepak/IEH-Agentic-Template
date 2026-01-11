# Product Requirements Document (PRD): India Employment Hub

## 1. Executive Summary
**Vision:** To become India’s #1 AI hiring platform by connecting talent with opportunity intelligently.
**Goal:** Build an AI-first recruitment ecosystem that actively improves hiring efficiency and candidate employability, solving the "hiring crisis" in the IT, ITES, BPO, and KPO sectors.
**Core Differentiator:** "Active" ecosystem (4-day activity rule) + Deep AI integration for both employers and candidates.

## 2. Problem Statement
**Employers:** High hiring costs, low applicant quality, flood of irrelevant profiles, lack of intelligent screening, primitive ATS tools.
**Job Seekers:** Endless browsing with no feedback, lack of career guidance, expensive platforms, no interview prep support.

## 3. User Personas & granular RBAC
1.  **Platform Admin (Super Admin):** Full system oversight, managing employer approvals and subscription plans.
2.  **Employer Organization:**
    *   **Owner (Admin):** Billing, Company Profile, Invite Users.
    *   **Recruiter:** Post jobs, view all candidates, manage pipeline.
    *   **Hiring Manager:** View assigned jobs, shortlist candidates, interview feedback only.
3.  **Job Seeker:** Individual contributor looking for active roles.

## 4. Key Features & Functional Requirements

### 4.1. Core Mechanics: "The Active System"
-   **Active Jobs (Employer):** Jobs become "Passive" (low/no visibility) if no recruiter action is taken within 4 days.
-   **Active Candidates (Seeker):** Profiles become "Passive" if no application is made within 4 days.
-   **Goal:** Ensure high responsiveness and trust on both sides.

### 4.2. Next-Gen UI/UX Philosophy ("No Clutter")
-   **Split-Pane Layout:** Dashboard with "Job List" on left, "Details/AI Summary" on right to minimize navigation.
-   **Visual Scoring:** "Match Rings" (Green/Red) instead of dense text.
-   **Summarization over Listing:** AI-condensed JD highlights and candidate outlines.

### 4.3. Employer Module
-   **AI Hiring Assistant:**
    -   Free JD Generator (Gemini-powered).
    -   JD Optimization Suggestions.
    -   AI Screening Question Generator.
    -   **[NEW] Ghost Job Filter:** Auto-flag inactive/spam postings to keep trust high.
-   **Built-in ATS (Free):**
    -   Resume tracking, hiring pipeline (Kanban), status updates.
    -   Analytics (Premium).
-   **Candidate Scoring Engine:**
    -   Rank candidates by **Three Pillars**: 1. Experience Level, 2. Skill Match, 3. Industry Context.
-   **Employer Branding:**
    -   Dedicated career page, culture profile, video section.

### 4.4. Job Seeker Module
-   **AI Resume Analyzer (Free):**
    -   ATS score, keyword matching, missing skills analysis.
-   **Smart Job Matching:**
    -   Recommendations based on Experience, Skills, Salary, Location.
-   **[NEW] Insider Connections:**
    -   Identify alumni/connections at target companies (LinkedIn integration logic).
-   **Resume Boost (Paid):**
    -   AI rewrite, formatting, keyword injection.
-   **Interview Prep AI:**
    -   Mock interviews (Chat/Voice), role-specific questions, feedback, confidence coaching.
-   **Career Premium Pack (Subscription):**
    -   Roadmap, salary benchmarking, skill gap analysis.

### 4.5. Growth & Viral Loops
-   **Referral System:** Cash/Credits for successful hires.
-   **Affiliate Program:** Points for referrals redeemable for premium features.

## 5. Business Model
-   **Employers:**
    -   Basic: ₹4,999/mo (Small scale)
    -   Growth: ₹14,999/mo
    -   Enterprise: ₹49,999/mo
-   **Job Seekers:**
    -   Resume Boost: ₹399
    -   Interview AI: ₹999
    -   Career Pack: ₹1,499/mo

## 6. Success Metrics
-   **North Star:** "Active Matches" (Interviews scheduled from active jobs/candidates).
-   **Traction Goals:**
    -   6 Months: 1,000 Seekers, 50 Employers.
    -   12 Months: 5,000 Seekers, 200 Employers.
