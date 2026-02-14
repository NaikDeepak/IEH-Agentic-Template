import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { generateReferralCode } from '../../../lib/utils/codes';
import { LedgerService } from './ledgerService';

const USERS_COLLECTION = 'users';
const REFERRAL_CODES_COLLECTION = 'referralCodes';
const APPLICATIONS_COLLECTION = 'applications';

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
   * If conditions met (Phone/LinkedIn verified), rewards the referrer.
   */
  async checkAndRewardReferrer(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data() as UserReferralData;
    
    // Basic check: has referrer and hasn't been rewarded yet
    if (!userData.referredBy || userData.referralRewarded) {
      return;
    }

    // Verification check: Referred user must be verified
    if (!userData.phoneVerified || !userData.linkedinVerified) {
      return;
    }

    // Count applications for this user
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('candidate_id', '==', uid),
      limit(2) // We only care if it's 1
    );
    const snap = await getDocs(q);

    if (snap.size === 1) {
      // It's the first application!
      try {
        await LedgerService.addReferralBonus(userData.referredBy, uid);
        
        // Mark as rewarded so we don't do it again
        await updateDoc(userRef, {
            referralRewarded: true,
            rewardedAt: new Date()
        });
      } catch (error) {
        console.error('Failed to award referral bonus:', error);
      }
    }
  }
};
