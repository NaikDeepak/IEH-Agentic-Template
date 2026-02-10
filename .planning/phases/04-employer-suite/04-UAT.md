---
status: diagnosed
phase: 04-employer-suite
source: 04-01 through 04-11 summaries
started: 2026-02-10T00:00:00Z
updated: 2026-02-10T12:30:00Z
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
  5. **Verify no DATABASE_ERROR on dashboard load.**
result: pass

### 2. AI Job Posting (Pre-fill Check)
expected: |
  1. Ensure you have a Company Bio set in your profile.
  2. Go to "Post a Job".
  3. **Verify "About Company" field is pre-filled with your bio.**
  4. Enter ONLY a Job Title (e.g., "Senior Node Engineer").
  5. Click the AI "Auto-Fill" or "Generate" button.
  6. Expected: AI successfully generates Description and Skills.
result: pass

### 3. Job Submission
expected: |
  1. Review the generated content (including the pre-filled bio).
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
result: issue
reported: "step 4 fails , doesnt save  due to installHook.js:1 Failed to update status: FirebaseError: Missing or insufficient permissions."
severity: blocker

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Employer can drag applicants to update status"
  status: failed
  reason: "User reported: step 4 fails , doesnt save  due to installHook.js:1 Failed to update status: FirebaseError: Missing or insufficient permissions."
  severity: blocker
  test: 5
  root_cause: "Missing 'allow update' rule in firestore.rules for applications collection."
  artifacts:
    - path: "firestore.rules"
      issue: "No update permission for applications"
  missing:
    - "Add update rule allowing employer to change status"
  debug_session: ".planning/debug/kanban-permission-error.md"
