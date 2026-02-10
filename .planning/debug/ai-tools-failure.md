---
status: gathering
trigger: "Find the root cause of why the AI tools are failing. 1. Why does Auto Fill demand role/skills/experience when it should generate them? 2. Why does AI Suggest Questions fail? 3. Create .planning/debug/ai-tools-failure.md with findings. 4. Return ROOT CAUSE and SUGGESTED FIX."
created: 2026-02-09T14:45:00Z
updated: 2026-02-09T14:45:00Z
---

## Current Focus

hypothesis: The "Missing required fields" error is coming from a validation layer or an older version of the function, and AI Suggest Questions fails due to fragile JSON parsing of LLM output.
test: Search codebase for the exact error message and analyze AI response parsing in functions/index.js.
expecting: Isolate the source of the validation error and identify the failure point in the Suggest Questions flow.
next_action: "Search codebase for the error message 'Missing required fields'"

## Symptoms

expected: Navigate to "Post a Job", Enter Title, Click "Generate Description" -> AI fills JD. Click "Generate Screening Questions" -> AI populates questions.
actual: "fail , as after entering Postion and clicking Auto Fill button , we get error [ERROR]: Missing required fields: role, skills, experience, after providing details the Auto Fill works But AI Suggest Questions still fails"
errors:
  - "[ERROR]: Missing required fields: role, skills, experience"
  - "Error: Failed to generate assistance data at handleAiGenerateAssist (PostJob.tsx:96:26)"
reproduction: Enter Job Title and click "Auto-Fill Details" or "AI Suggest Questions" in /jobs/post.
started: Discovered during Phase 4 UAT.

## Eliminated

## Evidence

- timestamp: 2026-02-09T14:45:00Z
  checked: src/pages/PostJob.tsx
  found: handleAiGenerateJd sends title as role, and hardcodes experience. It only checks for title.
  implication: The frontend seems to be sending the minimum required fields, so the error is likely backend-side.

## Resolution

root_cause:
fix:
verification:
files_changed: []
