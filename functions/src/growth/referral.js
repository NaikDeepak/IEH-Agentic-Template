
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
        console.log(`Successfully rewarded ${amount} points to ${uid} for ${type}`);
    } catch (error) {
        console.error(`Ledger transaction failed for ${uid}:`, error);
        throw error;
    }
};

export const checkAndRewardReferrer = async (uid) => {
    if (!uid) {
        console.log("No UID provided for referral check.");
        return;
    }

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

            if (!userSnap.exists) {
                // User might be deleted mid-process?
                return;
            }

            const userData = userSnap.data();

            // 2. Check Eligibility (Transactional)
            // If already rewarded, EXIT immediately.
            if (userData.referralRewarded) {
                // console.log(`User ${uid} already rewarded.`);
                return;
            }

            if (!userData.referredBy) {
                // No referrer
                return;
            }

            // check verification
            if (!userData.phoneVerified || !userData.linkedinVerified) {
                // Not verified yet
                return;
            }

            // 3. Check Application Count (Non-Transactional Query, but okay because referralRewarded is the gatekeeper)
            // We do this inside the transaction block just to be safe, though queries are not technically part of the lock unless we read specific docs.
            // However, the *decision* to write to userRef depends on this.
            // Since `referralRewarded` is false, this is the first time we are attempting to reward.
            // We just need to verify THIS is the first application.
            // Note: `appsQuery` assumes Firestore consistency.
            const appsSnap = await transaction.get(appsQuery);

            // Note: transaction.get(query) is supported in some SDKs, but strictly speaking "transactional queries" are tricky.
            // But since we are only worried about "is this the first app?", and we lock on `userRef`, 
            // no other process can modify `userRef.referralRewarded` concurrently.
            // So if multiple triggers fire for different apps, they will serialize on `userRef`.
            // The first one to grab the lock sees `referralRewarded = false`.
            // It checks apps. If it sees 1 (itself), it rewards.
            // The second one waits. When it grabs the lock, it sees `referralRewarded = true` (set by first).
            // So it returns.
            // Race condition SOLVED by locking `userRef`.

            if (appsSnap.size !== 1) {
                // Either 0 (impossible if triggered by create) or > 1 (already applied before)
                return;
            }

            const referrerUid = userData.referredBy;
            const referrerRef = db.collection(USERS_COLLECTION).doc(referrerUid);
            const referrerSnap = await transaction.get(referrerRef);

            if (!referrerSnap.exists) {
                // Referrer doesn't exist
                return;
            }

            const referrerData = referrerSnap.data();
            const currentPoints = (referrerData.browniePoints || 0);

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

        console.log(`Referral check completed for ${uid}`);
    } catch (error) {
        console.error(`Referral transaction failed for ${uid}:`, error);
    }
};

