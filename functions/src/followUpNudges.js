import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import * as Sentry from "@sentry/node";

/**
 * Scheduled function to identify stale applications and flag them for follow-up.
 * Runs daily at midnight.
 */
export const followUpNudges = onSchedule("every 24 hours", async (event) => {
    const db = getFirestore();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const batchLimit = 500;

    console.log(`Follow-up Nudges check started at ${now.toISOString()}`);

    try {
        // Query for applications in 'applied' or 'screening' or 'interview' status
        // that haven't been updated in 7 days.
        // Note: The plan mentioned 'applied' or 'interviewing'.
        // Our types have 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected'.
        // We'll target 'applied', 'screening', and 'interview'.

        const statusesToCheck = ['applied', 'screening', 'interview'];
        let totalProcessed = 0;

        for (const status of statusesToCheck) {
            const snapshot = await db.collection("applications")
                .where("status", "==", status)
                .where("updated_at", "<", sevenDaysAgo)
                .get();

            if (snapshot.empty) {
                console.log(`No stale applications found for status: ${status}`);
                continue;
            }

            let batch = db.batch();
            let operationCount = 0;

            for (const doc of snapshot.docs) {
                const data = doc.data();

                // Only flag if not already flagged or if the flag is old
                if (!data.needsFollowUp) {
                    batch.update(doc.ref, {
                        needsFollowUp: true,
                        nudgeReason: `No activity for ${status} status in 7 days`,
                        updated_at: now // We update this to avoid re-processing immediately if logic changes, though it might reset the 7-day clock
                    });
                    operationCount++;
                    totalProcessed++;
                }

                if (operationCount >= batchLimit) {
                    await batch.commit();
                    batch = db.batch();
                    operationCount = 0;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            console.log(`Processed ${operationCount} applications for status: ${status}`);
        }

        console.log(`Follow-up Nudges check finished. Total flagged: ${totalProcessed}`);

    } catch (error) {
        console.error("Follow-up Nudges failed:", error);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error);
        }
    }
});
