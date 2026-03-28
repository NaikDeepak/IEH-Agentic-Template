# Sentry Configuration & Instrumentation Guide

This document provides standards for error tracking and performance monitoring using Sentry.

## Initialization

### Next.js Configuration
Initialization happens in specific files. Do not repeat `Sentry.init` elsewhere.
- **Client**: `instrumentation-client.(js|ts)`
- **Server**: `sentry.server.config.ts`
- **Edge**: `sentry.edge.config.ts`

### Baseline Setup
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://45f65fa704413041e1a11a99ce3c7b30@o4510482186960896.ingest.us.sentry.io/4510482187878401",
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```

## Instrumentation

### Exception Catching
Use `Sentry.captureException(error)` in `try/catch` blocks.

### Performance Tracing
Use `Sentry.startSpan` for meaningful actions (clicks, API calls).

```javascript
Sentry.startSpan({
  op: "ui.click",
  name: "Submit Application",
}, (span) => {
  span.setAttribute("jobId", jobId);
  // ... logic
});
```

## Structured Logging
Reference the logger using `const { logger } = Sentry`. Use `logger.fmt` for variables.

| Level | Usage Example |
| :--- | :--- |
| `debug` | `logger.debug(logger.fmt`Cache miss for user: ${userId}`)` |
| `info` | `logger.info("Updated profile", { profileId: 345 })` |
| `warn` | `logger.warn("Rate limit reached", { endpoint: "/api/results" })` |
| `error` | `logger.error("Failed to process payment", { orderId: "123" })` |
| `fatal` | `logger.fatal("DB connection pool exhausted")` |
