---
description: /senior_staff_logic_audit - Architecture, Efficiency, and SOLID Audit
---

# Senior Staff Logic Audit Workflow

Act as a **Senior Staff Software Engineer** (Google standard). Analyze the backend, services, and core logic.

## Steps

1. **Efficiency & Complexity Analysis**
   - Identify O(n^2) or worse logic that can be optimized.
   - Audit for N+1 query problems or redundant API calls.

2. **Architecture & SOLID Principles**
   - Verify DRY (Don't Repeat Yourself) adherence.
   - Check for single-responsibility in functions and components.

3. **Error Handling & Resilience**
   - Ensure no empty `catch` blocks exist.
   - Verify that API failures (e.g., timeouts) are handled gracefully with retries or user feedback.

4. **Type Safety Audit**
   - Confirm strict TypeScript/Type Hint usage.
   - Eliminate `any` or loose types that could cause runtime errors.

5. **Instrumentation**
   - Verify Sentry spans and logs are placed at critical execution points.
