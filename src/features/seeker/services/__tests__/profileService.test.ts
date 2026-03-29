import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '../profileService';
import { db } from '../../../../lib/firebase';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';

vi.mock('../../../../lib/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(() => ({ id: 'mock-doc' })),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

describe('ProfileService', () => {
    const mockUserId = 'user-123';
    const mockProfile = {
        displayName: 'John Doe',
        headline: 'Developer',
        bio: 'Hello world',
        skills: ['React'],
        preferences: { roles: ['Frontend'], locations: [], remote: true },
        parsed_data: { experience: [], education: [] }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('gets profile successfully', async () => {
        (getDoc as any).mockResolvedValue({
            exists: () => true,
            data: () => mockProfile
        });

        const profile = await ProfileService.getProfile(mockUserId);
        expect(profile?.displayName).toBe('John Doe');
        expect(profile?.uid).toBe(mockUserId);
    });

    it('returns null if profile does not exist', async () => {
        (getDoc as any).mockResolvedValue({
            exists: () => false
        });

        const profile = await ProfileService.getProfile(mockUserId);
        expect(profile).toBeNull();
    });

    it('upserts profile correctly', async () => {
        await ProfileService.upsertProfile(mockUserId, { headline: 'New Headline' });
        expect(setDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ headline: 'New Headline', updated_at: 'mock-timestamp' }),
            { merge: true }
        );
    });

    it('updates profile field correctly', async () => {
        await ProfileService.updateProfileField(mockUserId, 'preferences.roles', ['Backend']);
        expect(updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ 'preferences.roles': ['Backend'], updated_at: 'mock-timestamp' })
        );
    });

    it('syncs profile from resume correctly', async () => {
        const mockResume = {
            parsed_data: {
                experience: [{ role: 'Senior Dev', description: ['Built things.', 'Managed team.'] }]
            },
            keywords: { found: ['Node.js', 'React'] }
        };

        await ProfileService.syncFromResume(mockUserId, mockResume as any);
        
        expect(setDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                headline: 'Senior Dev',
                bio: 'Built things. Managed team.',
                skills: ['Node.js', 'React'],
                preferences: expect.objectContaining({ roles: ['Senior Dev'] })
            }),
            { merge: true }
        );
    });

    it('handles sync error safely', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (setDoc as any).mockRejectedValue(new Error('Firestore error'));

        const invalidResume = { parsed_data: { experience: [] }, keywords: { found: [] } };
        await expect(ProfileService.syncFromResume(mockUserId, invalidResume as any)).rejects.toThrow('Firestore error');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
