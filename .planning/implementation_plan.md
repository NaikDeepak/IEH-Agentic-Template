# Implementation Plan: IEH User Feedback & Doc Cleanup

This document governs the systematic execution of all 54 items identified in the `user_testing_feedback` artifact.

## The Execution Workflow (One Issue, One Session)

To guarantee no issue is forgotten and context is preserved, every single item in this plan must progress through this strict lifecycle:

1.  **Select Issue:** Pick the next item from the highest-priority open batch.
2.  **Document Plan:** Update `docs/features/` or relevant `.md` files detailing the exact change (adhering to `docs/STANDARDS.md`).
3.  **Implement & Test:** Write the code and verify locally.
4.  **Raise PR:** Create an atomic branch and Pull Request for this specific issue.
5.  **Review (AI):** Perform self-review of the PR against IEH standards.
6.  **Review (Human):** Get manual review and approval from the user.
7.  **Iterate:** Fix any review feedback until approved.
8.  **Merge & Close Session:** Merge the PR. **Immediately conclude the current AI session.**
9.  **Next Issue (New Session):** Start a fresh AI session, feed it this `IMPLEMENTATION_PLAN.md`, and repeat from Step 1.

---

## Tracking System

*   [ ] = Pending
*   [/] = In Progress (Current Session)
*   [x] = Completed (Merged)

---

## Batch 1: 🔴 P0 Fixes (Blockers — Demo killers)

*Goal: Fix broken core flows. Do not pass to P1 until these are 100% complete.*

- [x] **1.1 Login Routing (`C1-1`):** Ensure user redirects directly to dashboard post-login.
- [x] **1.2 Email Auth (`C1-6`):** Fix broken Email Login functionality.
- [ ] **1.3 Job Apply Button (`C3-2`):** Add clear "Apply" button directly on search results cards.
- [ ] **1.4 Job Details 404 (`C3-3`):** Resolve the crash/error when clicking into job details.
- [ ] **1.5 Mobile Responsiveness (`C4-3`):** Fix critical UI cutoff issues on mobile web.
- [ ] **1.6 Broken "AI Prep" Link (`C2-1`):** Point to actual page or hide if not built.
- [ ] **1.7 Broken "Pricing" Link (`C2-2`):** Point to actual page or hide if not built (Decision needed).
- [ ] **1.8 Profile Creation Blocking (`C5-1`):** Prevent users from bypassing mandatory profile fields.
- [ ] **1.9 Auth State UI (`C1-4`):** If user tries to login while already logged in, redirect to dashboard.

---

## Batch 2.5: 📄 Documentation Cleanup

*Goal: Single source of truth. No stale docs.*

- [ ] **2.5.1 Purge Duplicates (`C7-47`, `C7-48`, `C7-54`):** Delete `.planning/` dir (single source: `.gsd/`).
- [ ] **2.5.2 Purge Outdated Plans (`C7-43`):** Delete `docs/IMPLEMENTATION_PLAN.md` (Next.js references).
- [ ] **2.5.3 Update Standards (`C7-44`):** Update `docs/STANDARDS.md` to reflect React/Vite structure (`src/`).
- [ ] **2.5.4 Update Architecture (`C7-52`):** Update `architecture.md` to include all AI features/search.
- [ ] **2.5.5 Rewrite Readme (`C7-53`):** Rewrite `README.md` with project overview and proper setup guide.
- [ ] **2.5.6 Populate Todos (`C7-51`):** Migrate remaining P1/P2 items from feedback artifact to `.gsd/TODO.md`.
- [ ] **2.5.7 Consolidate State (`C7-45`, `C7-46`, `C7-49`, `C7-50`):** Organize `.gsd/STATE.md`, `.gsd/ROADMAP.md`, `.gsd/DECISIONS.md`, `.gsd/JOURNAL.md`.

---

## Batch 2: 🟡 P1 UX Pains (Professional Polish)

*Goal: Make the platform feel professional and usable.*

- [ ] **2.1 Brutalist Design (`C4-1`, `C4-2`):** Review color scheme and reduce extensive `uppercase` usage (Decision needed).
- [ ] **2.2 Separate Login Portals (`C1-2`):** UI differentiation for Employer vs. Candidate login.
- [ ] **2.3 "Terminate Session" (`C1-3`):** Change to standard "Sign Out".
- [ ] **2.4 Mandatory Fields (`C1-5`):** Enforce Email/Mobile requirement.
- [ ] **2.5 Onboarding Flow (`C5-2`):** Build flow for first-time login (Role/Basic details).
- [ ] **2.6 Jargon Cleanup (`C2-3`, `C2-4`, `C2-5`):** Remove "Semantic Voids", "Bridge Assets", "Skill Void".
- [ ] **2.7 Job Search Filters (`C3-1`):** Add Location, Job Type, Salary, Experience filters.
- [ ] **2.8 Irrelevant AI Skills (`C6-1`):** Tune AI prompt for resume skill extraction.
- [ ] **2.9 AI Score Relevance (`C6-2`):** Adjust AI prompt to stop inflating beginner scores.
- [ ] **2.10 AI Result Formatting (`C6-4`):** Add clear spacing/bulleting to raw AI output text.
- [ ] **2.11 Missing LinkedIn Auth (`C1-7`):** Implement LinkedIn OAuth (Decision needed).

---

## Batch 3: 🟢 P2 Enhancements (Delight)

*Goal: Advanced features and wow factor.*

- [ ] **3.1 Spelling Autocorrect (`C3-4`):** "Did you mean" functionality for search.
- [ ] **3.2 Skill Autocomplete (`C3-5`):** Suggestions while typing in search.
- [ ] **3.3 Voice Prep (`C6-5`):** Voice-enabled interview prep (Decision needed).
- [ ] **3.4 JD Upload Prep (`C6-6`):** Option to upload JD in interview prep.
- [ ] **3.5 Profile Upgrades (`C5` items):** Edit verified status, improve education UI, manage multiple CVs.

---

## Unresolved Design Decisions

Before starting specific tasks, the following must be answered by the user:

1.  **Aesthetics:** Keep the brutalist design (caps/colors) or soften it?
2.  **Pricing Page:** Build it or remove the link from the header?
3.  **LinkedIn Login:** Build it now or defer?
4.  **Voice Prep:** Build voice interface now or defer?
5.  **Login Strategy:** Separate `/employer-login` vs tabbed single page?
