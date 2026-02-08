---
status: investigating
trigger: "Search results (both jobs and candidates) only show active entities. No passive/expired listings appear. Result: partially pass Active and Closed are showing"
created: 2026-02-08T12:00:00Z
updated: 2026-02-08T12:00:00Z
---

## Current Focus

hypothesis: Search queries are missing status filters or have incorrect filter logic.
test: Examine the search API endpoints and Firestore query logic for jobs and candidates.
expecting: Find missing or incorrect `status == 'active'` filters.
next_action: Search for search-related files and API endpoints.

## Symptoms

expected: Search results (both jobs and candidates) only show active entities. No passive/expired listings appear.
actual: Active and Closed entities are showing in search results.
errors: none reported
reproduction: Perform a search for jobs or candidates and observe results with 'Closed' status.
started: Phase 03-semantic-matching

## Eliminated

## Evidence

- timestamp: 2026-02-08T12:05:00Z
  checked: src/lib/ai/search.ts
  found: searchJobs and searchCandidates functions call /api/jobs/search and /api/candidates/search respectively. They pass query, location (for jobs), and limit. No status filter is passed from the client side.
  implication: The status filtering must be handled on the server side (API implementation).

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
