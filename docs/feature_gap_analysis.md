# WorkMila — Feature Gap Analysis

> **Scope**: Review of all implemented routes, pages, features, and Sprint Plan as of 2026-03-22.
> **Legend**: 🔴 Must Have · 🟡 Should Have · 🟢 Good to Have
> **Status**: `[x]` Done · `[~]` In Progress · `[ ]` Pending · `[skip]` Deferred

---

## 🔴 Must Have

These are blockers — a real user would churn or not convert without them.

### Auth & Onboarding

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| M-1 | **Separate Seeker vs. Employer login/register entry point** | Sprint 4 | `[ ]` | Currently same `/login`. Newcomers are confused which path to take. Tailored copy and CTAs drive conversion. |
| M-2 | **Email OTP verification after registration** | Sprint 4 | `[ ]` | Accounts can be created with any email. No verification means spam risk and mistrust. Lock access until email is confirmed. |
| M-3 | **Mandatory onboarding flow after first login** | Sprint 4 | `[ ]` | After role assignment, users land directly on dashboard with empty state. There should be a guided first-use flow: upload CV / build with AI / set target role. |
| M-4 | **"Forgot Password" flow** | Sprint 3 | `[~]` | Not visible in the Login component. Critical safety net for any auth system. |
| M-5 | **Phone number at registration + OTP** | Sprint 4 | `[ ]` | Required for trust, notifications, and fraud prevention. Schema has `phone` in `parsed_data` but not as a mandatory registration field. |

### Job Seeker — Core Flows

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| M-6 | **Resume Intelligence — show existing analysis first** | Sprint 3 | `[x]` | Current flow re-uploads every session. Users expect to see their last analysis immediately. |
| M-7 | **Profile: Separate location (city) vs. work preference (remote/hybrid/office)** | Sprint 3 | `[x]` | `SeekerProfile` now has `currentLocation` (free-text) and `work_preferences` (multi-select). |
| M-8 | **Profile completeness indicator** | Sprint 3 | `[~]` | Users don't know what to fill in. A "profile score" nudges completion and improves match quality. |
| M-9 | **Apply directly from shortlist feed on dashboard** | Sprint 5 | `[ ]` | Users must navigate to job detail to apply. Friction kills conversion for warm leads. |
| M-10 | **Notifications** | Sprint 6 | `[ ]` | No notification system exists. Seekers need to know when employers view their profile, when application status changes, or when new matched jobs arrive. |

### Employer — Core Flows

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| M-11 | **Employer dashboard (home screen)** | Sprint 5 | `[ ]` | Employers land on `/employer/jobs`. There is no actual employer dashboard with KPIs, recent activity, or quick actions. |
| M-12 | **Edit / Pause / Delete job posting** | Sprint 5 | `[ ]` | `EmployerJobs.tsx` only shows jobs and links to applicants. No inline edit, pause, or close action on a posting. |
| M-13 | **Applicant pipeline management** | Sprint 5 | `[ ]` | `JobApplicants.tsx` exists but needs a Kanban-style pipeline (Applied → Screening → Interview → Offer) mirroring the seeker's ApplicationBoard. |
| M-14 | **Candidate detail view from Talent Search** | Sprint 5 | `[ ]` | `TalentSearch` renders `CandidateCard` but `onClick` is a placeholder. Employers can't view full profiles. |
| M-15 | **Message / contact candidate** | Sprint 6 | `[ ]` | No mechanism for employers to reach out to candidates found via Talent Search or applicant list. |

### Admin

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| M-16 | **Admin Users Management** | Sprint 6 | `[ ]` | `/admin/users` is a literal placeholder div. Core admin function. |
| M-17 | **Admin Settings page** | Sprint 6 | `[ ]` | `/admin/settings` is also a placeholder. At minimum: platform fee config, feature flags. |
| M-18 | **Admin stats from real data** | Sprint 6 | `[ ]` | `AdminDashboard.tsx` uses hardcoded values. These need to be live Firestore aggregations. |

---

## 🟡 Should Have

Significant gaps that affect quality and trust, but not immediate conversion blockers.

### Auth & Account

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| S-1 | **LinkedIn login** | Sprint 4 | `[skip]` | Firebase doesn't support LinkedIn natively. Requires custom OAuth or Auth0. Deferred (D-02). |
| S-2 | **Google login** | Sprint 3 | `[x]` | Already implemented via Firebase Google provider. |
| S-3 | **"Change email/phone" with re-verification** | Sprint 5 | `[ ]` | Currently no flow for this. Required for compliance and trust. |
| S-4 | **Account settings page** | Sprint 5 | `[ ]` | No `/settings` route for regular users. Should cover password change, notification preferences, account deletion. |

### Job Seeker

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| S-5 | **Skill autocomplete in profile editor** | Sprint 3 | `[x]` | Implemented — `SKILL_SUGGESTIONS` list with autocomplete in `ProfileEditor.tsx`. |
| S-6 | **AI CV builder — structured template output** | Sprint 3 | `[~]` | Resume builder outputs unstructured text. Needs sections: Summary / Skills / Experience / Education. |
| S-7 | **Interview prep — auto-fill from resume** | Sprint 3 | `[x]` | Pre-fills target role and skills from latest resume parse. |
| S-8 | **"Why this job matched" reasoning on shortlist cards** | Sprint 5 | `[ ]` | `ShortlistedJob.reason` field exists in types but isn't surfaced in the UI. |
| S-9 | **Saved jobs** | Sprint 5 | `[ ]` | No way for a seeker to bookmark a job for later. Common expectation. |
| S-10 | **Application notes & reminders** | Sprint 5 | `[ ]` | `Application` type has `notes` and `reminder_date` fields but the Application Board UI doesn't expose them. |
| S-11 | **Skill gap — plain English labels** | Sprint 3 | `[x]` | "Bridge assets", "skill void", "targeted semantic void" renamed to "Skills to Learn", "Missing Skills", "Learning Resources" in `GapAnalysis.tsx`. |

### Employer

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| S-12 | **Employer profile / company page completeness check** | Sprint 5 | `[ ]` | No indicator of profile completeness. Incomplete company profiles hurt candidate trust. |
| S-13 | **Job posting analytics** | Sprint 6 | `[ ]` | Views, applications per posting, conversion rate. Basic data for employers to optimize. |
| S-14 | **Save / shortlist candidates** | Sprint 5 | `[ ]` | Employers can search talent but not save/shortlist for later follow-up. |
| S-15 | **Multi-seat employer accounts** | Sprint 6 | `[ ]` | Currently one employer account per company. Growing companies need team access. |

### Platform

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| S-16 | **Pricing page** | Deferred | `[skip]` | `/pricing` route exists but content is a product/marketing decision (D-04). |
| S-17 | **Full mobile responsiveness audit** | Sprint 5 | `[ ]` | Confirmed incomplete at 375px. Systematic pass needed across all pages. |
| S-18 | **Email notifications (transactional)** | Sprint 6 | `[ ]` | No email flows for application updates, job matches, or account events. Firebase Extensions + SendGrid. |

---

## 🟢 Good to Have

Differentiators that add delight or competitive edge.

### Job Seeker

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| G-1 | **Voice-enabled interview prep** | Deferred | `[skip]` | Web Speech API. High effort — validate demand first (D-03). |
| G-2 | **Career path visualization** | Sprint 6 | `[ ]` | Show growth trajectory from current role → target role with milestones. |
| G-3 | **LinkedIn profile sync** | Deferred | `[skip]` | Pull experience/education/skills from LinkedIn. Needs LinkedIn API access. |
| G-4 | **Education verification** | Deferred | `[skip]` | Product + legal decision needed (D-01). |
| G-5 | **Brownie Points leaderboard / gamification** | Sprint 5 | `[ ]` | Referral and engagement gamification is partially built. A leaderboard would drive viral loops. |
| G-6 | **Job alert subscriptions** | Sprint 6 | `[ ]` | "Notify me when new React jobs in Bangalore are posted." Email or push notification. |

### Employer

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| G-7 | **AI-assisted job description writing** | Sprint 5 | `[ ]` | A "Generate JD" feature powered by Gemini when posting a job. |
| G-8 | **Automated candidate scoring** | Sprint 6 | `[ ]` | When applicants come in, rank them against the JD using AI before the employer reviews. |
| G-9 | **Schedule interview from platform** | Sprint 6 | `[ ]` | Calendar integration (Google Calendar / Calendly) to book interviews directly. |

### Platform

| # | Feature | Sprint | Status | Context |
|---|---------|--------|--------|---------|
| G-10 | **Dark mode** | Sprint 6 | `[ ]` | No theme switching. `index.css` has no dark mode vars. |
| G-11 | **Progressive Web App (PWA)** | Sprint 6 | `[ ]` | Installable, offline-capable. Given the mobile-first audience, high value. |
| G-12 | **Public blog / content hub** | Deferred | `[skip]` | SEO play. Articles on job search tips, resume writing, salary guides. |
| G-13 | **Referral program for employers** | Sprint 6 | `[ ]` | Currently referrals are seeker-only. Extend to employers bringing other employers. |

---

## Sprint Roadmap Summary

| Sprint | Focus | Key Items |
|--------|-------|-----------|
| Sprint 3 (current) | Profile & Resume Intelligence | M-4, M-6✓, M-7✓, M-8, S-5✓, S-6, S-7✓, S-11✓ |
| Sprint 4 | Auth Hardening & Onboarding | M-1, M-2, M-3, M-5 |
| Sprint 5 | Employer Unblock | M-9, M-11, M-12, M-13, M-14, S-3, S-4, S-8, S-9, S-10, S-12, S-14, S-17 |
| Sprint 6 | Admin + Platform Polish | M-10, M-15, M-16, M-17, M-18, S-13, S-15, S-18, G-6, G-8, G-9, G-10, G-11, G-13 |
| Deferred | Product/legal decisions needed | M-5 (partial), S-1, S-16, G-1, G-3, G-4, G-12 |

## Summary Counts

| Priority | Total | Done | In Progress | Pending |
|----------|-------|------|-------------|---------|
| 🔴 Must Have | 18 | 2 | 2 | 14 |
| 🟡 Should Have | 18 | 4 | 1 | 13 |
| 🟢 Good to Have | 13 | 0 | 0 | 13 |
