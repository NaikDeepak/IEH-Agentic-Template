import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { generateJobTokens } from '../utils/tokenizer.js';

// Pagination constants
const BATCH_SIZE = 50;
const MAX_NOTIFICATIONS = 100;
const TIMEOUT_THRESHOLD_MS = 50000; // 50 seconds
const MAX_TOKENS_FOR_QUERY = 10; // array-contains-any supports max 30, use 10 for efficiency

/**
 * When a new job is created, check active job alerts and notify matching seekers.
 * 
 * Uses token-based matching for efficiency:
 * 1. Generate tokens from job (title, skills, location, type)
 * 2. Query alerts that have matching searchTokens (indexed)
 * 3. Fall back to pagination scan if no tokens or no matches
 */
export const onJobCreate = onDocumentCreated("jobs/{jobId}", async (event) => {
    const startTime = Date.now();
    const snapshot = event.data;
    if (!snapshot) return;

    const job = snapshot.data();
    if (!job || job.status !== 'active') return;

    const db = getFirestore();
    const jobId = event.params.jobId;

    try {
        const batch = db.batch();
        let notificationsSent = 0;
        let matchingPath = 'none';

        // Generate tokens from the new job
        const jobTokens = generateJobTokens(job);

        if (jobTokens.length > 0) {
            // Token-based query path (preferred - fast indexed lookup)
            const queryTokens = jobTokens.slice(0, MAX_TOKENS_FOR_QUERY);
            
            const alertsSnap = await db
                .collection('jobAlerts')
                .where('active', '==', true)
                .where('searchTokens', 'array-contains-any', queryTokens)
                .limit(MAX_NOTIFICATIONS)
                .get();

            if (!alertsSnap.empty) {
                matchingPath = 'token-based';
                logger.info(`[onJobCreate] Using token-based matching for job ${jobId}`, {
                    tokenCount: jobTokens.length,
                    queryTokens: queryTokens.length,
                    alertMatches: alertsSnap.size,
                });

                // Process token-matched alerts
                for (const alertDoc of alertsSnap.docs) {
                    const alert = alertDoc.data();

                    // Skip if alert belongs to the job poster (if employerId exists)
                    if (job.employerId && alert.seekerId === job.employerId) continue;

                    // Create notification for this seeker
                    const notifRef = db.collection('notifications').doc();
                    batch.set(notifRef, {
                        userId: alert.seekerId,
                        type: 'new_match',
                        title: 'New job matches your alert',
                        message: `"${job.title}" at ${job.location} matches your alert for "${alert.keywords}".`,
                        read: false,
                        link: `/jobs/${jobId}`,
                        createdAt: new Date(),
                    });
                    notificationsSent++;

                    if (notificationsSent >= MAX_NOTIFICATIONS) break;
                }
            } else {
                logger.info(`[onJobCreate] Token query returned 0 results for job ${jobId}, falling back to pagination`);
                notificationsSent = await paginatedAlertScan(db, batch, job, jobId, startTime);
                matchingPath = 'pagination-fallback';
            }
        } else {
            // No tokens available, use paginated scan
            logger.info(`[onJobCreate] No job tokens available for job ${jobId}, using paginated scan`);
            notificationsSent = await paginatedAlertScan(db, batch, job, jobId, startTime);
            matchingPath = 'pagination-no-tokens';
        }

        // Commit all notifications in single batch
        if (notificationsSent > 0) {
            await batch.commit();
        }

        logger.info(`[onJobCreate] Completed for job ${jobId}`, {
            matchingPath,
            notificationsSent,
            durationMs: Date.now() - startTime,
        });
    } catch (err) {
        logger.error('[onJobCreate] Error processing job alerts:', err);
    }
});

/**
 * Fallback: Paginated scan of all active alerts with manual matching
 * Used when token-based query returns no results or job has no tokens
 */
async function paginatedAlertScan(db, batch, job, jobId, startTime) {
    const jobTitle = (job.title ?? '').toLowerCase();
    const jobSkills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
    const jobLocation = (job.location ?? '').toLowerCase();
    const jobType = (job.type ?? '').toUpperCase();

    let notificationsSent = 0;
    let alertsScanned = 0;
    let batchesProcessed = 0;
    let lastDoc = null;

    // Cursor-based pagination loop
    while (notificationsSent < MAX_NOTIFICATIONS) {
        // Check timeout threshold
        if (Date.now() - startTime > TIMEOUT_THRESHOLD_MS) {
            logger.warn(`[onJobCreate] Approaching timeout, stopping early for job ${jobId}`);
            break;
        }

        // Build paginated query
        let query = db
            .collection('jobAlerts')
            .where('active', '==', true)
            .orderBy('createdAt')
            .limit(BATCH_SIZE);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const alertsSnap = await query.get();
        batchesProcessed++;

        // No more documents to process
        if (alertsSnap.empty) break;

        for (const alertDoc of alertsSnap.docs) {
            alertsScanned++;
            const alert = alertDoc.data();
            const alertKeywords = (alert.keywords ?? '').toLowerCase();
            const alertLocation = (alert.location ?? '').toLowerCase();
            const alertJobType = (alert.jobType ?? '').toUpperCase();

            // Check keyword match
            const keywordTokens = alertKeywords.split(/[,\s]+/).filter(Boolean);
            const textToSearch = `${jobTitle} ${jobSkills}`;
            const keywordMatch = keywordTokens.some(kw => textToSearch.includes(kw));
            if (!keywordMatch) continue;

            // Check location match (if specified)
            if (alertLocation && !jobLocation.includes(alertLocation)) continue;

            // Check job type match (if specified)
            if (alertJobType && alertJobType !== jobType) continue;

            // Create notification for this seeker
            const notifRef = db.collection('notifications').doc();
            batch.set(notifRef, {
                userId: alert.seekerId,
                type: 'new_match',
                title: 'New job matches your alert',
                message: `"${job.title}" at ${job.location} matches your alert for "${alert.keywords}".`,
                read: false,
                link: `/jobs/${jobId}`,
                createdAt: new Date(),
            });
            notificationsSent++;

            // Exit if we've hit max notifications
            if (notificationsSent >= MAX_NOTIFICATIONS) break;
        }

        // Set cursor for next iteration
        lastDoc = alertsSnap.docs[alertsSnap.docs.length - 1];

        // If this batch had fewer docs than limit, we've reached the end
        if (alertsSnap.docs.length < BATCH_SIZE) break;
    }

    logger.info(`[onJobCreate] Paginated scan completed for job ${jobId}`, {
        batchesProcessed,
        alertsScanned,
        notificationsSent,
    });

    return notificationsSent;
}
