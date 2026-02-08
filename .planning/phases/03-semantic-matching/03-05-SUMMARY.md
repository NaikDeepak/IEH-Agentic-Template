# Phase 3 Plan 5: Fix Vector Indexes and Search Responses Summary

## Metadata
- **Phase:** 03 (Semantic Matching)
- **Plan:** 05
- **Subsystem:** Search Infrastructure
- **Tags:** firestore, vector-search, backend
- **Status:** Complete
- **Duration:** 6m
- **Completed:** 2026-02-08

## One-liner
Fixed Firestore vector index syntax/ordering and added candidate status to search results.

## Objective
Fix the vector search infrastructure and data whitelisting gaps discovered in UAT to restore talent search functionality and provide necessary status data.

## Key Files
- `firestore.indexes.json`: Fixed JSON syntax (removed trailing comma) and reordered users index fields to `status` -> `role` -> `embedding`.
- `functions/index.js`: Updated `searchCandidatesHandler` to include `status` in the whitelisted response fields.
- `src/server/features/candidates/candidates.service.js`: Updated `searchCandidates` service to include `status` in the returned candidate objects.

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| User Index Reordering | Reordered fields to `status` -> `role` -> `embedding` to match the query construction in the backend, ensuring Firestore can use the composite vector index. |
| Status Whitelisting | Added `status` to candidate search results to allow the frontend to display activity markers (UAT 8). |

## Deviations from Plan
None.

## Commits
- `e52b83a`: fix(03-05): fix Firestore indexes syntax and order
- `8941ed2`: feat(03-05): add status to candidate whitelists

## Next Steps
- Execute Plan 03-06 to standardize status logic and filtering across the platform.
