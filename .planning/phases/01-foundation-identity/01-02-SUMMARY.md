---
phase: 01-foundation-identity
plan: 02
subsystem: Auth/RBAC
tags: [react, auth, rbac, firestore]
requires: ["01-01"]
provides: ["Granular RBAC", "Protected Routes"]
affects: ["All subsequent feature plans"]
tech-stack:
  added: []
  patterns: ["Wrapper component for route protection", "Discriminated unions for user roles"]
key-files:
  created: ["src/components/ProtectedRoute.tsx"]
  modified: ["src/context/AuthContext.ts", "src/components/RoleSelection.tsx", "src/App.tsx", "tests/functions.test.ts"]
duration: 4m
completed: 2026-01-16
---

# Phase 01 Plan 02: Granular RBAC and Protected Routes Summary

Implemented a robust Role-Based Access Control (RBAC) system that secures application routes based on user roles stored in Firestore.

## Key Accomplishments

- **Updated User Schema**: Enhanced `UserData` type to support `seeker`, `employer`, and `admin` roles, along with granular `employerRole` ('owner', 'recruiter', 'hiring_manager').
- **ProtectedRoute Component**: Developed a reusable wrapper component that handles authentication checks, role verification, and loading states.
- **Enhanced Onboarding**: Updated `RoleSelection` to correctly assign default sub-roles (e.g., `employerRole: 'owner'` for new employers).
- **Route Security**: Secured the following routes in `App.tsx`:
    - `/dashboard`: Access for all authenticated users.
    - `/post-job`: Access for `employer` role only.
    - `/admin/*`: Access for `admin` role only.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed build errors in `tests/functions.test.ts`**
- **Found during:** Verification (npm run build)
- **Issue:** Missing type declarations for `functions/index.js` and `vi` namespace errors.
- **Fix:** Added `@ts-ignore` for the untyped import and corrected `vi.Mock` to `Mock` imported from `vitest`.
- **Files modified:** `tests/functions.test.ts`
- **Commit:** (Included in final docs commit)

## Decisions Made

| Plan | Decision | Rationale |
|------|----------|-----------|
| 01-02 | Redirect unauthorized to Home | Simplest UX for unauthorized access attempts; can be refined to an "Unauthorized" page later. |
| 01-02 | Default Employer Role: 'owner' | First user from an organization is typically the owner/admin. |

## Next Phase Readiness

- **Blockers:** None.
- **Concerns:** Ensure `admin` role is manually assigned to test admin routes, as there is no public signup for admins.
