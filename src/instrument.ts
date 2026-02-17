import * as Sentry from "@sentry/react";

const isProd = import.meta.env.PROD;

Sentry.init({
    dsn: "https://45f65fa704413041e1a11a99ce3c7b30@o4510482186960896.ingest.us.sentry.io/4510482187878401",
    environment: isProd ? "production" : "development",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
    ],
    enableLogs: true,
    // Tracing — 20% in prod, 100% in dev
    tracesSampleRate: isProd ? 0.2 : 1.0,
    // Session Replay
    replaysSessionSampleRate: isProd ? 0.1 : 0.0,
    replaysOnErrorSampleRate: 1.0,
});
