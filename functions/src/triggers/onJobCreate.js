import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";

/**
 * When a new job is created, check active job alerts and notify matching seekers.
 * Matching logic: keywords (case-insensitive) found in job title or skills,
 * and location matches (if specified in alert).
 */
export const onJobCreate = onDocumentCreated("jobs/{jobId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const job = snapshot.data();
    if (!job || job.status !== 'active') return;

    const db = getFirestore();
    const jobTitle = (job.title ?? '').toLowerCase();
    const jobSkills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
    const jobLocation = (job.location ?? '').toLowerCase();
    const jobType = (job.type ?? '').toUpperCase();

    try {
        // Load all active job alerts
        const alertsSnap = await db
            .collection('jobAlerts')
            .where('active', '==', true)
            .get();

        if (alertsSnap.empty) return;

        const batch = db.batch();
        let notifCount = 0;

        for (const alertDoc of alertsSnap.docs) {
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
                link: `/jobs/${event.params.jobId}`,
                createdAt: new Date(),
            });
            notifCount++;

            // Limit batch size
            if (notifCount >= 100) break;
        }

        if (notifCount > 0) {
            await batch.commit();
            console.log(`[onJobCreate] Sent ${notifCount} job alert notifications for job ${event.params.jobId}`);
        }
    } catch (err) {
        console.error('[onJobCreate] Error processing job alerts:', err);
    }
});
