import * as Sentry from "@sentry/node";
import { db } from "../../config/firebase.js";

/**
 * Get referrals for the authenticated user
 */
export const getReferrals = async (req, res) => {
    return Sentry.startSpan({
        op: "growth.get-referrals",
        name: "Get User Referrals"
    }, async (span) => {
        try {
            const userId = req.user.uid;

            // Query users who were referred by this user
            const snapshot = await db.collection('users')
                .where('referredBy', '==', userId)
                .get();

            if (snapshot.empty) {
                return res.json({ referrals: [] });
            }

            const referrals = snapshot.docs.map(doc => {
                const data = doc.data();

                // Determine status logic (mirroring frontend logic)
                let status = 'pending';
                if (data.referralRewarded) status = 'rewarded';
                else if (data.phoneVerified && data.linkedinVerified) status = 'verified';

                // Handle inconsistent timestamp field names
                const timestamp = data.created_at || data.createdAt;

                return {
                    id: doc.id,
                    uid: doc.id,
                    email: data.email,
                    displayName: data.displayName,
                    status,
                    joinedAt: timestamp?.toDate?.() || timestamp || new Date(0).toISOString()
                };
            });

            // In-memory sort
            referrals.sort((a, b) => {
                const dateA = new Date(a.joinedAt).getTime();
                const dateB = new Date(b.joinedAt).getTime();
                return dateB - dateA;
            });

            res.json({ referrals });

        } catch (error) {
            console.error(`[Referral Error] fetch referrals:`, error);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(error);
            }
            res.status(500).json({ error: "Failed to fetch referrals" });
        }
    });
};
