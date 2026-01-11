---
description: "Setup the React, Vite, Firebase, Google AI, Sentry, and Testing environment"
---
1. Install project dependencies
// turbo
2. npm install
3. Install Sentry for React and Vite
// turbo
4. npm install @sentry/react @sentry/vite-plugin --save-dev
5. Install Testing Infrastructure (Vitest, React Testing Library, Playwright)
// turbo
6. npm install vitest jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 --save-dev
7. Initialize Playwright (Install browsers)
// turbo
8. npm init playwright@latest --yes -- --quiet
9. Update `package.json` scripts to include:
   - `"test": "vitest"`
   - `"coverage": "vitest run --coverage"`
   - `"test:e2e": "playwright test"`
10. Check for .env file
11. If .env does not exist, copy .env.example to .env (if available) or create a new one with required keys:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_GOOGLE_AI_API_KEY
   - VITE_SENTRY_DSN
   - VITE_SENTRY_AUTH_TOKEN
12. Login to Firebase CLI
// turbo
13. firebase login
14. **Git Setup**: Ensure `git` is initialized (`git init`) and remote origin is set.
