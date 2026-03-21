# WorkMila — Sprint Plan

Sourced from real user feedback + internal review sessions.
Last updated: 2026-03-22

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
| S1-UI-01 | `[ ]` Restyle Login card variant | `src/components/Login.tsx` | Card still has `border-2 border-black`, "Access Portal" heading, brutalist inputs, "Authenticate" / "Terminate Session" buttons. Match Register.tsx new style. |
| S1-UI-02 | `[ ]` Restyle Seeker Dashboard sub-components | `src/features/seeker/components/Shortlist/ShortlistFeed.tsx`, `src/features/seeker/components/Market/MarketTrends.tsx` | Dashboard shell is already new; inner components still brutalist |
| S1-UI-03 | `[x]` ProtectedRoute black spinner | `src/components/ProtectedRoute.tsx` | Fixed — now matches WorkMila PageLoader |
| S1-UI-04 | `[x]` RoleSelection modal brutalist | `src/components/RoleSelection.tsx` | Fixed |
| S1-UI-05 | `[x]` JobCard / JobSearchBar / StatusBadge | multiple | Fixed |
| S1-UI-06 | `[x]` KanbanColumn / ApplicantCard | multiple | Fixed |
| S1-UI-07 | `[x]` Skeleton loaders | `src/components/ui/Skeleton.tsx` | Fixed |

### Auth & Routing Bugs

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-AUTH-01 | `[ ]` Email login not working for candidates | `src/context/AuthProvider.tsx`, Firebase console | Investigate `loginWithEmail` — likely Firebase Email provider not enabled or misconfigured |
| S1-AUTH-02 | `[ ]` After login → redirect to dashboard (both roles) | `src/App.tsx` `DashboardRedirect` | Verify seeker → `/seeker/dashboard`, employer → `/employer/jobs`. Currently works in code but confirm with real login flow |
| S1-AUTH-03 | `[ ]` "Terminate Session" box on `/login` when already logged in | `src/components/Login.tsx` card variant | When user is already logged in and visits `/login`, redirect instead of showing the card |
| S1-AUTH-04 | `[ ]` Top-right name → dropdown (Profile / Logout) | `src/components/Login.tsx` navbar variant | Replace direct logout button with a small dropdown menu |

### Navigation Broken

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-NAV-01 | `[ ]` "AI Prep" nav button not working | `src/components/Header.tsx` | Currently links to `#ai-prep` anchor. Either scroll to a landing section or route to `/seeker/interview` for authenticated seekers |
| S1-NAV-02 | `[ ]` "Pricing" nav button not working | `src/components/Header.tsx` | Currently links to `#pricing` anchor. Add a pricing section to landing or link to a `/pricing` stub page |

### Job Detail Error

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-JOB-01 | `[ ]` Job detail page shows error on click | `src/pages/JobDetailPage.tsx`, `src/features/jobs/services/jobService.ts` | Reproduce error, check Firestore read permissions and field mapping. Likely a missing `company_name` field or Firestore rules blocking unauthenticated reads |

### Apply Button in Search Results

| ID | Task | File(s) | Notes |
|----|------|---------|-------|
| S1-APPLY-01 | `[ ]` Add Apply button to JobCard in search results | `src/components/JobCard.tsx`, `src/pages/JobsPage.tsx` | Show "Apply Now" CTA on card footer when user is logged-in seeker. Clicking opens `ApplyModal` inline or navigates to job detail |

---

## Sprint 2 — Search & Filters

Goal: Make job discovery actually useful.

| ID | Task | Notes |
|----|------|-------|
| S2-SEARCH-01 | `[ ]` More filters on Find Jobs | Add city/location text input, job type (remote/hybrid/office) multi-select, salary range slider, experience level to `JobSearchBar`. Update `searchJobs` to pass filters to backend |
| S2-SEARCH-02 | `[ ]` Spell-check / "did you mean" suggestions | On search with 0 results, suggest alternative queries. Backend: fuzzy match against job titles index |
| S2-SEARCH-03 | `[ ]` Search result relevance improvement | Review embedding + cosine similarity tuning in `src/server/features/ai/`. Low-match results should be filtered below threshold |
| S2-SEARCH-04 | `[ ]` Mobile layout — search bar and jobs grid | Responsive audit: JobSearchBar collapses cleanly on mobile, grid switches to single column, filter controls accessible |

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
