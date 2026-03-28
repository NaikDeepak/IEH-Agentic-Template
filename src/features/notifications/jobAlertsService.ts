import {
    collection, addDoc, getDocs, query, where, deleteDoc,
    doc, updateDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Timestamp } from 'firebase/firestore';

export interface JobAlert {
    id: string;
    seekerId: string;
    keywords: string;
    location: string;
    jobType: string;
    active: boolean;
    createdAt: Timestamp;
}

const COL = 'jobAlerts';

export const JobAlertsService = {
    async getAlerts(seekerId: string): Promise<JobAlert[]> {
        const snap = await getDocs(
            query(collection(db, COL), where('seekerId', '==', seekerId), orderBy('createdAt', 'desc'))
        );
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as JobAlert));
    },

    async createAlert(
        seekerId: string,
        keywords: string,
        location: string,
        jobType: string
    ): Promise<string> {
        const ref = await addDoc(collection(db, COL), {
            seekerId,
            keywords: keywords.trim(),
            location: location.trim(),
            jobType,
            active: true,
            createdAt: serverTimestamp(),
        });
        return ref.id;
    },

    async toggleAlert(alertId: string, active: boolean): Promise<void> {
        await updateDoc(doc(db, COL, alertId), { active });
    },

    async deleteAlert(alertId: string): Promise<void> {
        await deleteDoc(doc(db, COL, alertId));
    },
};
