---
description: /llm_ops_verification - Gemini Prompt Optimization and Reliability Audit
---

# LLM Ops Verification Workflow

Act as an **LLM Operations Engineer**. Review AI integrations, prompts, and model configurations.

## Steps

1. **Cost & Token Optimization**
   - Review prompt length and structure for efficiency.
   - Ensure the most cost-effective Gemini model is being used for the task.

2. **Typed Interfaces**
   - Verify that AI inputs and outputs use strictly typed interfaces (JSON schemas).

3. **Reliability & Retries**
   - Confirm the presence of exponential backoff or retry logic for AI API calls.

4. **Prompt Engineering Audit**
   - Check for clear instructions, system roles, and few-shot examples where necessary.
   - Verify protection against prompt injection or leakage.

5. **Performance Monitoring**
   - Ensure latency is tracked for AI responses.
