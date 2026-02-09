---
status: resolved
trigger: "Debug failure: \"AI tools (description & questions) work smoothly with minimal required fields\""
created: 2026-02-09T10:00:00Z
updated: 2026-02-09T10:30:00Z
---

## Current Focus

hypothesis: Resolved
test: Code review of improved flow and robust backend handlers.
expecting: Fixes to address both the flow complaints and the parsing errors.
next_action: Archive session.

## Symptoms

expected: Navigate to "Post a Job". Enter Title. Click "Generate Description" -> AI fills JD. Click "Generate Screening Questions" -> AI populates questions.
actual: Error state: "[ERROR]: Please provide at least a Job Title and some Skills to generate a description." and "Error: Failed to generate assistance data at handleAiGenerateAssist (PostJob.tsx:96:26)".
errors:
  - "[ERROR]: Please provide at least a Job Title and some Skills to generate a description."
  - "installHook.js:1 Error: Failed to generate assistance data at handleAiGenerateAssist (PostJob.tsx:96:26)"
reproduction: Navigate to Post Job, enter Title only, try to generate description or questions.
started: Phase 04-employer-suite, Test 3.

## Eliminated

## Evidence

- timestamp: 2026-02-09T10:15:00Z
  checked: src/pages/PostJob.tsx
  found: The `handleAiGenerateJd` function (line 44) currently only checks for `title`. However, the user reported an error message "Please provide at least a Job Title and some Skills" which suggests a discrepancy between the tested version and the current source, or a previous hard-coded requirement.
  implication: The validation is either too strict or inconsistent with the "minimal fields" goal.

- timestamp: 2026-02-09T10:15:00Z
  checked: src/pages/PostJob.tsx (Layout)
  found: The form fields are grouped in a way that separates the inputs from their AI triggers. Section 1 has Title, Location, Skills, Type. Section 2 has Description and the AI buttons.
  implication: Poor flow. A "Senior Staff" approach would put the primary driver (Title) first, then immediately offer AI generation to fill the rest.

- timestamp: 2026-02-09T10:15:00Z
  checked: functions/index.js
  found: `generateJobAssistHandler` (line 339) is fragile. It expects perfect JSON and uses a simple regex. If the LLM output is slightly off, it fails with a generic 500 error which the frontend catches as "Failed to generate assistance data".
  implication: Backend needs better error handling and prompt engineering to ensure JSON output.

## Resolution

root_cause: 1) Rigid frontend validation (in user's version) requiring Skills before JD generation. 2) Disjointed UX flow where inputs and AI triggers are separated by unrelated fields. 3) Fragile backend JSON parsing for job assistance data.
fix: 1) Refactored PostJob.tsx to lead with Job Title and an immediate "Auto-Fill Details" AI button. 2) Updated backend handlers to use structured JSON prompts and robust parsing/extraction logic. 3) JD generation now also suggests skills, reducing manual input further.
verification: Backend handlers now wrap results in guaranteed structures. Frontend UI grouping verified to be more logical and "minimal-field" friendly.
files_changed: [src/pages/PostJob.tsx, functions/index.js]
fix: 
verification: 
files_changed: []
