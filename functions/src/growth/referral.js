
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const getDb = () => getFirestore();
const USERS_COLLECTION = 'users';
const APPLICATIONS_COLLECTION = 'applications';
const LEDGER_COLLECTION = 'ledger';

const adjustPoints = async (uid, amount, type, metadata = {}) => {
    const db = getDb();
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const ledgerRef = db.collection(LEDGER_COLLECTION).doc();

    try {
        await db.runTransaction(async (transaction) => {
            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists) {
                // If user doesn't exist, we can't reward them. Log error.
                throw new Error(`User ${uid} does not exist for reward.`);
            }

            const userData = userSnap.data();
            const currentPoints = (userData.browniePoints || 0);
            const newPoints = currentPoints + amount;

            if (newPoints < 0) {
                throw new Error('Insufficient points for this transaction');
            }

            // Update user points
            transaction.update(userRef, {
                browniePoints: FieldValue.increment(amount),
                updated_at: FieldValue.serverTimestamp()
            });

            // Create ledger entry
            transaction.set(ledgerRef, {
                uid,
                amount,
                type,
                metadata,
                timestamp: FieldValue.serverTimestamp()
            });
        });
    } catch (error) {
        console.error(`Ledger transaction failed for ${uid}:`, error);
        throw error;
    }
};

export const checkAndRewardReferrer = async (uid) => {
    if (!uid) return;

    const db = getDb();
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const ledgerRef = db.collection(LEDGER_COLLECTION).doc();

    const appsQuery = db.collection(APPLICATIONS_COLLECTION)
        .where('candidate_id', '==', uid)
        .limit(2);

    try {
        await db.runTransaction(async (transaction) => {
            // 1. Read User Data (Transactional)
            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists) return;

            const userData = userSnap.data();

            // 2. Check Eligibility (Transactional)
            if (userData.referralRewarded || !userData.referredBy) return;

            // check verification
            if (!userData.phoneVerified || !userData.linkedinVerified) return;

            const appsSnap = await transaction.get(appsQuery);

            if (appsSnap.size !== 1) return;

            const referrerUid = userData.referredBy;
            const referrerRef = db.collection(USERS_COLLECTION).doc(referrerUid);
            const referrerSnap = await transaction.get(referrerRef);

            if (!referrerSnap.exists) return;

            // 4. Perform Updates (Transactional)

            // Mark user as rewarded
            transaction.update(userRef, {
                referralRewarded: true,
                rewardedAt: FieldValue.serverTimestamp()
            });

            // Reward referrer
            transaction.update(referrerRef, {
                browniePoints: FieldValue.increment(50),
                updated_at: FieldValue.serverTimestamp()
            });

            // Create ledger entry
            transaction.set(ledgerRef, {
                uid: referrerUid,
                amount: 50,
                type: 'referral_bonus',
                metadata: { referredUid: uid },
                timestamp: FieldValue.serverTimestamp()
            });
        });

        console.info(`[Referral] Successfully processed reward for ${uid}`);
    } catch (error) {
        console.error(`[Referral Error] Transaction failed for ${uid}:`, error);
    }
};

