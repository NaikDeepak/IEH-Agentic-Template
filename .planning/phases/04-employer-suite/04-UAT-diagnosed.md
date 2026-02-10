---
status: diagnosed
phase: 04-employer-suite
source: [04-01, 04-02, 04-03, 04-06, 04-08, 04-09]
started: 2026-02-09T12:00:00Z
updated: 2026-02-09T13:00:00Z
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

### 3. AI Job Posting Tools (New Flow Verification)
expected: |
  Navigate to "Post a Job".
  **Verify Flow:** Title -> Skills -> Location/Type/Mode -> "Generate Description" Button -> JD Editor.
  Enter Title (e.g., "Senior React Developer").
  Enter Skills, Location, Type, and Mode.
  Click "Generate Description with AI".
  **Verify JD is generated** and includes context from the fields above.
  **Verify no "Missing required fields" error.**
result: issue
reported: "400 Bad Request. Error: Missing required fields: role, skills, experience at handleAiGenerateJd (PostJob.tsx:71:15)"
severity: major

### 4. Job Creation & Listing (Fix Verification)
expected: |
  Complete the job post form and submit.
  Redirects to "Manage Jobs".
  New job appears in the list.
  Status should be "Active".
  **Verify no "Embedding service returned invalid vector" error.**
result: pass

### 5. ATS Kanban Board
expected: |
  Click "View Applicants" on a job.
  See Kanban board with columns (Applied, Screening, Interview, etc.).
  If empty, run `npx tsx scripts/seed-applications.ts [jobId]`.
  Verify applicant cards appear.
  Drag a card to a different column - status updates immediately.
result: issue
reported: "from which screen I can check this"
severity: major

## Summary

total: 5
passed: 3
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Job posting flow is logical and AI generation works reliably"
  status: failed
  reason: "User reported: 400 Bad Request. Error: Missing required fields: role, skills, experience"
  severity: major
  test: 3
  root_cause: "Backend validation is too strict. Deployed cloud function or local server middleware requires 'skills' and 'experience' to be present and non-empty, but frontend sends empty strings or undefined if user hasn't filled them yet. Need to make these fields optional in backend validation."
  artifacts:
    - path: "src/pages/PostJob.tsx"
      issue: "Frontend sends potential empty/undefined values for optional fields."
    - path: "functions/index.js"
      issue: "Backend validation logic enforces presence of optional fields."
  missing:
    - "Relax backend validation to allow empty skills/experience"
    - "Ensure frontend sends default empty strings instead of undefined"
  debug_session: ".planning/debug/ai-job-posting-400-error.md"

- truth: "ATS Kanban board is easily accessible and functional"
  status: failed
  reason: "User reported: from which screen I can check this"
  severity: major
  test: 5
  root_cause: "Navigation/UX issue: The 'Manage Jobs' link points to public job listing instead of employer dashboard. JobCard component lacks a 'View Applicants' button for the job owner. The route exists but is unreachable via UI."
  artifacts:
    - path: "src/components/Header.tsx"
      issue: "'Manage Jobs' link points to /jobs instead of /employer/jobs"
    - path: "src/components/JobCard.tsx"
      issue: "Missing 'View Applicants' button for job owner"
  missing:
    - "Update Header.tsx to point 'Manage Jobs' to employer dashboard"
    - "Add 'View Applicants' button to JobCard when user is owner"
  debug_session: ".planning/debug/ats-kanban-navigation-missing.md"
