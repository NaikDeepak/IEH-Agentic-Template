# WorkMila — Sprint Plan

Sourced from real user feedback + internal review sessions.
Last updated: 2026-03-22 (Sprint 1 completed)

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
| S1-NAV-02 | `[x]` "Pricing" nav button not working | `src/components/Header.tsx` | Fixed — routes to `/pricing` |

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
| S3-PROFILE-01 | `[ ]` Candidate location = city name (not work mode) | Profile location field should be free-text city (e.g. "Mumbai") not remote/hybrid/office enum |
| S3-PROFILE-02 | `[ ]` Work preference = separate remote/hybrid/office multi-select | Add `work_preference` field to `SeekerProfile` type; show as multi-select checkboxes in profile editor |
| S3-PROFILE-03 | `[ ]` Targeted role — editable with suggestions | Pre-fill from resume, show suggestions dropdown, allow manual override |
| S3-PROFILE-04 | `[ ]` Skills in profile editor — autocomplete suggestions | On skill input, suggest from CV parsed keywords + curated skills list |
| S3-PROFILE-05 | `[ ]` Filter irrelevant skills from extraction | Resume parse: only include explicitly listed skills, not incidental words from job descriptions |
| S3-RESUME-01 | `[ ]` Resume Intelligence — show current CV analysis first | Reorder flow: show existing analysis → then offer Upload New / Optimize with AI |
| S3-RESUME-02 | `[ ]` Resume Intelligence — add action buttons after analysis | "Back to Dashboard" + "Optimize with AI" CTAs on result screen |
| S3-RESUME-03 | `[ ]` AI CV builder — structured sections | Template: Summary / Skills / Experience / Education. Currently flat output |
| S3-SKILL-01 | `[ ]` Rename "bridge assets" → "Skill Upgrade Path" | `src/features/seeker/components/SkillGap/` — rename labels throughout |
| S3-SKILL-02 | `[ ]` Rename "skill void" → "Missing Skills" | Same files |
| S3-SKILL-03 | `[ ]` "Targeted semantic void" — plain English copy | Replace with something like "Skills gap for your target role" |
| S3-SKILL-04 | `[ ]` Targeted career path — make editable | Field is currently read-only; unlock edit |
| S3-INTERVIEW-01 | `[ ]` Interview prep — auto-fill from resume | Pre-populate role + skills from latest resume parse; editable before session |

---

## Sprint 4 — Auth, Onboarding & Verification

Goal: First-time experience is complete and trustworthy.

| ID | Task | Notes |
|----|------|-------|
| S4-AUTH-01 | `[ ]` Separate Employer vs Candidate login/register entry | Landing CTAs split into two paths with tailored copy. Seeker: `/login?role=seeker`, Employer: `/login?role=employer`. RoleSelection still handles post-login assignment |
| S4-AUTH-02 | `[ ]` LinkedIn login option | Firebase doesn't support LinkedIn natively — evaluate custom OAuth via LinkedIn SDK or Auth0 |
| S4-AUTH-03 | `[ ]` Mobile number mandatory at registration | Add `phone` field to Register form; Firebase phone auth for OTP on first entry |
| S4-AUTH-04 | `[ ]` Contact OTP verification (email + mobile) | After registration, require OTP confirmation. Lock fields after verified; "Change with re-verification" flow for updates |
| S4-ONBOARD-01 | `[ ]` First-time login → mandatory CV upload or AI-create | After role assignment, redirect to onboarding screen before dashboard. Options: Upload CV / Build with AI / Skip (limited access) |
| S4-ONBOARD-02 | `[ ]` Education verification — define mechanism | Decide: document upload, LinkedIn sync, or self-declared-only. Document decision in PRD |

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
| D-04 | Pricing page content | Marketing/business decision needed |

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
