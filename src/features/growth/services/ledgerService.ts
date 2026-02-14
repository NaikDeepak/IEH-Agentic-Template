import {
    doc,
    runTransaction,
    collection,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const USERS_COLLECTION = 'users';
const LEDGER_COLLECTION = 'ledger';

export type TransactionType = 'referral_bonus' | 'redemption' | 'manual_adjustment';

export interface LedgerEntry {
    uid: string;
    amount: number;
    type: TransactionType;
    metadata?: Record<string, unknown>;
    timestamp: unknown;
}

export const LedgerService = {
    /**
     * Atomically adds or subtracts brownie points for a user and creates a ledger entry.
     */
    async adjustPoints(
        uid: string,
        amount: number,
        type: TransactionType,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const ledgerRef = doc(collection(db, LEDGER_COLLECTION));

        try {
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);

                if (!userSnap.exists()) {
                    throw new Error('User does not exist');
                }

                const userData = userSnap.data();
                const currentPoints = (userData['browniePoints'] ?? 0) as number;
                const newPoints = currentPoints + amount;

                if (newPoints < 0) {
                    throw new Error('Insufficient points for this transaction');
                }

                // Update user points
                transaction.update(userRef, {
                    browniePoints: increment(amount),
                    updated_at: serverTimestamp()
                });

                // Create ledger entry
                transaction.set(ledgerRef, {
                    uid,
                    amount,
                    type,
                    metadata: metadata ?? {},
                    timestamp: serverTimestamp()
                });
            });
        } catch (error) {
            console.error('Ledger transaction failed:', error);
            throw error;
        }
    },

    /**
     * Helper to add referral bonus points
     */
    async addReferralBonus(referrerUid: string, referredUid: string): Promise<void> {
        return this.adjustPoints(
            referrerUid,
            50,
            'referral_bonus',
            { referredUid }
        );
    }
};
