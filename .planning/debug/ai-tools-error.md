---
status: investigating
trigger: "Investigate issue: ai-tools-error"
created: 2026-02-09T00:00:00Z
updated: 2026-02-09T03:56:10Z
---

## Current Focus

hypothesis: The AI generation fails due to a combination of poor UI field ordering and backend JSON parsing errors.
test: Analyze PostJob.tsx layout and functions/index.js AI handlers.
expecting: Identify why the flow is broken and why the "Suggest Questions" tool fails.
next_action: "summarize findings and identify root cause"

## Symptoms

expected: Navigate to "Post a Job". Enter a Job Title (e.g., "Senior React Developer"). Click "Generate Description" - AI should fill the JD field. Click "Generate Screening Questions" - AI should populate questions.
actual: needs change , as error state [ERROR]: Please provide at least a Job Title and some Skills to generate a description. so we need to organize the flow of the fields better think as a Senior Staff engineer and correct the flow , AI Suggest Questions also failing installHook.js:1 Error: Failed to generate assistance data at handleAiGenerateAssist (PostJob.tsx:96:26)
errors: Error: Failed to generate assistance data at handleAiGenerateAssist
reproduction: Test 3 in UAT
timeline: Discovered during UAT

## Eliminated

## Evidence

- timestamp: 2026-02-09T03:56:10Z
  checked: src/pages/PostJob.tsx
  found: handleAiGenerateJd (line 43) requires both title AND skills. However, the "Skills" input field is at the bottom of the form (line 373), while the "Generate Description" button is at the top (line 224).
  implication: The user is forced to jump to the bottom of the form to fill skills before they can use the AI generator at the top.

- timestamp: 2026-02-09T03:56:10Z
  checked: functions/index.js
  found: generateJobAssistHandler (line 339) uses Gemini to generate JSON. It relies on a regex (line 389) to extract JSON and then JSON.parse. If Gemini wraps the JSON in markdown or adds conversational filler that the regex doesn't handle, it throws "AI returned invalid JSON format" (500 error).
  implication: The backend is fragile to LLM output variations, causing the "Failed to generate assistance data" error on the frontend.

## Resolution

root_cause:
fix:
verification:
files_changed: []
