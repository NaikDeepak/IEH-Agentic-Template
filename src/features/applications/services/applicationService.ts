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
import { Application, ApplicationStatus, SubmitApplicationInput } from "../types";

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

  async updateApplicationStatus(appId: string, newStatus: ApplicationStatus): Promise<void> {
    const docRef = doc(db, APPLICATIONS_COLLECTION, appId);
    await updateDoc(docRef, {
      status: newStatus,
      updated_at: serverTimestamp(),
    });
  },

  async submitApplication(data: SubmitApplicationInput): Promise<string> {
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...data,
      status: "applied",
      applied_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  },
};
