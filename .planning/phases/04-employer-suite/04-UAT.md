---
status: diagnosed
phase: 04-employer-suite
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md
started: 2026-02-09T00:00:00Z
updated: 2026-02-09T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Employer Navigation
expected: |
  Log in as an employer.
  Header should show "Manage Jobs" and "Company Profile" links.
  Clicking "Manage Jobs" goes to /employer/jobs.
  Clicking "Company Profile" goes to /employer/company.
result: pass

### 2. Company Profile Editor
expected: |
  Navigate to Company Profile.
  Edit Bio, Tagline, Website, and Location.
  Click Save.
  Refresh page - changes should persist.
  View Public Profile - changes should be visible.
result: pass

### 3. AI Job Posting Tools
expected: |
  Navigate to "Post a Job".
  Enter a Job Title (e.g., "Senior React Developer").
  Click "Generate Description" - AI should fill the JD field.
  Click "Generate Screening Questions" - AI should populate questions.
result: issue
reported: "needs change , as error state [ERROR]: Please provide at least a Job Title and some Skills to generate a description. so we need to organize the flow of the fields better think as a Senior Staff engineer and correct the flow , AI Suggest Questions also failing installHook.js:1 Error: Failed to generate assistance data at handleAiGenerateAssist (PostJob.tsx:96:26)"
severity: major

### 4. Job Creation & Listing
expected: |
  Complete the job post form and submit.
  Redirects to "Manage Jobs".
  New job appears in the list.
  Status should be "Active".
result: issue
reported: "fail, installHook.js:1 Error posting job: Error: Embedding service failed: 404 at fetchEmbedding (jobService.ts:35:15)"
severity: blocker

### 5. ATS Kanban Board
expected: |
  Click "View Applicants" on a job.
  See Kanban board with columns (Applied, Screening, Interview, etc.).
  If empty, run `npx tsx scripts/seed-applications.ts [jobId]`.
  Verify applicant cards appear.
  Drag a card to a different column - status updates immediately.
result: issue
reported: "fail as no jobs present , ned to resolve earlier issues first"
severity: blocker
expected: |
  Navigate to Company Profile.
  Edit Bio, Tagline, Website, and Location.
  Click Save.
  Refresh page - changes should persist.
  View Public Profile - changes should be visible.
result: pending

## Summary

total: 5
passed: 2
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "AI tools (description & questions) work smoothly with minimal required fields"
  status: failed
  reason: "User reported: needs change , as error state [ERROR]: Please provide at least a Job Title and some Skills to generate a description. so we need to organize the flow of the fields better think as a Senior Staff engineer and correct the flow , AI Suggest Questions also failing installHook.js:1 Error: Failed to generate assistance data at handleAiGenerateAssist (PostJob.tsx:96:26)"
  severity: major
  test: 3
  root_cause: "Frontend flow mismatch (forcing Skills before AI) and backend fragility (JSON parsing of Markdown). PostJob.tsx required skills before generation, and backend failed on non-JSON LLM output."
  artifacts:
    - path: "src/pages/PostJob.tsx"
      issue: "Flow requires skills before AI generation"
    - path: "functions/index.js"
      issue: "JSON parsing fragile to Markdown"
  missing:
    - "Update PostJob.tsx to allow generation with just Title"
    - "Update functions/index.js to use regex for JSON extraction"
  debug_session: ".planning/debug/resolved/ai-tools-flow-issue.md"

- truth: "Job creation succeeds and generates embeddings"
  status: failed
  reason: "User reported: fail, installHook.js:1 Error posting job: Error: Embedding service failed: 404 at fetchEmbedding (jobService.ts:35:15)"
  severity: blocker
  test: 4
  root_cause: "Missing route /api/ai/embedding in functions/index.js. Frontend uses standardized path, but backend Cloud Function lacks the route handler."
  artifacts:
    - path: "functions/index.js"
      issue: "Missing /api/ai/embedding route"
  missing:
    - "Add app.post('/api/ai/embedding', ...) to functions/index.js"
  debug_session: ".planning/debug/job-creation-404.md"

- truth: "ATS Kanban board works for created jobs"
  status: failed
  reason: "User reported: fail as no jobs present , ned to resolve earlier issues first"
  severity: blocker
  test: 5
  root_cause: "Cascading failure from Job Creation + Implementation bug: ApplicantCard used useDraggable inside SortableContext (requires useSortable)."
  artifacts:
    - path: "src/features/applications/components/ApplicantCard.tsx"
      issue: "Used useDraggable instead of useSortable"
  missing:
    - "Refactor ApplicantCard to use useSortable"
  debug_session: ".planning/debug/resolved/ats-kanban-empty.md"
