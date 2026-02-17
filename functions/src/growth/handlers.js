// functions/src/growth/handlers.js
import { getFirestore } from "firebase-admin/firestore";
import * as Sentry from "@sentry/node";

// Helper to handle errors
const handleError = (res, error, context) => {
    console.error(`${context} Error:`, error);
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error);
    }
    res.status(500).json({ error: `Failed to ${context}` });
};

export const getReferrals = async (req, res) => {
    const db = getFirestore();
    return Sentry.startSpan({
        op: "growth.get-referrals",
        name: "Get User Referrals"
    }, async (span) => {
        try {
            const userId = req.user.uid;

            // Query users who were referred by this user
            const snapshot = await db.collection('users')
                .where('referredBy', '==', userId)
                .orderBy('created_at', 'desc')
                .get();

            const referrals = snapshot.docs.map(doc => {
                const data = doc.data();

                // Determine status logic (mirroring frontend logic)
                let status = 'pending';
                if (data.referralRewarded) status = 'rewarded';
                else if (data.phoneVerified && data.linkedinVerified) status = 'verified';

                return {
                    id: doc.id,
                    uid: doc.id,
                    email: data.email,
                    displayName: data.displayName,
                    status,
                    joinedAt: data.created_at?.toDate() || data.created_at // Handle Firestore Timestamp
                };
            });

            res.json({ referrals });

        } catch (error) {
            handleError(res, error, "fetch referrals");
        }
    });
};
