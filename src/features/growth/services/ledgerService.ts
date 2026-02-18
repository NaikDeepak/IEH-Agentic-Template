import {
    doc,
    runTransaction,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import * as Sentry from '@sentry/react';
import { db } from '../../../lib/firebase';

const USERS_COLLECTION = 'users';
const LEDGER_COLLECTION = 'ledger';

const { logger } = Sentry;

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
        return Sentry.startSpan(
            { op: 'ledger.adjust-points', name: 'Adjust Brownie Points' },
            async (span) => {
                span.setAttribute('uid', uid);
                span.setAttribute('amount', amount);
                span.setAttribute('type', type);

                const userRef = doc(db, USERS_COLLECTION, uid);
                const ledgerRef = doc(collection(db, LEDGER_COLLECTION));

                try {
                    await runTransaction(db, async (transaction) => {
                        const userSnap = await transaction.get(userRef);

                        if (!userSnap.exists()) {
                            throw new Error('User does not exist');
                        }

                        const userData = userSnap.data();
                        const rawPoints: unknown = userData['browniePoints'];
                        const currentPoints = typeof rawPoints === 'number' && Number.isFinite(rawPoints) ? rawPoints : 0;
                        const newPoints = currentPoints + amount;

                        if (newPoints < 0) {
                            throw new Error('Insufficient points for this transaction');
                        }

                        // Update user points
                        transaction.update(userRef, {
                            browniePoints: newPoints,
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

                    span.setAttribute('success', true);
                    logger.info(logger.fmt`Ledger: ${type} ${amount} points for user ${uid}`);
                } catch (error) {
                    span.setAttribute('success', false);
                    Sentry.captureException(error);
                    logger.error(logger.fmt`Ledger transaction failed for user ${uid}: ${type}`);
                    throw error;
                }
            }
        );
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

