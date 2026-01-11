---
description: "Build and deploy with strict Testing and Coverage Gates"
---
1. Run Unit Tests with Coverage Check (Must be > 80%)
   - *Note: Ensure vitest.config.ts has coverage threshold set.*
// turbo
2. npm run coverage
3. Run Playwright End-to-End Tests
// turbo
4. npm run test:e2e
5. Run Linting and Type Checking verification
// turbo
6. npm run lint && tsc --noEmit
7. Build for production
// turbo
8. npm run build
9. Deploy to Firebase
// turbo
10. firebase deploy
