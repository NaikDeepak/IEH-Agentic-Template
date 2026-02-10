---
status: diagnosed
phase: 04-employer-suite
source: 04-01, 04-02, 04-03, 04-06, 04-10
started: 2026-02-10T11:15:00Z
updated: 2026-02-10T11:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Employer Profile & Dashboard Access
expected: |
  1. Login as an employer.
  2. Verify "Company Profile" and "Manage Jobs" links appear in the header.
  3. Click "Company Profile" -> Verify profile editor loads.
  4. Click "Manage Jobs" -> Verify it goes to the dedicated Employer Dashboard (/employer/jobs), NOT the public job board.
result: issue
reported: "issue with 4 - [DATABASE_ERROR] Failed to load your job postings."
severity: blocker

### 2. AI Job Posting (New Flow)
expected: |
  1. Go to "Post a Job".
  2. Enter ONLY a Job Title (e.g., "Product Manager").
  3. Click the AI "Auto-Fill" or "Generate" button.
  4. Expected: AI successfully generates Description and Skills WITHOUT errors about missing fields.
result: pass

### 3. Job Submission
expected: |
  1. Review the generated content.
  2. Submit the job.
  3. Expected: Success message, redirect to Employer Dashboard. New job appears in the "Active" list.
result: pass

### 4. ATS Access & Kanban
expected: |
  1. On the Employer Dashboard, find the job you just created.
  2. Click the "View Applicants" (or "Track") button on the card.
  3. Expected: Redirects to the ATS Kanban board for that job.
result: pass

### 5. ATS Functionality (Seed & Drag)
expected: |
  1. If board is empty, run in terminal: `npx tsx scripts/seed-applications.ts <job-id>` (or just `npx tsx scripts/seed-applications.ts` if it picks latest).
  2. Refresh to see applicants.
  3. Drag an applicant from "Applied" to "Screening".
  4. Expected: Card moves and stays in the new column.
result: pass

## Summary

total: 5
passed: 4
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Employer can access their jobs dashboard"
  status: failed
  reason: "User reported: issue with 4 - [DATABASE_ERROR] Failed to load your job postings."
  severity: blocker
  test: 1
  root_cause: "Missing Firestore composite index for querying jobs by 'employer_id' ordered by 'created_at' descending."
  artifacts:
    - path: "src/features/jobs/services/jobService.ts"
      issue: "Query requires composite index"
    - path: "firestore.indexes.json"
      issue: "Missing index definition"
  missing:
    - "Add composite index to firestore.indexes.json"
  debug_session: ".planning/debug/employer-dashboard-error.md"

- truth: "Job posting form pre-fills company details"
  status: failed
  reason: "User reported: we can fetch and update the About us section rather than asking employer to fill as he is already logged in"
  severity: minor
  test: 2
  root_cause: "PostJob form initializes with empty state and never fetches the employer's existing company profile."
  artifacts:
    - path: "src/pages/PostJob.tsx"
      issue: "Missing useEffect to fetch company profile on mount"
    - path: "src/features/jobs/types.ts"
      issue: "Missing 'company_bio' field in JobPosting schema"
  missing:
    - "Update JobPosting schema to include company_bio"
    - "Add data fetching logic to PostJob.tsx"
    - "Add 'About Company' field to form and pre-fill it"
  debug_session: ".planning/debug/job-posting-prefill.md"
