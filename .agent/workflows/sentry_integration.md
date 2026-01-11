---
description: "Setup Sentry for Error Tracking and Performance Monitoring"
---
1. Ensure Sentry dependencies are installed (see setup_environment).
2. Configure `vite.config.ts`:
   - Import `sentryVitePlugin` from `@sentry/vite-plugin`.
   - Add to `plugins`:
     ```ts
     sentryVitePlugin({
       org: "your-org-name",
       project: "your-project-name",
       authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
     }),
     ```
3. Create `sentry.ts` configuration file:
   ```ts
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [
       Sentry.browserTracingIntegration(),
       Sentry.replayIntegration(),
     ],
     // Tracing
     tracesSampleRate: 1.0, // Capture 100% of transactions for now
     // Session Replay
     replaysSessionSampleRate: 0.1, 
     replaysOnErrorSampleRate: 1.0, 
   });
   ```
4. Wrap the main App render in `main.tsx` or `index.tsx`:
   - Ensure `import './sentry';` is at the very top.
