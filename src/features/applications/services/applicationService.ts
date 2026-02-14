import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import type { Application, ApplicationStatus, SubmitApplicationInput } from "../types";
import { limit } from "firebase/firestore";
import { ReferralService } from "../../growth/services/referralService";

const APPLICATIONS_COLLECTION = "applications";

export const ApplicationService = {
  async getApplicationsForJob(jobId: string): Promise<Application[]> {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("job_id", "==", jobId),
      orderBy("applied_at", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Application));
  },

  async hasApplied(jobId: string, candidateId: string): Promise<boolean> {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("job_id", "==", jobId),
      where("candidate_id", "==", candidateId),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  },

  async updateApplicationStatus(appId: string, newStatus: ApplicationStatus): Promise<void> {
    try {
      const docRef = doc(db, APPLICATIONS_COLLECTION, appId);
      await updateDoc(docRef, {
        status: newStatus,
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error(`[ApplicationService] Firestore update FAILED for appId=${appId}:`, error);
      throw error;
    }
  },

  async submitApplication(data: SubmitApplicationInput): Promise<string> {
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...data,
      status: "applied",
      applied_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Check for referral rewards
    if (data.candidate_id) {
      void ReferralService.checkAndRewardReferrer(data.candidate_id);
    }

    return docRef.id;
  },
};
