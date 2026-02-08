---
status: diagnosed
phase: 03-semantic-matching
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md]
started: 2026-02-08T01:40:00Z
updated: 2026-02-08T01:52:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Jobs Page Search Bar
expected: Navigate to /jobs. Search bar visible at top. Enter query and submit. Results appear.
result: pass

### 2. Job Match Scores Display
expected: After searching on /jobs, job cards show a percentage match badge (e.g., "85% Match"). High scores appear green (>80%), medium yellow (50-80%).
result: pass

### 3. Clear Search Restores Browse
expected: After a search, click "Clear" or clear the search input. Page returns to showing all active jobs (browse mode) without match scores.
result: pass

### 4. Find Talent Navigation (Employer Only)
expected: Log in as an Employer. Navigation/header shows "Find Talent" link. Click it to go to /employer/search.
result: pass

### 5. Talent Search Page
expected: On /employer/search, enter a search query like "Python backend". Submit shows candidate cards with names, skills, and match scores.
result: issue
reported: "failed , search.ts:89 POST http://localhost:5173/api/candidates/search 500 (Internal Server Error) ... Missing vector index configuration..."
severity: blocker

### 6. Candidate Match Score Colors
expected: On talent search results, candidates with high match scores (>80%) show green badge, medium (50-80%) show yellow, low (<50%) show gray.
result: skipped
reason: Blocked by issue in test 5 (search failed)

### 7. Query Expansion Effect
expected: Search with a short query like "React". Results should include candidates/jobs with related skills (Next.js, Redux, TypeScript) even if not in original query.
result: issue
reported: "same issue as above Search failed: ... Missing vector index configuration..."
severity: blocker

### 8. Active-Only Results
expected: Search results (both jobs and candidates) only show active entities. No passive/expired listings appear.
result: issue
reported: "partially pass Active and Closed are showing"
severity: major

## Summary

total: 8
passed: 4
issues: 3
pending: 0
skipped: 1

## Gaps

- truth: "On /employer/search, enter a search query like \"Python backend\". Submit shows candidate cards with names, skills, and match scores."
  status: failed
  reason: "User reported: failed , search.ts:89 POST http://localhost:5173/api/candidates/search 500 (Internal Server Error) ... Missing vector index configuration..."
  severity: blocker
  test: 5
  root_cause: "The Firestore composite vector index for the 'users' collection is misconfigured and likely failed to deploy. The query in `candidates.service.js` filters by `status` then `role`, but the index in `firestore.indexes.json` defines them as `role` then `status`. Additionally, a trailing comma at line 62 of `firestore.indexes.json` makes the file invalid JSON."
  artifacts:
    - path: "src/server/features/candidates/candidates.service.js"
      issue: "Filter construction order mismatch (status, role)"
    - path: "firestore.indexes.json"
      issue: "Index definition order mismatch (role, status) and syntax error (trailing comma)"
  missing:
    - "Correctly ordered composite vector index for 'users' collection"
    - "Valid JSON syntax in firestore.indexes.json"

- truth: "Search with a short query like \"React\". Results should include candidates/jobs with related skills (Next.js, Redux, TypeScript) even if not in original query."
  status: failed
  reason: "User reported: same issue as above Search failed: ... Missing vector index configuration..."
  severity: blocker
  test: 7
  root_cause: "Same root cause as Test 5: Missing/misconfigured vector index blocks search functionality."
  artifacts: []
  missing: []

- truth: "Search results (both jobs and candidates) only show active entities. No passive/expired listings appear."
  status: failed
  reason: "User reported: partially pass Active and Closed are showing"
  severity: major
  test: 8
  root_cause: "Inconsistent status casing ('ACTIVE' vs 'active') between database types and search filters, combined with an explicit inclusion of 'passive' jobs in the default browsing view and a missing 'status' field in the candidate search response whitelist."
  artifacts:
    - path: "functions/index.js"
      issue: "searchCandidatesHandler whitelist missing 'status', mismatch casing on filters"
    - path: "src/features/jobs/services/jobService.ts"
      issue: "getJobs() explicitly queries 'active' and 'passive', allowing closed jobs in browse"
    - path: "src/pages/JobsPage.tsx"
      issue: "Status mapping logic forces anything not 'active' to 'passive' (Closed)"
  missing:
    - "Standardized status casing (ACTIVE)"
    - "Status field in candidate search response"
    - "Filter logic to exclude passive jobs from search/browse"
