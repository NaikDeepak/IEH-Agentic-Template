# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.
**Current focus:** Phase 2 — Marketplace Mechanics

## Current Position

Phase: 2 of 6 (Marketplace Mechanics)
Plan: 8 of 8 (02-08-PLAN.md)
Status: Phase 2 verified and complete
Last activity: 2026-02-08 — Completed Job Activity Initialization (02-08)

Progress: ██████████ 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: ~11m
- Total execution time: ~1.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Identity | 3 | 3 | 12.5m |
| 2. Marketplace Mechanics | 8 | 8 | ~10m |

**Recent Trend:**
- Last 5 plans: 02-04, 02-05, 02-06, 02-07, 02-08
- Trend: Gap Closure & Stabilization

## Accumulated Context

### Decisions

| Date | Plan | Decision | Rationale |
|------|------|----------|-----------|
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
Stopped at: Completed 02-08-PLAN.md
Resume file: None

Config (if exists):
{
  "mode": "interactive",
  "depth": "standard",
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  },
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
