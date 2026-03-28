# WorkMila — Sprint Plan

Sourced from real user feedback + internal review sessions.
Last updated: 2026-03-24 (Sprint 4 largely complete)

---

## Status Key
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[skip]` Deferred / out of scope

---

## Sprint 1 — Unblock & Polish (current)

Goal: Fix every issue a first-time user hits before they even reach a feature.

### UI Restyle (remaining old-style screens)

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-UI-01 | `[x]` Restyle Login card variant | `src/components/Login.tsx` | Fixed — modern SaaS style matching Register.tsx |
| S1-UI-02 | `[x]` Restyle Seeker Dashboard sub-components | `src/features/seeker/components/Shortlist/ShortlistFeed.tsx`, `src/features/seeker/components/Market/MarketTrends.tsx` | Fixed — both components restyled to modern SaaS |
| S1-UI-03 | `[x]` ProtectedRoute black spinner | `src/components/ProtectedRoute.tsx` | Fixed — now matches WorkMila PageLoader |
| S1-UI-04 | `[x]` RoleSelection modal brutalist | `src/components/RoleSelection.tsx` | Fixed |
| S1-UI-05 | `[x]` JobCard / JobSearchBar / StatusBadge | multiple | Fixed |
| S1-UI-06 | `[x]` KanbanColumn / ApplicantCard | multiple | Fixed |
| S1-UI-07 | `[x]` Skeleton loaders | `src/components/ui/Skeleton.tsx` | Fixed |

### Auth & Routing Bugs

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-AUTH-01 | `[x]` Email login not working for candidates | `src/context/AuthProvider.tsx`, Firebase console | Code is correct — Firebase Email provider must be enabled in Firebase Console. Friendly error messages added for all common error codes. |
| S1-AUTH-02 | `[x]` After login → redirect to dashboard (both roles) | `src/App.tsx` `DashboardRedirect` | Already handled at route level — confirmed. |
| S1-AUTH-03 | `[x]` "Terminate Session" box on `/login` when already logged in | `src/components/Login.tsx` card variant | Fixed — route redirects logged-in users; dead code removed from card |
| S1-AUTH-04 | `[x]` Top-right name → dropdown (Profile / Logout) | `src/components/Login.tsx` navbar variant | Fixed — dropdown with Profile / Settings / Sign Out |

### Navigation Broken

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-NAV-01 | `[x]` "AI Prep" nav button not working | `src/components/Header.tsx` | Fixed — routes to `/seeker/interview` for seekers, `/login` for unauthenticated |
| S1-NAV-02 | `[x]` "Pricing" nav button not working | `src/components/Header.tsx`, `src/pages/PricingPage.tsx` | Fixed — `PricingPage.tsx` created with seeker/employer tab toggle and 3 tiers each |

### Job Detail Error

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-JOB-01 | `[x]` Job detail page shows error on click | `src/pages/JobDetailPage.tsx` | Fixed — two root causes: (1) Firestore rules require auth for job reads; unauthenticated users now redirected to `/login`. (2) `job.skills.map()` and `job.type.replace()` crash if fields missing — fixed with `?? []` / `?.` guards |

### Apply Button in Search Results

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-APPLY-01 | `[x]` Add Apply button to JobCard in search results | `src/components/JobCard.tsx`, `src/pages/JobsPage.tsx` | Fixed — "Apply Now" CTA visible on card footer for seekers. Fetches full JobPosting on click and opens ApplyModal inline |

---

## Sprint 2 — Search & Filters

Goal: Make job discovery actually useful.

| ID | Task | Notes |
|----|------|-------|
| S2-SEARCH-01 | `[x]` More filters on Find Jobs | `JobSearchBar` now has expandable filter panel: city text input, job type select (full-time/part-time/contract/internship), experience level (entry/mid/senior), min salary (₹ LPA). Work mode dropdown retained. All filters passed to backend. |
| S2-SEARCH-02 | `[x]` Spell-check / "did you mean" suggestions | On search with 0 results, suggest alternative queries. Backend: fuzzy match against job titles index |
| S2-SEARCH-03 | `[x]` Search result relevance improvement | Results with matchScore < 30 filtered out in `jobs.service.js`. Also fixed `job.skills.join()` crash when skills is not an array. |
| S2-SEARCH-04 | `[x]` Mobile layout — search bar and jobs grid | Filter panel uses `flex-wrap` + `min-w` so controls stack cleanly on mobile. Grid already single-column on small screens. |

---

## Sprint 3 — Profile & Resume Intelligence

Goal: Make the candidate profile actually reflect the person.

| ID | Task | Notes |
|----|------|-------|
| S3-PROFILE-01 | `[x]``[ ]` Candidate location = city name (not work mode) | Profile location field should be free-text city (e.g. "Mumbai") not remote/hybrid/office enum |
| S3-PROFILE-02 | `[x]``[ ]` Work preference = separate remote/hybrid/office multi-select | Add `work_preference` field to `SeekerProfile` type; show as multi-select checkboxes in profile editor |
| S3-PROFILE-03 | `[x]``[ ]` Targeted role — editable with suggestions | Pre-fill from resume, show suggestions dropdown, allow manual override |
| S3-PROFILE-04 | `[x]``[ ]` Skills in profile editor — autocomplete suggestions | On skill input, suggest from CV parsed keywords + curated skills list |
| S3-PROFILE-05 | `[ ]` Filter irrelevant skills from extraction | Resume parse: only include explicitly listed skills, not incidental words from job descriptions |
| S3-RESUME-01 | `[x]``[ ]` Resume Intelligence — show current CV analysis first | Reorder flow: show existing analysis → then offer Upload New / Optimize with AI |
| S3-RESUME-02 | `[x]``[ ]` Resume Intelligence — add action buttons after analysis | "Back to Dashboard" + "Optimize with AI" CTAs on result screen |
| S3-RESUME-03 | `[ ]` AI CV builder — structured sections | Template: Summary / Skills / Experience / Education. Currently flat output |
| S3-SKILL-01 | `[x]` Rename "bridge assets" → "Skill Upgrade Path" | `GapAnalysis.tsx` already uses "Skills to Learn" and "Learning Resources" — clean copy confirmed |
| S3-SKILL-02 | `[x]` Rename "skill void" → "Missing Skills" | Same — confirmed clean in `GapAnalysis.tsx` |
| S3-SKILL-03 | `[x]` "Targeted semantic void" — plain English copy | Confirmed clean — no jargon in codebase |
| S3-SKILL-04 | `[x]` Targeted career path — make editable | Field is editable in ProfileEditor |
| S3-INTERVIEW-01 | `[x]` Interview prep — auto-fill from resume | Pre-population implemented |
| M-4 | `[~]` "Forgot Password" flow | `AuthContext` + `AuthProvider` + `Login.tsx` — inline forgot-password UI with Firebase `sendPasswordResetEmail` |
| M-8 | `[~]` Profile completeness indicator | Compute score from profile fields; show labeled progress bar in `ProfileEditor.tsx` |

---

## Sprint 4 — Auth, Onboarding & Verification

Goal: First-time experience is complete and trustworthy.

| ID | Task | Notes |
|----|------|-------|
| S4-AUTH-01 | `[x]` Separate Employer vs Candidate login/register entry | `AuthEntry.tsx` — role picker screen at `/login` and `/register`; navigates to `/{mode}/seeker` or `/{mode}/employer` paths |
| S4-AUTH-02 | `[skip]` LinkedIn login option | Firebase limitation — deferred (D-02) |
| S4-AUTH-03 | `[ ]` Mobile number mandatory at registration | Add `phone` field to Register form; Firebase phone auth for OTP on first entry |
| S4-AUTH-04 | `[x]` Email verification after registration | `VerifyEmail.tsx` with resend + "I've verified" check; `sendVerificationEmail` in AuthProvider |
| S4-ONBOARD-01 | `[x]` First-time login → mandatory onboarding flow | `Onboarding.tsx` — guided welcome → CV upload → target role → done; employer variant → company name |
| S4-ONBOARD-02 | `[skip]` Education verification — define mechanism | Product + legal decision needed (D-01) |

---

## Sprint 5 — Advanced Features

Goal: Power features that differentiate WorkMila.

| ID | Task | Notes |
|----|------|-------|
| S5-UX-01 | `[ ]` Top-right profile dropdown — show Logout inside | Move logout out of header into a dropdown with Profile / Settings / Logout |
| S5-UX-02 | `[ ]` Mobile web — full responsive audit | Systematic pass: all pages at 375px, 390px, 430px. Fix clipped UI, overflowing text, tap targets |
| S5-MATCH-01 | `[ ]` Show why a job matched — AI reasoning snippet | On JobCard / ShortlistFeed, show 1-line AI reasoning for the match score |
| S5-INTERVIEW-01 | `[ ]` Voice-enabled interview prep | Web Speech API: narrate questions, record verbal responses, transcribe and score |
| S5-SEARCH-01 | `[ ]` Shortlist feed — contextual apply from dashboard | "Apply" directly from the shortlist card without navigating to job detail |

---

## Deferred / Needs Product Decision

| ID | Issue | Reason |
|----|-------|--------|
| D-01 | How is education verified? | Needs product + legal decision before building |
| D-02 | LinkedIn login | Firebase limitation; needs infra evaluation |
| D-03 | Voice interview prep | High effort; validate demand first |

---

## Sprint 5 — Employer Unblock & Seeker Power Features

Goal: Unblock employers from core hiring workflows; add seeker convenience features.

### Employer

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-EMP-01 | `[ ]` Employer dashboard home | `src/pages/employer/` | KPIs, recent activity, quick actions. Currently lands on `/employer/jobs` with no summary view |
| S5-EMP-02 | `[ ]` Edit / Pause / Delete job posting | `src/pages/employer/EmployerJobs.tsx` | `EmployerJobs.tsx` shows list only — no inline edit, pause, or close action |
| S5-EMP-03 | `[ ]` Applicant pipeline — Kanban | `src/pages/employer/JobApplicants.tsx` | Add Applied → Screening → Interview → Offer pipeline mirroring seeker's ApplicationBoard |
| S5-EMP-04 | `[ ]` Candidate detail view from Talent Search | `src/pages/employer/TalentSearch.tsx` | `CandidateCard` onClick is a placeholder — employers can't view full profiles |
| S5-EMP-05 | `[ ]` Save / shortlist candidates | `src/pages/employer/TalentSearch.tsx` | No way for employers to bookmark candidates from search for later follow-up |
| S5-EMP-06 | `[ ]` Employer company profile completeness | `src/pages/employer/CompanyEditor.tsx` | No completeness indicator; incomplete profiles hurt candidate trust |
| S5-EMP-07 | `[ ]` AI-assisted job description writing | `src/pages/PostJob.tsx` | "Generate JD" powered by Gemini when posting a job |

### Seeker

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-SEEKER-01 | `[ ]` Apply directly from shortlist feed on dashboard | `src/features/seeker/components/Shortlist/ShortlistFeed.tsx` | Currently must navigate to job detail to apply; high-friction for warm leads |
| S5-SEEKER-02 | `[ ]` "Why this job matched" reasoning on shortlist cards | `src/features/seeker/components/Shortlist/ShortlistFeed.tsx` | `ShortlistedJob.reason` field exists in types but not surfaced in UI |
| S5-SEEKER-03 | `[ ]` Saved jobs | `src/features/seeker/` | No way to bookmark a job for later |
| S5-SEEKER-04 | `[ ]` Application notes & reminders | `src/features/seeker/components/ApplicationBoard/` | `Application` type has `notes` and `reminder_date` but UI doesn't expose them |

### Account

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-ACC-01 | `[x]` Account settings page | `src/pages/SettingsPage.tsx` | `/settings` route — display name edit, password reset email, account deletion. `/profile` smart-redirects to role-specific profile page |
| S5-ACC-02 | `[ ]` Change email/phone with re-verification | `src/context/AuthProvider.tsx` | Required for compliance and trust |

### UX

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-UX-01 | `[ ]` Mobile responsiveness audit | all pages | Systematic pass at 375px, 390px, 430px — fix clipped UI, overflowing text, tap targets |

---

## Sprint 6 — Admin, Notifications & Platform Polish

Goal: Complete admin functionality; add transactional notifications and platform-wide polish.

### Admin

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S6-ADMIN-01 | `[ ]` Admin Users Management | `src/pages/admin/` | `/admin/users` is a placeholder div |
| S6-ADMIN-02 | `[ ]` Admin Settings page | `src/pages/admin/` | `/admin/settings` is a placeholder — platform fee config, feature flags |
| S6-ADMIN-03 | `[ ]` Admin stats from live Firestore data | `src/pages/admin/AdminDashboard.tsx` | Currently hardcoded values — needs live Firestore aggregations |
| S6-ADMIN-04 | `[ ]` Job posting analytics for employers | `src/pages/employer/` | Views, applications per posting, conversion rate |

### Notifications

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S6-NOTIF-01 | `[ ]` In-app notifications | `src/features/` | Seekers: employer viewed profile, application status change, new matched jobs |
| S6-NOTIF-02 | `[ ]` Transactional email | `functions/` | Application updates, job matches, account events — Firebase Extensions + SendGrid |
| S6-NOTIF-03 | `[ ]` Job alert subscriptions | `src/features/` | "Notify me when new React jobs in Bangalore are posted" |
| S6-NOTIF-04 | `[ ]` Message / contact candidate | `src/features/` | Employers need a way to reach candidates from Talent Search / applicant list |

### Platform

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S6-PLAT-01 | `[ ]` Multi-seat employer accounts | `src/context/`, `src/server/` | Currently one account per company; growing teams need member access |
| S6-PLAT-02 | `[ ]` Phone number at registration + OTP | `src/pages/Register.tsx` | Partially deferred from S4-AUTH-03; required for fraud prevention |
| S6-PLAT-03 | `[ ]` Brownie Points leaderboard | `src/features/growth/` | Referral gamification partially built; leaderboard drives viral loops |
| S6-PLAT-04 | `[ ]` Dark mode | `src/index.css` | No theme switching; `index.css` has no dark mode vars |
| S6-PLAT-05 | `[ ]` PWA (Progressive Web App) | `index.html`, `vite.config.ts` | Installable + offline capable; high value for mobile-first audience |

---

## Already Completed (reference)

| What | When |
|------|------|
| Full design overhaul — neobrutalist → modern SaaS | Sprint 0 |
| WorkMila rebrand (all IEH references) | Sprint 0 |
| JobCard, JobSearchBar, StatusBadge restyle | Sprint 0 |
| KanbanColumn, ApplicantCard restyle | Sprint 0 |
| Skeleton loaders restyle | Sprint 0 |
| ProtectedRoute double-loader fix | Sprint 0 |
| RoleSelection modal restyle | Sprint 0 |
| AdminSidebar, Register page restyle | Sprint 0 |
| PageLoader WorkMila branding | Sprint 0 |
| referralService WM- prefix | Sprint 0 |
