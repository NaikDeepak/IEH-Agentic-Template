---
status: resolved
trigger: "issue with 4 - [DATABASE_ERROR] Failed to load your job postings. when accessing the Employer Jobs Dashboard (/employer/jobs)"
created: 2026-02-10T15:10:00Z
updated: 2026-02-10T15:20:00Z
---

## Current Focus

hypothesis: Missing Firestore index for employer job queries.
test: Verified src/features/jobs/services/jobService.ts query against firestore.indexes.json.
expecting: Index mismatch confirmed.
next_action: Finalize diagnosis report.

## Symptoms

expected: Employer jobs should load and display in a list or table.
actual: Error message "[DATABASE_ERROR] Failed to load your job postings" is displayed.
errors: [DATABASE_ERROR] Failed to load your job postings.
reproduction: Navigate to /employer/jobs as an authenticated employer.
started: Reported on 2026-02-10.

## Eliminated

- **Firestore Rules Issue:** Rules explicitly allow employers to read their own jobs (`resource.data.employer_id == request.auth.uid`).

## Evidence

- timestamp: 2026-02-10T15:15:00Z
  checked: src/features/jobs/services/jobService.ts
  found: getJobsByEmployerId uses a query with where("employer_id", "==", employerId) and orderBy("created_at", "desc").
  implication: This query requires a composite index on (employer_id, created_at desc) in Firestore.

- timestamp: 2026-02-10T15:18:00Z
  checked: firestore.indexes.json
  found: No index exists for the combination of `employer_id` and `created_at`.
  implication: Confirms the query will fail in Firestore, triggering the error seen in the UI.

## Resolution

root_cause: The `JobService.getJobsByEmployerId` function executes a Firestore query that filters by `employer_id` and sorts by `created_at`. Firestore requires a composite index for any query that combines an equality filter with a sort on a different field. This index is currently missing from `firestore.indexes.json`.

fix: Add the required composite index to `firestore.indexes.json`.

verification: Once the index is added and deployed (or updated in the Firebase Console), the `/employer/jobs` page will load without the [DATABASE_ERROR].

files_changed: [/Users/deepaknaik/Downloads/1. AI Live/IEH/firestore.indexes.json]
