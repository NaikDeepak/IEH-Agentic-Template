import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import type { Application } from "../../applications/types";

const APPLICATIONS_COLLECTION = "applications";

export const TrackerService = {
  /**
   * Get all applications for a specific seeker.
   */
  async getSeekerApplications(seekerId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, APPLICATIONS_COLLECTION),
        where("candidate_id", "==", seekerId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Application));
    } catch (error) {
      console.error("Error fetching seeker applications:", error);
      throw error;
    }
  },
};
