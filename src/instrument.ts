import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://45f65fa704413041e1a11a99ce3c7b30@o4510482186960896.ingest.us.sentry.io/4510482187878401",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
