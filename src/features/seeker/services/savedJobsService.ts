import { db } from '../../../lib/firebase';
import {
    doc, setDoc, deleteDoc, getDoc,
    collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';
import type { JobPosting } from '../../jobs/types';

const COLLECTION = 'savedJobs';

function docId(seekerId: string, jobId: string): string {
    return `${seekerId}_${jobId}`;
}

export const SavedJobsService = {
    async save(seekerId: string, job: JobPosting): Promise<void> {
        if (!job.id) throw new Error('Cannot save job without an id');
        const ref = doc(db, COLLECTION, docId(seekerId, job.id));
        await setDoc(ref, {
            seekerId,
            jobId: job.id,
            savedAt: serverTimestamp(),
            snapshot: job,
        });
    },

    async unsave(seekerId: string, jobId: string): Promise<void> {
        const ref = doc(db, COLLECTION, docId(seekerId, jobId));
        await deleteDoc(ref);
    },

    async isSaved(seekerId: string, jobId: string): Promise<boolean> {
        const ref = doc(db, COLLECTION, docId(seekerId, jobId));
        const snap = await getDoc(ref);
        return snap.exists();
    },

    async getSavedBySeeker(seekerId: string): Promise<JobPosting[]> {
        const q = query(collection(db, COLLECTION), where('seekerId', '==', seekerId));
        const snap = await getDocs(q);
        return snap.docs.map(d => {
            const data = d.data() as { snapshot: JobPosting; jobId: string };
            return { ...data.snapshot, id: data.jobId };
        });
    },

    async getSavedJobIds(seekerId: string): Promise<Set<string>> {
        const q = query(collection(db, COLLECTION), where('seekerId', '==', seekerId));
        const snap = await getDocs(q);
        return new Set(snap.docs.map(d => (d.data() as { jobId: string }).jobId));
    },
};
