# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.
**Current focus:** Phase 4 — Employer Suite

## Current Position

Phase: 4 of 6 (Employer Suite)
Plan: 3 of 3 (04-03-PLAN.md)
Status: Phase 4 verified and complete.
Last activity: 2026-02-08 — Completed Basic ATS Kanban Board.

Progress: ████████████████████ 66% (4/6 phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: ~12m
- Total execution time: ~2.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Identity | 3 | 3 | 12.5m |
| 2. Marketplace Mechanics | 8 | 8 | ~10m |
| 3. Semantic Matching | 6 | 6 | ~11m |
| 4. Employer Suite | 3 | 3 | ~10m |

## Accumulated Context

### Decisions

| Date | Plan | Decision | Rationale |
|------|------|----------|-----------|
| 2026-02-08 | 04-03 | ATS Kanban Implementation | Implemented a drag-and-drop Kanban board using @dnd-kit for applicant status management. Used optimistic updates in the UI for a snappy experience while persisting changes to Firestore. |
| 2026-02-08 | 04-02 | Automated Company Linking | Updated `JobService.createJob` to automatically fetch and link the employer's `company_id` if not explicitly provided, ensuring all jobs are branded. |
| 2026-02-08 | 04-01 | Employer-Company Linkage | Used an `employer_ids` array in the company document to allow multiple recruiters/employers to manage a single company profile. |
| 2026-02-08 | 03-06 | Explicit Status Mapping | Prevented conflation of 'closed' with 'passive', ensuring accurate system representation. |
| 2026-02-08 | 03-06 | Strict Browse Filtering | Enforced "Active System" goals by only showing truly active jobs in the default browse view. |
| 2026-02-08 | 03-05 | User Index Reordering | Reordered fields to `status` -> `role` -> `embedding` to match the query construction in the backend. |
| 2026-02-08 | 03-05 | Status Whitelisting | Added `status` to candidate search results to allow the frontend to display activity markers. |
| 2026-02-08 | 03-03 | Match Score Colors | Used Traffic Light system (Green > 80%, Yellow > 50%) for relevance cues. |
| 2026-02-08 | 03-03 | Simple Role Check | Used `userData.role` check in Header instead of complex permission system. |
| 2026-02-08 | 03-04 | Frontend Match Score Normalization | Normalized decimal match scores (0-1) to percentages (0-100) on the client side for display. |
| 2026-02-08 | 03-02 | Manual Score Calculation | Calculated `matchScore` manually using dot product of embeddings in the cloud function to ensure consistent percentage scoring (0-100%) for the frontend. |
| 2026-02-08 | 03-02 | Fallback Mechanism | Implemented a try/catch block in `expandQuery` to return the original query if the LLM fails. |
| 2026-02-08 | 03-01 | Firestore REST API for Vector Search | Continued using REST API pattern for stability and lightweight implementation in Cloud Functions. |
| 2026-01-16 | 01-01 | Manual `displayName` update on signup | Firebase `createUserWithEmailAndPassword` doesn't set it initially. |

### Pending Todos

- Implement RBAC protection for `/admin` routes (Plan 01-02/01-01 follow-up)
- Create actual management pages for Users, Jobs, and Settings.
- Phase 5: Implement Seeker-side application flow and AI prep tools.

### Blockers/Concerns

- `tests/functions.test.ts` failing build due to missing types/declaration files.
- `src/lib/firebase.ts` has unused imports causing build warnings/errors in strict mode.

## Session Continuity

Last session: 2026-02-08
Stopped at: Phase 4 verified and complete.
Resume file: .planning/phases/05-seeker-tools/05-01-PLAN.md (to be created)
Session Continuity: Ready for Phase 5
