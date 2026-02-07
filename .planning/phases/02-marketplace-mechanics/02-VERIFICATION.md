---
phase: 02-marketplace-mechanics
verified: 2026-02-08T12:00:00Z
status: gaps_found
score: 2/3 truths verified
gaps:
  - truth: "Jobs automatically expire to Passive status after 4 days of inactivity"
    status: failed
    reason: "Newly created jobs lack 'expiresAt' and 'lastActiveAt' fields. Firestore queries in the Reaper function exclude documents missing the field, so new jobs never expire until manually updated."
    artifacts:
      - path: "src/features/jobs/services/jobService.ts"
        issue: "createJob method initializes 'status: active' but omits 'expiresAt' and 'lastActiveAt' timestamps."
    missing:
      - "Initialize expiresAt (now + 4 days) and lastActiveAt (now) in createJob payload."
---

# Phase 02: Marketplace Mechanics Verification Report

**Phase Goal:** Implement the "Active System" rules to ensure platform freshness
**Verified:** 2026-02-08
**Status:** gaps_found
**Score:** 2/3 truths verified

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| - | ----- | ------ | -------- |
| 1 | Jobs expire to Passive after 4 days | ✗ FAILED | `reaper` exists, but `createJob` fails to set initial `expiresAt`. New jobs enter "zombie" active state (Active status, no expiration timer). |
| 2 | Candidates expire to Passive after 4 days | ✓ VERIFIED | `reaper` targets users. `App.tsx` calls `trackUserActivity` on mount, ensuring users have timestamps. |
| 3 | Inactive postings downranked | ✓ VERIFIED | `jobService.getJobs` sorts by `status` (Active < Passive) then `lastActiveAt` (Desc). |
| 4 | Visual Indicators | ✓ VERIFIED | `StatusBadge` and `JobCard` display active/passive state correctly. |
| 5 | Jobs Listing Page | ✓ VERIFIED | `/jobs` route exists and displays jobs. |

### Required Artifacts

| Artifact | Level 1 (Exists) | Level 2 (Substantive) | Level 3 (Wired) | Status |
| :--- | :--- | :--- | :--- | :--- |
| `functions/index.js` | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/lib/activity.ts` | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/features/jobs/services/jobService.ts` | ✓ | ✓ | ⚠️ PARTIAL | ✗ FAILED (Missing timestamp init) |
| `src/pages/JobsPage.tsx` | ✓ | ✓ | ✓ | ✓ VERIFIED |
| `src/components/StatusBadge.tsx` | ✓ | ✓ | ✓ | ✓ VERIFIED |

### Key Link Verification

| From | To | Via | Status | Details |
| :--- | :--- | :--- | :--- | :--- |
| `reaper` | `db.jobs` | Query | ✓ WIRED | Queries `expiresAt < now`. |
| `JobService.createJob` | `db.jobs` | Write | ⚠️ PARTIAL | Writes job but misses critical `expiresAt` field. |
| `App` | `trackUserActivity` | Effect | ✓ WIRED | Correctly initializes user activity on login. |

### Gaps Summary

A critical logic gap exists in `JobService.createJob`. While the `reaper` is correctly set up to demote expired jobs, new jobs are created without the `expiresAt` timestamp. Firestore comparison queries (`expiresAt < now`) filter out documents where the field is missing. As a result, a newly posted job will stay "Active" indefinitely unless the employer updates it (triggering the activity tracker).

**Blocking Item:**
- `src/features/jobs/services/jobService.ts`: Update `createJob` to include `lastActiveAt: serverTimestamp()` and `expiresAt: Timestamp.fromDate(date + 4 days)`.

_Verified: 2026-02-08_
_Verifier: Claude (gsd-verifier)_
