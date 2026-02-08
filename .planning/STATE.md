# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.
**Current focus:** Phase 3 — Semantic Matching Engine (Complete)

## Current Position

Phase: 3 of 6 (Semantic Matching)
Plan: 6 of 6 (03-06-PLAN.md)
Status: Phase 3 verified and complete (including gap closures)
Last activity: 2026-02-08 — Completed Phase 3 execution and verification

Progress: ██████████ 100% (of defined plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 17
- Average duration: ~12m
- Total execution time: ~2.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Identity | 3 | 3 | 12.5m |
| 2. Marketplace Mechanics | 8 | 8 | ~10m |
| 3. Semantic Matching | 6 | 6 | ~11m |

**Recent Trend:**
- Last 5 plans: 03-03, 03-04, 03-05, 03-06
- Trend: Efficient gap closure, ready for Phase 4.

## Accumulated Context

### Decisions

| Date | Plan | Decision | Rationale |
|------|------|----------|-----------|
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
| 2026-02-08 | 03-01 | Backend-Side Filtering | Enforced filters (status='active') on backend to optimize payload and enforce marketplace rules. |
| 2026-02-08 | 03-01 | Whitelisting Candidate Fields | Explicitly selected public fields to prevent leaking private data like email/phone. |
| 2026-02-08 | 03-01 | Timestamp Unwrapping | Added custom handling for Firestore REST API timestamp format. |
| 2026-01-16 | 01-01 | Manual `displayName` update on signup | Firebase `createUserWithEmailAndPassword` doesn't set it initially. |

### Pending Todos

- Implement RBAC protection for `/admin` routes (Plan 01-02/01-01 follow-up)
- Create actual management pages for Users, Jobs, and Settings.
- Connect Job Feed UI to `jobService` (Next Phase).

### Blockers/Concerns

- `tests/functions.test.ts` failing build due to missing types/declaration files.
- `src/lib/firebase.ts` has unused imports causing build warnings/errors in strict mode.

## Session Continuity

Last session: 2026-02-08
Stopped at: Completed Phase 3 (Semantic Matching Engine)
Resume file: None (Ready for Phase 4)
