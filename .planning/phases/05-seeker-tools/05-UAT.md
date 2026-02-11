---
status: testing
phase: 05-seeker-tools
source: 05-01 to 05-12 SUMMARY files
started: 2026-02-11T00:00:00Z
updated: 2026-02-11T00:00:00Z
---

## Current Test

number: 1
name: Seeker Dashboard Access
expected: |
  1. Log in as a Seeker (or switch role).
  2. Navigate to `/dashboard`.
  3. Verify you see the "Command Center" layout with widgets for Resume, Market, and Shortlist.
  4. Verify the global Header shows "Dashboard" link.
awaiting: user response

## Tests

### 1. Seeker Dashboard Access
expected: |
  1. Log in as a Seeker.
  2. Navigate to `/dashboard`.
  3. Verify "Command Center" layout (widgets for Resume, Market, Shortlist).
  4. Global Header shows "Dashboard".
result: pending

### 2. AI Resume Analysis
expected: |
  1. On Dashboard or Profile, upload a Resume (PDF/DOCX).
  2. Wait for analysis.
  3. Verify an ATS Score (0-100) and detailed feedback (Strengths/Weaknesses) appear.
result: pending

### 3. Market Salary Insights
expected: |
  1. View the Market Trends widget or page.
  2. Verify it shows salary data (histogram/stats) OR a graceful "Data Unavailable" message.
  3. No crashes or raw errors.
result: pending

### 4. Smart Job Shortlist
expected: |
  1. Check the "Daily Top 5" or "Recommended Jobs" section.
  2. Verify jobs are listed with a "Why this matches" explanation.
  3. If new user, verify "Cold Start" prompt to upload resume.
result: pending

### 5. Apply & Application Tracking
expected: |
  1. Open a Job Detail view.
  2. Click "Apply".
  3. Verify success message.
  4. Go to Application Tracker (Kanban).
  5. Verify the job appears in the "Applied" column.
result: pending

### 6. Skill Gap Analysis
expected: |
  1. Go to Skill Gap / Learning section.
  2. Select/Input a target role.
  3. Verify system lists "Missing Skills" and "Learning Resources".
result: pending

### 7. Simulated Interview
expected: |
  1. Go to Interview Prep.
  2. Start a new session for a role.
  3. Verify questions are generated.
  4. Input an answer, click Submit.
  5. Verify AI provides feedback/grading on the answer.
result: pending

### 8. Verified Skill Proofs
expected: |
  1. Go to Skill Proofs / Assessments.
  2. Select a skill to verify.
  3. Complete the quiz/assessment.
  4. Verify result (Pass/Fail) is displayed.
result: pending

### 9. Insider Connections
expected: |
  1. View a Job/Company or the Networking section.
  2. Check for "Insider Connections" (Alumni/Ex-colleagues).
  3. Click to generate an outreach message.
  4. Verify an AI-drafted message appears in the modal.
result: pending

### 10. Follow-up Nudges
expected: |
  1. Check Application Tracker.
  2. Verify if "Nudge" UI elements exist (badges/alerts) for old applications.
  3. (Note: Might not be visible if all apps are new, but verify the UI component logic doesn't crash).
result: pending

## Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0

## Gaps

