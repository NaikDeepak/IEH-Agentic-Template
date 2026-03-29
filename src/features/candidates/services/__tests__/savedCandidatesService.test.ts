import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedCandidatesService } from '../savedCandidatesService';

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('../../../../lib/firebase', () => ({
    db: {},
}));

import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';

const mockCandidate = {
    id: 'cand-1',
    uid: 'cand-1',
    displayName: 'John Doe',
    skills: ['React'],
    matchScore: 80,
};

describe('SavedCandidatesService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (doc as any).mockReturnValue('mock-doc-ref');
        (collection as any).mockReturnValue('mock-collection');
        (query as any).mockReturnValue('mock-query');
        (where as any).mockReturnValue('mock-where');
    });

    describe('save', () => {
        it('calls setDoc with correct data', async () => {
            (setDoc as any).mockResolvedValue(undefined);
            await SavedCandidatesService.save('emp-1', mockCandidate as any);
            expect(doc).toHaveBeenCalledWith({}, 'savedCandidates', 'emp-1_cand-1');
            expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', expect.objectContaining({
                employerId: 'emp-1',
                candidateId: 'cand-1',
                snapshot: mockCandidate,
            }));
        });

        it('throws if candidate has no id', async () => {
            await expect(
                SavedCandidatesService.save('emp-1', { ...mockCandidate, id: undefined } as any)
            ).rejects.toThrow('Candidate ID is required');
        });
    });

    describe('unsave', () => {
        it('calls deleteDoc with correct ref', async () => {
            (deleteDoc as any).mockResolvedValue(undefined);
            await SavedCandidatesService.unsave('emp-1', 'cand-1');
            expect(doc).toHaveBeenCalledWith({}, 'savedCandidates', 'emp-1_cand-1');
            expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
        });
    });

    describe('isSaved', () => {
        it('returns true when document exists', async () => {
            (getDoc as any).mockResolvedValue({ exists: () => true });
            const result = await SavedCandidatesService.isSaved('emp-1', 'cand-1');
            expect(result).toBe(true);
        });

        it('returns false when document does not exist', async () => {
            (getDoc as any).mockResolvedValue({ exists: () => false });
            const result = await SavedCandidatesService.isSaved('emp-1', 'cand-1');
            expect(result).toBe(false);
        });
    });

    describe('getSavedByEmployer', () => {
        it('returns candidate snapshots', async () => {
            (getDocs as any).mockResolvedValue({
                docs: [
                    { data: () => ({ snapshot: mockCandidate }) },
                    { data: () => ({ snapshot: { id: 'cand-2', uid: 'cand-2', displayName: 'Jane' } }) },
                ],
            });
            const results = await SavedCandidatesService.getSavedByEmployer('emp-1');
            expect(results).toHaveLength(2);
            expect(results[0]).toEqual(mockCandidate);
        });

        it('skips malformed documents (missing snapshot field)', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            (getDocs as any).mockResolvedValue({
                docs: [
                    { data: () => ({ employerId: 'emp-1' }) }, // no snapshot
                    { data: () => ({ snapshot: mockCandidate }) },
                ],
            });
            const results = await SavedCandidatesService.getSavedByEmployer('emp-1');
            expect(results).toHaveLength(1);
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it('skips documents where snapshot is not an object', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            (getDocs as any).mockResolvedValue({
                docs: [
                    { data: () => ({ snapshot: null }) },
                    { data: () => ({ snapshot: 'string-value' }) },
                ],
            });
            const results = await SavedCandidatesService.getSavedByEmployer('emp-1');
            expect(results).toHaveLength(0);
            warnSpy.mockRestore();
        });
    });
});
