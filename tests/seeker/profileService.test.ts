import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '../../src/features/seeker/services/profileService';
import { getDoc, setDoc, doc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    getFirestore: vi.fn(() => ({}))
}));

describe('ProfileService', () => {
    const userId = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProfile', () => {
        it('should return profile data if exists', async () => {
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                id: userId,
                data: () => ({ headline: 'Software Engineer', skills: ['React'] })
            });

            const result = await ProfileService.getProfile(userId);

            expect(result?.uid).toBe(userId);
            expect(result?.headline).toBe('Software Engineer');
        });

        it('should return null if profile doesn\'t exist', async () => {
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });

            const result = await ProfileService.getProfile(userId);

            expect(result).toBeNull();
        });
    });

    describe('upsertProfile', () => {
        it('should call setDoc with merge: true', async () => {
            const data = { headline: 'New Headline' };
            const mockDocRef = { id: userId };
            (doc as any).mockReturnValueOnce(mockDocRef);

            await ProfileService.upsertProfile(userId, data);

            expect(setDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
                headline: 'New Headline',
                updated_at: 'mock-timestamp'
            }), { merge: true });
        });
    });

    describe('syncFromResume', () => {
        it('should map resume data to profile and upsert', async () => {
            const resume: any = {
                keywords: { found: ['React', 'Node.js'] },
                parsed_data: {
                    name: 'John Doe',
                    experience: [
                        { role: 'Senior Dev', company: 'Tech', description: ['Line 1', 'Line 2'] }
                    ]
                }
            };

            const upsertSpy = vi.spyOn(ProfileService, 'upsertProfile').mockResolvedValueOnce(undefined);

            await ProfileService.syncFromResume(userId, resume);

            expect(upsertSpy).toHaveBeenCalledWith(userId, expect.objectContaining({
                headline: 'Senior Dev',
                skills: ['React', 'Node.js'],
                bio: 'Line 1 Line 2'
            }));
        });
    });
});
