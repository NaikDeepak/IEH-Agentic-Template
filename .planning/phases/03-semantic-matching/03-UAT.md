---
status: testing
phase: 03-semantic-matching
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md]
started: 2026-02-08T01:40:00Z
updated: 2026-02-08T01:40:00Z
---

## Current Test

number: 1
name: Jobs Page Search Bar
expected: |
  Navigate to /jobs. A search bar is visible at the top.
  Enter a query like "React developer" and submit.
  Page shows search results (may take a moment for AI processing).
awaiting: user response

## Tests

### 1. Jobs Page Search Bar
expected: Navigate to /jobs. Search bar visible at top. Enter query and submit. Results appear.
result: [pending]

### 2. Job Match Scores Display
expected: After searching on /jobs, job cards show a percentage match badge (e.g., "85% Match"). High scores appear green (>80%), medium yellow (50-80%).
result: [pending]

### 3. Clear Search Restores Browse
expected: After a search, click "Clear" or clear the search input. Page returns to showing all active jobs (browse mode) without match scores.
result: [pending]

### 4. Find Talent Navigation (Employer Only)
expected: Log in as an Employer. Navigation/header shows "Find Talent" link. Click it to go to /employer/search.
result: [pending]

### 5. Talent Search Page
expected: On /employer/search, enter a search query like "Python backend". Submit shows candidate cards with names, skills, and match scores.
result: [pending]

### 6. Candidate Match Score Colors
expected: On talent search results, candidates with high match scores (>80%) show green badge, medium (50-80%) show yellow, low (<50%) show gray.
result: [pending]

### 7. Query Expansion Effect
expected: Search with a short query like "React". Results should include candidates/jobs with related skills (Next.js, Redux, TypeScript) even if not in original query.
result: [pending]

### 8. Active-Only Results
expected: Search results (both jobs and candidates) only show active entities. No passive/expired listings appear.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0

## Gaps

[none yet]
