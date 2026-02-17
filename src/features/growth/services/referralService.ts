import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { generateReferralCode } from '../../../lib/utils/codes';

const USERS_COLLECTION = 'users';
const REFERRAL_CODES_COLLECTION = 'referralCodes';

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
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserReferralData;
      if (userData.referralCode) {
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
      throw new Error('Failed to generate a unique referral code. Please try again.');
    }

    // Save to user profile and reverse lookup collection
    await updateDoc(userRef, { referralCode: code });
    await setDoc(doc(db, REFERRAL_CODES_COLLECTION, code), { uid });

    return code;
  },

  /**
   * Resolves a referral code to a user ID.
   */
  async getUserByReferralCode(code: string): Promise<string | null> {
    if (!code) return null;

    // Normalize code (case-insensitive and handle IEH- prefix)
    const normalizedCode = code.toUpperCase().trim();

    const codeRef = doc(db, REFERRAL_CODES_COLLECTION, normalizedCode);
    const codeSnap = await getDoc(codeRef);

    if (codeSnap.exists()) {
      const data = codeSnap.data() as { uid: string };
      return data.uid;
    }

    return null;
  },


  /**
   * Checks if a user was referred and if this is their first application.
   * Logic moved to backend Cloud Function (onApplicationCreate) for security.
   */
  // checkAndRewardReferrer removed.

};
