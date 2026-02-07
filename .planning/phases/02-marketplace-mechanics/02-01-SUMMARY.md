# Phase 2 Plan 01: Active System Data Model Summary

## One-line Summary
Defined the "Active System" data model with `ActivityStatus` types, implemented debounced client-side activity tracking for Users and Jobs, and secured updates with Firestore rules enforcing 4-day expiration limits.

## Dependency Graph
- **Requires**: Phase 1 (Auth & Identity)
- **Provides**: Foundation for marketplace visibility and activity-based filtering
- **Affects**: Job search (Phase 2), User discovery (Phase 2)

## Tech Stack
- **tech-stack.added**: `localStorage` (for debouncing)
- **tech-stack.patterns**: Activity-based expiration (4-day sliding window), Debounced Firestore writes (1h cooldown)

## Key Files
- **key-files.created**: `src/types/index.ts`, `src/lib/activity.ts`
- **key-files.modified**: `firestore.rules`

## Decisions Made
- **4-Day Expiration**: Chosen to keep the marketplace "fresh". Users/Jobs not interacted with for 4 days drop to "passive".
- **1-Hour Debounce**: Reduces Firestore write costs while maintaining sufficient "active" precision.
- **Client-side Tracking**: Implemented as a utility library to be called from UI components (hooks/pages) rather than background workers, ensuring activity is tied to actual usage.
- **Local Storage Caching**: Used to persist debounce state across page reloads to prevent unnecessary writes on session restore.

## Deviations from Plan
None - plan executed exactly as written.
