# Documentation & Maintainability Standards

> **RULE ZERO: Docs First.**
> Any change that is being made must **first** be documented in this `docs/` folder. Only after documentation update and approval can coding proceed.

## 1. The "Docs First" Workflow
1.  **Identify Change:** Understand what needs to be built or fixed.
2.  **Update Requirement Doc:**
    *   If it changes the product features -> Update `docs/PRD.md`.
    *   If it changes the tech stack/schema -> Update `docs/TRD.md`.
    *   If it's a new feature implementation -> Create/Update `docs/features/[feature_name].md`.
3.  **Create Changelog Entry:**
    *   Before coding, create a `docs/changelogs/YYYY-MM-DD-feature-name.md` describing the plan.
    *   Format: **What** (Brief), **Where** (Files affected), **Why** (Reasoning).
4.  **Code:** Implement the changes strictly following the documented plan.

## 2. Scalable Folder Structure (Feature-First)
To locate files easily, specific features get their own folders containing all related UI, hooks, and logic.

```
src/
  app/ (App Router Routes)
    (auth)/login/page.tsx
    (dashboard)/employer/jobs/page.tsx
  
  features/ (Business Logic & Feature-Specific UI)
    auth/
      components/LoginForm.tsx
      hooks/useAuth.ts
      types/auth.types.ts
    jobs/
      components/JobCard.tsx
      hooks/useJobStatus.ts
      services/jobService.ts
  
  components/ (Shared/Generic UI only)
    ui/ (Button, Card, Modal - shadcn/ui)
    layout/ (Navbar, Sidebar)
  
  lib/ (Utilities & Shared Config)
    firebase.ts
    gemini.ts
    utils.ts
```

## 3. Pull Request / Code Review Standards
*   **Traceability:** Every PR must link to the section of the `docs/` naming the requirement it satisfies.
*   **Comments:** Use JSDoc/TSDoc for all exported functions and components.
*   **Magic Numbers:** No magic numbers or hardcoded strings. Use constants files.
*   **AI Friendly:** Code should be self-documenting. Variable names must be descriptive (e.g., `isJobActive` instead of `status`).
