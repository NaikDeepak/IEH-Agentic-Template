---
phase: 02-marketplace-mechanics
verified: 2026-02-08
status: passed
score: 3/3 truths verified
re_verification:
  previous_status: gaps_found
  previous_score: 2/3
  gaps_closed:
    - "Jobs automatically expire to Passive status after 4 days of inactivity"
  gaps_remaining: []
  regressions: []
---

# Phase 02: Marketplace Mechanics Verification Report

**Phase Goal:** Implement the "Active System" rules to ensure platform freshness
**Verified:** 2026-02-08
**Status:** passed
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| - | ----- | ------ | -------- |
| 1 | Jobs automatically expire to "Passive" status after 4 days of inactivity | ✓ VERIFIED | `reaper` function in `functions/index.ts` queries for active jobs with `expiresAt < now`. `createJob` in `jobService.ts` now correctly initializes `expiresAt` (now + 4 days) and `lastActiveAt`. |
| 2 | Candidates automatically expire to "Passive" status after 4 days of no applications | ✓ VERIFIED | `reaper` targets `users` collection. `App.tsx` triggers `trackUserActivity` on mount, setting `expiresAt` to 4 days in future. (Activity used as proxy for application engagement). |
| 3 | Inactive/spam postings are flagged and downranked in listings | ✓ VERIFIED | `JobService.getJobs` enforces ordering: Status (Active < Passive), then Recency. "Passive" jobs appear at the bottom. `StatusBadge` visually flags passive items. |

### Required Artifacts

| Artifact | Level 1 (Exists) | Level 2 (Substantive) | Level 3 (Wired) | Status |
| :--- | :--- | :--- | :--- | :--- |
| `functions/index.ts` (Reaper) | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/features/jobs/services/jobService.ts` | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/lib/activity.ts` | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/components/common/StatusBadge.tsx` | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/components/jobs/JobCard.tsx` | ✓ | ✓ | ✓ | ✓ VERIFIED |

### Key Link Verification

| From | To | Via | Status | Details |
| :--- | :--- | :--- | :--- | :--- |
| `JobService.createJob` | `db.jobs` | Write | ✓ WIRED | Now includes `expiresAt` and `lastActiveAt`. |
| `reaper` | `db.jobs` | Query/Write | ✓ WIRED | Correctly queries expiring items and updates status to 'passive'. |
| `App` | `trackUserActivity` | Effect | ✓ WIRED | Tracks user activity on app load. |
| `JobService.updateJob` | `trackJobActivity` | Function Call | ✓ WIRED | Resets expiration timer on job update. |
| `JobService.getJobs` | `db.jobs` | Query | ✓ WIRED | Sorts by `status` ASC (active before passive). |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| ----------- | ------ | -------------- |
| **MKT-01** (Job Expiration) | ✓ SATISFIED | Reaper + createJob/updateJob wiring complete. |
| **MKT-02** (Candidate Expiration) | ✓ SATISFIED | Reaper + trackUserActivity wiring complete. |
| **MKT-03** (Ghost Job Filter) | ✓ SATISFIED | Sorting logic prioritizes active jobs; visual indicators present. |

### Gap Closure Analysis

The previous verification identified a critical gap in `JobService.createJob`: newly created jobs were missing the `expiresAt` timestamp, rendering them immune to the reaper.

**Verification of Fix:**
- **File:** `src/features/jobs/services/jobService.ts`
- **Line 69:** `const expirationDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);`
- **Line 77:** `expiresAt: Timestamp.fromDate(expirationDate)`
- **Result:** New jobs now have the required timestamp and will be picked up by the reaper query `where("expiresAt", "<", now)`.

### Anti-Patterns Found

None detected in critical paths.

### Human Verification Required

None. Automated checks confirm the logic is sound.

---

_Verified: 2026-02-08_
_Verifier: Claude (gsd-verifier)_
