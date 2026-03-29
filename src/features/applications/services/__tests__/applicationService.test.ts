import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from '../applicationService';
import { db } from '../../../../lib/firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit, 
    serverTimestamp 
} from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    orderBy: vi.fn(),
    limit: vi.fn()
}));

vi.mock('../../../../lib/firebase', () => ({
    db: {}
}));

describe('ApplicationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getApplicationsForJob fetches and maps applications', async () => {
        const mockDocs = [
            { id: 'app1', data: () => ({ job_id: 'job123', status: 'applied' }) },
            { id: 'app2', data: () => ({ job_id: 'job123', status: 'interview' }) }
        ];
        (getDocs as any).mockResolvedValue({ docs: mockDocs });

        const apps = await ApplicationService.getApplicationsForJob('job123');

        expect(apps).toHaveLength(2);
        expect(apps[0]).toEqual({ id: 'app1', job_id: 'job123', status: 'applied' });
        expect(query).toHaveBeenCalled();
        expect(where).toHaveBeenCalledWith('job_id', '==', 'job123');
    });

    it('hasApplied returns true if application exists', async () => {
        (getDocs as any).mockResolvedValue({ empty: false });

        const result = await ApplicationService.hasApplied('job123', 'user456');

        expect(result).toBe(true);
        expect(limit).toHaveBeenCalledWith(1);
    });

    it('updateApplicationStatus updates status and timestamp', async () => {
        const mockDocRef = {};
        (doc as any).mockReturnValue(mockDocRef);

        await ApplicationService.updateApplicationStatus('app123', 'interviewing');

        expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
            status: 'interviewing',
            updated_at: 'mock-timestamp'
        });
    });

    it('updateApplicationNotes updates notes and reminder', async () => {
        const mockDocRef = {};
        (doc as any).mockReturnValue(mockDocRef);

        await ApplicationService.updateApplicationNotes('app123', 'Some notes', '2024-12-31');

        expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
            notes: 'Some notes',
            reminder_date: '2024-12-31',
            updated_at: 'mock-timestamp'
        });
    });

    it('submitApplication creates a new application', async () => {
        (addDoc as any).mockResolvedValue({ id: 'new-app-id' });

        const input = {
            job_id: 'job123',
            candidate_id: 'user456',
            candidate_name: 'John Doe'
        };

        const appId = await ApplicationService.submitApplication(input as any);

        expect(appId).toBe('new-app-id');
        expect(addDoc).toHaveBeenCalledWith(undefined, {
            ...input,
            status: 'applied',
            applied_at: 'mock-timestamp',
            updated_at: 'mock-timestamp'
        });
    });
});
