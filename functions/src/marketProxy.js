import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as Sentry from "@sentry/node";

/**
 * Proxies requests to Adzuna API for market salary data.
 * Expected data: { role: string, country: string }
 */
export const marketProxy = onCall(async (request) => {
    // Check authentication
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const { role, country = "in" } = request.data;

    if (!role) {
        throw new HttpsError("invalid-argument", "The function must be called with a 'role' argument.");
    }

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        console.error("Adzuna API credentials missing");
        throw new HttpsError("failed-precondition", "Market data service is not configured.");
    }

    try {
        // Adzuna Histogram API for salary distribution
        // Documentation: https://developer.adzuna.com/docs/search
        const url = `https://api.adzuna.com/v1/api/jobs/${country.toLowerCase()}/histogram?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(role)}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Adzuna API error: ${response.status}`, errorText);
            throw new HttpsError("unavailable", "Failed to fetch data from market provider.");
        }

        const data = await response.json();

        // Adzuna returns { "histogram": { "20000": 5, ... } }
        // If empty, histogram might be {} or null
        if (!data || !data.histogram || Object.keys(data.histogram).length === 0) {
            return {
                role,
                country,
                available: false,
                message: "No salary data available for this role in the selected region."
            };
        }

        return {
            role,
            country,
            available: true,
            histogram: data.histogram,
            // Derived stats if possible
            stats: calculateStats(data.histogram)
        };

    } catch (error) {
        console.error("Market Proxy Error:", error);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error);
        }

        if (error instanceof HttpsError) throw error;

        throw new HttpsError("internal", "An internal error occurred while fetching market data.");
    }
});

/**
 * Calculates basic stats from Adzuna histogram data.
 * Histogram is { "salary_point": count }
 */
function calculateStats(histogram) {
    const points = Object.keys(histogram).map(Number).sort((a, b) => a - b);
    if (points.length === 0) return null;

    let totalCount = 0;
    let weightedSum = 0;

    points.forEach(point => {
        const count = histogram[point];
        totalCount += count;
        weightedSum += (point * count);
    });

    const average = Math.round(weightedSum / totalCount);
    const min = points[0];
    const max = points[points.length - 1];

    // Simple median approximation
    let currentCount = 0;
    let median = average;
    for (const point of points) {
        currentCount += histogram[point];
        if (currentCount >= totalCount / 2) {
            median = point;
            break;
        }
    }

    return {
        average,
        median,
        min,
        max,
        sampleSize: totalCount
    };
}
