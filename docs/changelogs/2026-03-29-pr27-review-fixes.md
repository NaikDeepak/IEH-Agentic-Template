# PR #27 Review Fixes — 2026-03-29

## What

Addressed all Copilot and Qodo review comments on PR #27. Code fixes in 11 files; 5 non-fix comments posted explaining design decisions.

## Where

`firestore.rules`, `firestore.indexes.json`, `functions/index.js`, `src/features/candidates/components/CandidateDetailModal.tsx`, `src/features/jobs/services/jobService.ts`, `src/features/jobs/types.ts`, `src/features/notifications/notificationsService.ts`, `src/features/seeker/services/savedJobsService.ts`, `src/pages/JobsPage.tsx`, `src/pages/employer/EmployerJobs.tsx`, `docs/style/SENTRY_GUIDE.md`

## Why

Security gaps, runtime crashes, and type errors flagged during automated code review.

---

## Changes with known follow-up work

### 1. Embedding type validation removed from Firestore rules

**Change:** Removed `embedding is list && size == 768` checks from `/jobs` create and update rules — Firestore Security Rules have no native type for `VectorValue`.
**Risk:** No practical security risk; employer role + ownership check is the real guard.
**Follow-up:** #32 — Re-add when Firestore Rules adds VectorValue type support; or add server-side assertion in `jobService.ts` before the `vector()` write.

### 2. Notification create restricted to self-notifications only

**Change:** `allow create` on `/notifications` now requires `request.resource.data.userId == request.auth.uid`. Cross-user notifications (e.g., employer → seeker contact messages) **must** go through Cloud Functions (Admin SDK bypasses rules).
**Impact:** Any direct client-side `NotificationsService.create(otherUserId, ...)` call will now be rejected by Firestore rules. Verify all cross-user notification paths use Cloud Functions.
**Status:** Contact-message flow currently calls `NotificationsService.create()` from the client — this needs to be moved to a Cloud Function call.

### 3. Vector embedding migration needed for existing jobs

**Change:** `jobService.ts` now writes `embedding` as Firestore `VectorValue` via `vector(embedding)`. Existing jobs stored with plain `number[]` arrays are invisible to `findNearest()`.
**Follow-up:** #30 — Write and run `scripts/migrate-embeddings.js` to bulk re-index existing jobs. Until then, re-saving a job through the UI regenerates its embedding correctly.

### 4. Post-filtering in runVectorSearch (functions/index.js)

**Status:** `runVectorSearch()` still applies `status === 'active'` filters after ANN search returns results, not before.
**Follow-up:** #29 — Chain `.where()` before `findNearest()` so ANN scans only the relevant subset. Low priority while `limit` is set above expected filtered result count.

### 5. Workbox Firestore cache has no expiration

**Status:** `vite.config.ts` Workbox runtime cache for Firestore API has no TTL or entry limit.
**Follow-up:** #28 — Add `ExpirationPlugin({ maxAgeSeconds: 300, maxEntries: 50 })`.

### 6. N+1 application counts in JobAnalyticsPage

**Status:** One `getCountFromServer()` per job on every page load.
**Follow-up:** #31 — Denormalize `applicationCount` onto job docs via Cloud Function trigger.

---

## Clean fixes (no follow-up needed)

| Issue | Fix |
|-------|-----|
| `/jobs/suggest` unauthenticated | Added `requireAuth` middleware |
| Job delete always fails | Added `allow delete` rule for job owner in `firestore.rules` |
| `candidate.name` renders undefined | Fixed to `candidate.displayName ?? 'candidate'` |
| Backdrop `role="button"` inaccessible | Changed to `role="presentation"` |
| `serverTimestamp` null crash in notifications | Used `d.data({ serverTimestamps: 'estimate' })` |
| `getSavedJobIds` unhandled rejection | Added `.catch()` |
| Missing `jobAlerts` composite index | Added to `firestore.indexes.json` |
| `savedJobsService.save()` silently ignores missing job.id | Added guard that throws |
| `getSavedBySeeker` returns jobs without `id` field | Fixed to merge `jobId` from the saved doc |
| `void ChevronDown` dead code | Removed import |
| `embedding` type mismatch (`as unknown as number[]`) | Widened type to `number[] \| FieldValue` |
| Sentry guide referenced `@sentry/nextjs` | Updated to `@sentry/react` / Vite |
