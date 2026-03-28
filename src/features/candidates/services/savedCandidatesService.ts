import { db } from '../../../lib/firebase';
import {
    doc, setDoc, deleteDoc, getDoc,
    collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';
import type { CandidateSearchResult } from '../../../lib/ai/search';

const COLLECTION = 'savedCandidates';

function docId(employerId: string, candidateId: string): string {
    return `${employerId}_${candidateId}`;
}

export const SavedCandidatesService = {
    async save(employerId: string, candidate: CandidateSearchResult): Promise<void> {
        const ref = doc(db, COLLECTION, docId(employerId, candidate.id));
        await setDoc(ref, {
            employerId,
            candidateId: candidate.id,
            savedAt: serverTimestamp(),
            snapshot: candidate,
        });
    },

    async unsave(employerId: string, candidateId: string): Promise<void> {
        const ref = doc(db, COLLECTION, docId(employerId, candidateId));
        await deleteDoc(ref);
    },

    async isSaved(employerId: string, candidateId: string): Promise<boolean> {
        const ref = doc(db, COLLECTION, docId(employerId, candidateId));
        const snap = await getDoc(ref);
        return snap.exists();
    },

    async getSavedByEmployer(employerId: string): Promise<CandidateSearchResult[]> {
        const q = query(collection(db, COLLECTION), where('employerId', '==', employerId));
        const snap = await getDocs(q);
        return snap.docs.map(d => (d.data() as { snapshot: CandidateSearchResult }).snapshot);
    },
};
