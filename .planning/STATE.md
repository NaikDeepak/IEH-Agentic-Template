# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.
**Current focus:** Phase 3 — Semantic Matching Engine (Gap Closure)

## Current Position

Phase: 3 of 6 (Semantic Matching)
Plan: 5 of 6 (03-05-PLAN.md)
Status: Gap closure for search infrastructure complete
Last activity: 2026-02-08 — Fixed Firestore indexes and candidate whitelists

Progress: █████████░ 94% (of defined plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: ~12m
- Total execution time: ~1.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Identity | 3 | 3 | 12.5m |
| 2. Marketplace Mechanics | 8 | 8 | ~10m |
| 3. Semantic Matching | 5 | 6 | ~12m |

**Recent Trend:**
- Last 5 plans: 03-02, 03-03, 03-04, 03-05
- Trend: Maintaining high velocity through gap closure plans.

## Accumulated Context

### Decisions

| Date | Plan | Decision | Rationale |
|------|------|----------|-----------|
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
| 2026-02-08 | 02-08 | Client-Side Expiration Calc | Calculate expiration (now + 4 days) on client to ensure immediate availability in payload. |
| 2026-02-08 | 02-07 | Type Mapping Layer | Perform data transformation in `JobsPage` to adapt backend snake_case to frontend camelCase without global refactors. |
| 2026-02-08 | 02-07 | Client-Side Filtering | "Active First" sorting is handled by backend query; frontend displays as received. |
| 2026-02-07 | 02-05 | Visual Status Indicators | Green for active, Gray for passive; familiar traffic light pattern. |
| 2026-02-07 | 02-04 | App-level Activity Tracking | Placed tracking in `App.tsx` root for reliable user heartbeat. |
| 2026-02-07 | 02-04 | Active-First Sorting | Sort by Status (ASC) then LastActive (DESC) for engagement. |
| 2026-02-07 | 02-03 | Integrate into Reaper | Minimize cold starts/billing by combining lifecycle logic. |
| 2026-02-07 | 02-03 | 24-48h Warning Window | Simple "once-per-reaper-run" logic for MVP. |
| 2026-02-07 | 02-03 | Gmail SMTP Env Vars | Secrets management for email credentials. |
| 2026-02-07 | 02-02 | Batch Limit of 500 | Adhering to Firestore best practices for batch operations. |
| 2026-02-07 | 02-01 | 4-Day Activity Expiration | Keep marketplace "fresh"; passive after 4 days. |
| 2026-02-07 | 02-01 | 1-Hour Activity Debounce | Reduce Firestore writes while maintaining precision. |
| 2026-01-16 | 01-03 | Use `lucide-react` for iconography | Standard, lightweight, and versatile icon set. |
| 2026-01-16 | 01-03 | Nested routing for `/admin` | Keeps root `App.tsx` manageable and isolates admin logic. |
| 2026-01-16 | 01-03 | Slate-900 theme for Admin Sidebar | Visual distinction between admin and public interfaces. |
| 2026-01-16 | 01-01 | Use `react-router-dom` for navigation | Standard routing library for React. |
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
Stopped at: Completed Plan 03-05 (Fix Vector Indexes and Search Responses)
Resume file: .planning/phases/03-semantic-matching/03-06-PLAN.md
