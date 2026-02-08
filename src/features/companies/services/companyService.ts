import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import type { Company } from "../types";

const COMPANIES_COLLECTION = "companies";

export const CompanyService = {
  async getCompanyById(id: string): Promise<Company | null> {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Company;
  },

  async getCompanyByEmployerId(uid: string): Promise<Company | null> {
    const q = query(
      collection(db, COMPANIES_COLLECTION),
      where("employer_ids", "array-contains", uid)
    );
    const snap = await getDocs(q);
    const companyDoc = snap.docs[0];
    if (!companyDoc) return null;
    return { id: companyDoc.id, ...companyDoc.data() } as Company;
  },

  async createCompany(data: Omit<Company, "id" | "created_at" | "updated_at">): Promise<string> {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<void> {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  },
};
