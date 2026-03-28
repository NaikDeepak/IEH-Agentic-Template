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
| S3-PROFILE-01 | `[x]` Candidate location = city name (not work mode) | `currentLocation` free-text field in ProfileEditor ✓ |
| S3-PROFILE-02 | `[x]` Work preference = separate remote/hybrid/office multi-select | `work_preferences` multi-select checkboxes in ProfileEditor ✓ |
| S3-PROFILE-03 | `[x]` Targeted role — editable with suggestions | Role suggestions dropdown + tag list in ProfileEditor ✓ |
| S3-PROFILE-04 | `[x]` Skills in profile editor — autocomplete suggestions | Resume keyword suggestions + curated skill list in ProfileEditor ✓ |
| S3-PROFILE-05 | `[x]` Filter irrelevant skills from extraction | System prompt tightened: only candidate-claimed skills; no incidental job-description mentions; max 25, normalised |
| S3-RESUME-01 | `[x]` Resume Intelligence — show current CV analysis first | Reorder flow: show existing analysis → then offer Upload New / Optimize with AI |
| S3-RESUME-02 | `[x]` Resume Intelligence — add action buttons after analysis | "Back to Dashboard" + "Optimize with AI" CTAs on result screen |
| S3-RESUME-03 | `[x]` AI CV builder — structured sections | `CVBuilder.tsx` — Summary / Skills / Experience / Education with copy-all |
| S3-SKILL-01 | `[x]` Rename "bridge assets" → "Skill Upgrade Path" | `GapAnalysis.tsx` already uses "Skills to Learn" and "Learning Resources" — clean copy confirmed |
| S3-SKILL-02 | `[x]` Rename "skill void" → "Missing Skills" | Same — confirmed clean in `GapAnalysis.tsx` |
| S3-SKILL-03 | `[x]` "Targeted semantic void" — plain English copy | Confirmed clean — no jargon in codebase |
| S3-SKILL-04 | `[x]` Targeted career path — make editable | Field is editable in ProfileEditor |
| S3-INTERVIEW-01 | `[x]` Interview prep — auto-fill from resume | Pre-population implemented |
| M-4 | `[x]` "Forgot Password" flow | `AuthContext` + `AuthProvider` + `Login.tsx` — inline forgot-password UI with Firebase `sendPasswordResetEmail` |
| M-8 | `[x]` Profile completeness indicator | Compute score from profile fields; show labeled progress bar in `ProfileEditor.tsx` |

---

## Sprint 4 — Auth, Onboarding & Verification

Goal: First-time experience is complete and trustworthy.

| ID | Task | Notes |
|----|------|-------|
| S4-AUTH-01 | `[x]` Separate Employer vs Candidate login/register entry | `AuthEntry.tsx` — role picker screen at `/login` and `/register`; navigates to `/{mode}/seeker` or `/{mode}/employer` paths |
| S4-AUTH-02 | `[skip]` LinkedIn login option | Firebase limitation — deferred (D-02) |
| S4-AUTH-03 | `[~]` Mobile number mandatory at registration | Deferred to end — requires Firebase phone auth config + thorough testing |
| S4-AUTH-04 | `[x]` Email verification after registration | `VerifyEmail.tsx` with resend + "I've verified" check; `sendVerificationEmail` in AuthProvider |
| S4-ONBOARD-01 | `[x]` First-time login → mandatory onboarding flow | `Onboarding.tsx` — guided welcome → CV upload → target role → done; employer variant → company name |
| S4-ONBOARD-02 | `[skip]` Education verification — define mechanism | Product + legal decision needed (D-01) |

---

## Sprint 5 — Advanced Features

Goal: Power features that differentiate WorkMila.

| ID | Task | Notes |
|----|------|-------|
| S5-UX-01 | `[x]` Top-right profile dropdown — show Logout inside | Already implemented via S1-AUTH-04 — dropdown with Profile / Settings / Sign Out in Login.tsx navbar variant |
| S5-UX-02 | `[x]` Mobile web — full responsive audit | Completed via S5-UX-01 in the second Sprint 5 section |
| S5-MATCH-01 | `[x]` Show why a job matched — AI reasoning snippet | Completed via S5-SEEKER-02 — sky-50 box with Sparkles icon in ShortlistFeed |
| S5-INTERVIEW-01 | `[ ]` Voice-enabled interview prep | Web Speech API: narrate questions, record verbal responses, transcribe and score |
| S5-SEARCH-01 | `[x]` Shortlist feed — contextual apply from dashboard | Completed via S5-SEEKER-01 — "Apply Now" button in ShortlistFeed opens ApplyModal inline |

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
| S5-EMP-01 | `[x]` Employer dashboard home | `src/pages/employer/EmployerDashboard.tsx` | KPIs (total/active/paused/closed), quick actions, recent postings list |
| S5-EMP-02 | `[x]` Edit / Pause / Delete job posting | `src/pages/employer/EmployerJobs.tsx` | Filter tabs, inline edit/pause/unpause/delete with confirm dialog |
| S5-EMP-03 | `[x]` Applicant pipeline — Kanban | `src/pages/employer/JobApplicants.tsx` | Applied → Screening → Interview → Offer → Hired → Rejected Kanban |
| S5-EMP-04 | `[x]` Candidate detail view from Talent Search | `src/pages/employer/TalentSearch.tsx`, `src/features/candidates/components/CandidateDetailModal.tsx` | Full-profile slide-over modal with all candidate fields |
| S5-EMP-05 | `[x]` Save / shortlist candidates | `src/features/candidates/services/savedCandidatesService.ts` | Save/unsave button in detail modal; persisted to Firestore `savedCandidates` collection |
| S5-EMP-06 | `[x]` Employer company profile completeness | `src/pages/employer/CompanyEditor.tsx` | Progress bar showing % of 6 profile fields filled |
| S5-EMP-07 | `[x]` AI-assisted job description writing | `src/pages/PostJob.tsx` | "Generate Description with AI" + "Review Draft & Get Tips" — both Gemini-powered |

### Seeker

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-SEEKER-01 | `[x]` Apply directly from shortlist feed on dashboard | `src/features/seeker/components/Shortlist/ShortlistFeed.tsx` | "Apply Now" button on each card opens ApplyModal inline |
| S5-SEEKER-02 | `[x]` "Why this job matched" reasoning on shortlist cards | `src/features/seeker/components/Shortlist/ShortlistFeed.tsx` | Already surfaced — sky-50 box with Sparkles icon shows matchReason |
| S5-SEEKER-03 | `[x]` Saved jobs | `src/features/seeker/services/savedJobsService.ts`, `src/pages/seeker/SavedJobsPage.tsx` | Bookmark icon on JobCard; `/seeker/saved` page with apply + remove; quick link in dashboard |
| S5-SEEKER-04 | `[x]` Application notes & reminders | `src/features/seeker/components/ApplicationBoard/SeekerApplicationCard.tsx` | Inline notes toggle on each Kanban card with textarea + date picker; persisted to Firestore |

### Account

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-ACC-01 | `[x]` Account settings page | `src/pages/SettingsPage.tsx` | `/settings` route — display name edit, password reset email, account deletion. `/profile` smart-redirects to role-specific profile page |
| S5-ACC-02 | `[x]` Change email with re-verification | `src/context/AuthProvider.tsx`, `src/pages/SettingsPage.tsx` | `verifyBeforeUpdateEmail` — sends link to new address; email only changes when clicked |

### UX

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S5-UX-01 | `[x]` Mobile responsiveness audit | all pages | Fixed: Dashboard md:grid-cols-2 breakpoint; JobDetailPage sidebar sticky only on lg; PostJob title text-xl/md:text-2xl; ShortlistFeed footer flex-col sm:flex-row; EmployerDashboard job row flex-col sm:flex-row |

---

## Sprint 6 — Admin, Notifications & Platform Polish

Goal: Complete admin functionality; add transactional notifications and platform-wide polish.

### Admin

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S6-ADMIN-01 | `[x]` Admin Users Management | `src/pages/admin/AdminUsersPage.tsx` | Searchable/filterable user table from live Firestore; role badge, phone verified status, join date |
| S6-ADMIN-02 | `[x]` Admin Settings page | `src/pages/admin/AdminSettingsPage.tsx` | Platform fee % + 4 feature flags (referral, AI matching, Brownie Points, email verification); persisted to `config/platform` Firestore doc |
| S6-ADMIN-03 | `[x]` Admin stats from live Firestore data | `src/pages/admin/AdminDashboard.tsx` | `getCountFromServer` for users/active jobs/applications; recent registrations feed |
| S6-ADMIN-04 | `[x]` Job posting analytics for employers | `src/pages/employer/JobAnalyticsPage.tsx` | `/employer/analytics` — total apps KPIs, per-posting table with app count, days active, apps/day rate, visual rate bar; sortable columns; accessible from EmployerDashboard quick actions |

### Notifications

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S6-NOTIF-01 | `[x]` In-app notifications | `src/features/notifications/`, `src/components/NotificationBell.tsx` | Real-time bell in Header (onSnapshot); types: application_status/new_match/profile_viewed; mark-read / mark-all-read; notification fired when employer moves applicant in Kanban |
| S6-NOTIF-02 | `[ ]` Transactional email | `functions/` | Application updates, job matches, account events — Firebase Extensions + SendGrid |
| S6-NOTIF-03 | `[x]` Job alert subscriptions | `src/pages/seeker/JobAlertsPage.tsx`, `functions/src/triggers/onJobCreate.js` | `/seeker/alerts` — create/toggle/delete alerts by keywords+location+type; Cloud Function fires in-app notifications on job creation for matching alerts |
| S6-NOTIF-04 | `[x]` Message / contact candidate | `src/features/candidates/components/CandidateDetailModal.tsx` | "Contact" button in detail modal opens compose panel; message delivered as in-app notification to candidate |

### Platform

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S6-PLAT-01 | `[ ]` Multi-seat employer accounts | `src/context/`, `src/server/` | Currently one account per company; growing teams need member access |
| S6-PLAT-02 | `[ ]` Phone number at registration + OTP | `src/pages/Register.tsx` | Partially deferred from S4-AUTH-03; required for fraud prevention |
| S6-PLAT-03 | `[x]` Brownie Points leaderboard | `src/pages/BrownieLeaderboardPage.tsx` | `/leaderboard` — top 20 by browniePoints; medal icons for top 3; your-rank card with live position even outside top 20; how-to-earn section |
| S6-PLAT-04 | `[x]` Dark mode | `src/index.css`, `src/context/ThemeContext.ts`, `src/context/ThemeProvider.tsx` | `@variant dark` CSS config; ThemeProvider with localStorage persistence + system preference detection; sun/moon toggle in Header; `dark:` base styles on body/headings; component coverage incremental |
| S6-PLAT-05 | `[x]` PWA (Progressive Web App) | `index.html`, `vite.config.ts` | vite-plugin-pwa with autoUpdate; web manifest with name/icons/theme; Workbox NetworkFirst for Firestore, CacheFirst for fonts; Apple PWA meta tags |

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
