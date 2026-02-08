import * as Sentry from "@sentry/node";
import { config } from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    // Send to Sentry if configured
    if (config.sentryDsn) {
        Sentry.captureException(err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: message,
        code: err.code || 'INTERNAL_ERROR',
        details: config.env === 'development' ? err.stack : undefined
    });
};
