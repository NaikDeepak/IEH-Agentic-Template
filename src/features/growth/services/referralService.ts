import { doc, getDoc, runTransaction } from 'firebase/firestore';
import * as Sentry from '@sentry/react';
import { db } from '../../../lib/firebase';
import { generateReferralCode } from '../../../lib/utils/codes';

const USERS_COLLECTION = 'users';
const REFERRAL_CODES_COLLECTION = 'referralCodes';

const sentryLogger = Sentry.logger;

interface UserReferralData {
  referralCode?: string;
  referredBy?: string;
  referralRewarded?: boolean;
  phoneVerified?: boolean;
  linkedinVerified?: boolean;
}

export const ReferralService = {
  /**
   * Ensures a user has a referral code. Generates and saves one if missing.
   */
  async ensureReferralCode(uid: string): Promise<string> {
    return Sentry.startSpan(
      { op: 'referral.ensure-code', name: 'Ensure Referral Code' },
      async (span) => {
        span.setAttribute('uid', uid);

        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserReferralData;
          if (userData.referralCode) {
            span.setAttribute('code_existed', true);
            return userData.referralCode;
          }
        }

        // Generate a unique code and atomically write it inside a transaction.
        // The uniqueness check is done via transaction.get() to prevent race conditions
        // where two concurrent calls could generate the same code.
        let finalCode = '';
        let attempts = 0;

        while (!finalCode && attempts < 5) {
          // displayCode: shown to the user (e.g. "IEH-ABC123")
          // normalizedCode: used as the Firestore document ID (e.g. "ABC123")
          // This ensures getUserByReferralCode (which strips the prefix) finds the right doc.
          const displayCode = generateReferralCode().toUpperCase();
          const normalizedCode = displayCode.startsWith('IEH-') ? displayCode.slice(4) : displayCode;
          const codeRef = doc(db, REFERRAL_CODES_COLLECTION, normalizedCode);

          try {
            await runTransaction(db, async (tx) => {
              const codeSnap = await tx.get(codeRef);
              if (codeSnap.exists()) {
                // Code already taken — abort this transaction and retry
                throw new Error('COLLISION');
              }
              // Store the full display code on the user profile for UI display
              tx.set(userRef, { referralCode: displayCode }, { merge: true });
              // Store the normalized code as the document ID for fast lookup
              tx.set(codeRef, { uid });
            });
            finalCode = displayCode;
          } catch (err: unknown) {
            const e = err as { message?: string };
            if (e.message !== 'COLLISION') {
              // Unexpected error — re-throw
              throw err;
            }
          }
          attempts++;
        }

        if (!finalCode) {
          const error = new Error('Failed to generate a unique referral code. Please try again.');
          Sentry.captureException(error);
          throw error;
        }

        span.setAttribute('attempts', attempts);
        span.setAttribute('code_existed', false);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (sentryLogger) {
          sentryLogger.info(sentryLogger.fmt`Referral code generated for user ${uid} after ${attempts} attempts`);
        } else {
          // eslint-disable-next-line no-console
          console.info(`Referral code generated for user ${uid} after ${attempts} attempts`);
        }
        return finalCode;
      }
    );
  },

  /**
   * Resolves a referral code to a user ID.
   */
  async getUserByReferralCode(code: string): Promise<string | null> {
    return Sentry.startSpan(
      { op: 'referral.resolve-code', name: 'Resolve Referral Code' },
      async (span) => {
        if (!code) return null;

        // Normalize: uppercase, trim whitespace.
        // Strip the 'IEH-' prefix if the user included it — codes are stored without it.
        let normalizedCode = code.toUpperCase().trim();
        if (normalizedCode.startsWith('IEH-')) {
          normalizedCode = normalizedCode.slice(4);
        }
        span.setAttribute('code', normalizedCode);

        const codeRef = doc(db, REFERRAL_CODES_COLLECTION, normalizedCode);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists()) {
          const data = codeSnap.data() as { uid: string };
          span.setAttribute('resolved', true);
          return data.uid;
        }

        span.setAttribute('resolved', false);
        return null;
      }
    );
  },


  /**
   * Checks if a user was referred and if this is their first application.
   * Logic moved to backend Cloud Function (onApplicationCreate) for security.
   */
  // checkAndRewardReferrer removed.

};

