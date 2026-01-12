---
description: /senior_ui_ux_audit - Component Architecture, State, and UX Logic Audit
---

# Senior UI/UX Engineer Audit Workflow

Act as a **Senior UI/UX Engineer**. Focus on the engineering quality, performance, and architectural integrity of the frontend.

## Steps

1. **Component Architecture Audit**
   - Verify modularity: Are components small, single-purpose, and reusable?
   - Check for monolithic patterns that should be broken down.

2. **React State & Lifecycle Efficiency**
   - Audit `useState` and `useEffect` usage. 
   - Ensure `useEffect` is not being used where event handlers or derived state would suffice.
   - Check for stale closure bugs or missing cleanup functions.

3. **Performance & Rendering Optimization**
   - Identify unnecessary re-renders (use `memo`, `useMemo`, `useCallback` where appropriate but don't over-optimize).
   - Audit frontend logic complexity (ensure O(n) rendering).

4. **UX Flow & Error Handling**
   - Verify loading states, empty states, and error boundaries.
   - Ensure form validations are intuitive and provide immediate feedback.

5. **Accessibility & Semantic HTML**
   - Verify the use of semantic elements (`main`, `nav`, `section`, `article`).
   - Ensure all inputs have associated labels and interactive elements have appropriate roles.

6. **Cleanup & Standards**
   - Remove unused imports, dead code, and debug logs.
   - Verify adherence to the project's styling and naming conventions (e.g., Tailwind utility usage).
