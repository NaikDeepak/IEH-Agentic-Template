# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.
**Current focus:** Phase 4 — Employer Suite

## Current Position

Phase: 4 of 6 (Employer Suite)
Plan: 5 of 5 (04-05-PLAN.md)
Status: Phase 4 Complete - Employer Suite functionality and ATS pipeline verified.
Last activity: 2026-02-09 — Added employer navigation and created application seeding script for ATS testing.

Progress: ████████████████████ 71% (22/31 total planned tasks estimate)

## Performance Metrics

**Velocity:**
- Total plans completed: 22
- Average duration: ~11m
- Total execution time: ~2.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Identity | 3 | 3 | 12.5m |
| 2. Marketplace Mechanics | 8 | 8 | ~10m |
| 3. Semantic Matching | 6 | 6 | ~11m |
| 4. Employer Suite | 5 | 5 | ~10m |

## Accumulated Context

### Decisions

| Date | Plan | Decision | Rationale |
|------|------|----------|-----------|
| 2026-02-09 | 04-05 | Admin SDK for Seeding | Used `firebase-admin` in the seeding script to bypass Firestore Security Rules and directly populate application data for faster testing. |
| 2026-02-09 | 04-04 | 1536-Dimensional Embeddings | Standardized on 1536 dimensions using `text-embedding-004` across frontend, backend, and Cloud Functions for better semantic accuracy and alignment with modern Gemini standards. |
| 2026-02-09 | 04-04 | Robust JSON Extraction | Implemented a regex-based extraction `\{[\s\S]*\}` in Cloud Functions to reliably parse JSON even when Gemini wraps it in markdown code blocks. |
| 2026-02-08 | 04-03 | ATS Kanban Implementation | Implemented a drag-and-drop Kanban board using @dnd-kit for applicant status management. Used optimistic updates in the UI for a snappy experience while persisting changes to Firestore. |
| 2026-02-08 | 04-02 | Automated Company Linking | Updated `JobService.createJob` to automatically fetch and link the employer's `company_id` if not explicitly provided, ensuring all jobs are branded. |
| 2026-02-08 | 04-01 | Employer-Company Linkage | Used an `employer_ids` array in the company document to allow multiple recruiters/employers to manage a single company profile. |
| 2026-02-08 | 03-06 | Explicit Status Mapping | Prevented conflation of 'closed' with 'passive', ensuring accurate system representation. |
| 2026-01-16 | 01-01 | Manual `displayName` update on signup | Firebase `createUserWithEmailAndPassword` doesn't set it initially. |

### Pending Todos

- Implement RBAC protection for `/admin` routes (Plan 01-02/01-01 follow-up)
- Create actual management pages for Users, Jobs, and Settings.
- Phase 5: Implement Seeker-side application flow and AI prep tools.

### Blockers/Concerns

- `tests/functions.test.ts` failing build due to missing types/declaration files.
- `src/lib/firebase.ts` has unused imports causing build warnings/errors in strict mode.

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 04-05-PLAN.md (Employer Suite Gap Closure)
Resume file: .planning/phases/05-seeker-experience/05-01-PLAN.md
Session Continuity: Phase 4 complete. Ready for Phase 5 (Seeker Experience).