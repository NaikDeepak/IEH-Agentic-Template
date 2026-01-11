---
description: "Standard Operating Procedure for TDD Feature Development (Red-Green-Refactor-Review)"
---
1. **Start Feature**: Run `/start_feature` to ensure you are on a dedicated branch. **NEVER** commit directly to `main`.
2. **Understand Requirement**: Clearly define what needs to be built.
3. **RED (Write Failing Test)**:
   - Write a unit test in `__tests__` that asserts the desired functionality.
   - Run the test to confirm it fails (`npm run test`).
4. **GREEN (Make it Pass)**:
   - Write the *minimum* amount of code in the component/logic file to pass the test.
   - Persona: Senior Staff Engineer (Logic) or Principal Design Engineer (UI).
5. **REFACTOR (Clean it Up)**:
   - Optimize code (O(n), DRY, SOLID).
   - Improve aesthetics (Tailwind, Animations).
   - Ensure tests still pass.
6. **E2E VERIFICATION (Playwright)**:
   - For user-facing flows, write/update a Playwright test in `e2e/`.
   - Ensure the new flow works from a user perspective.
7. **COVERAGE CHECK**:
   - Run `npm run coverage` to ensure you haven't dropped below 80%.
8. **Submit for Review**:
   - Commit changes: `git commit -m "feat: [description]"`
   - Push to remote: `git push origin feature/[name]`
   - **DO NOT MERGE LOCALLY**. Go to GitHub/GitLab and open a Pull Request.
