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

        // Generate a unique code
        let code = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
          code = generateReferralCode();
          const codeRef = doc(db, REFERRAL_CODES_COLLECTION, code);
          const codeSnap = await getDoc(codeRef);

          if (!codeSnap.exists()) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          const error = new Error('Failed to generate a unique referral code. Please try again.');
          Sentry.captureException(error);
          throw error;
        }

        span.setAttribute('attempts', attempts);
        span.setAttribute('code_existed', false);

        // Save to user profile and reverse lookup collection (atomic)
        await runTransaction(db, (tx) => {
          tx.set(userRef, { referralCode: code }, { merge: true });
          tx.set(doc(db, REFERRAL_CODES_COLLECTION, code), { uid });
          return Promise.resolve();
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (sentryLogger) {
          sentryLogger.info(sentryLogger.fmt`Referral code generated for user ${uid} after ${attempts} attempts`);
        } else {
          // eslint-disable-next-line no-console
          console.info(`Referral code generated for user ${uid} after ${attempts} attempts`);
        }
        return code;
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

        const normalizedCode = code.toUpperCase().trim();
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

