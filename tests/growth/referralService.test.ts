import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferralService } from '../../src/features/growth/services/referralService';
import { getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

vi.mock('../../src/lib/utils/codes', () => ({
    generateReferralCode: vi.fn().mockReturnValue('IEH-123456')
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    getFirestore: vi.fn(() => ({}))
}));

describe('ReferralService', () => {
    const uid = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ensureReferralCode', () => {
        it('should return existing code if present', async () => {
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ referralCode: 'EXISTING-123' })
            });

            const code = await ReferralService.ensureReferralCode(uid);

            expect(code).toBe('EXISTING-123');
            expect(updateDoc).not.toHaveBeenCalled();
        });

        it('should generate and save new code if missing', async () => {
            // 1st getDoc (user profile) -> no code
            (getDoc as any).mockResolvedValueOnce({ exists: () => true, data: () => ({}) });
            // 2nd getDoc (check if generated code is unique) -> doesn't exist
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });

            const code = await ReferralService.ensureReferralCode(uid);

            expect(code).toBe('IEH-123456');
            expect(updateDoc).toHaveBeenCalled();
            expect(setDoc).toHaveBeenCalled();
        });

        it('should throw error if fails to generate unique code after 5 attempts', async () => {
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                data: () => ({})
            }); // Always exists for both user and code lookup

            await expect(ReferralService.ensureReferralCode(uid)).rejects.toThrow('Failed to generate a unique referral code');
        });
    });

    describe('getUserByReferralCode', () => {
        it('should resolve code to uid', async () => {
            const code = 'MY-CODE';
            (getDoc as any).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ uid: 'referred-user-id' })
            });

            const resolvedUid = await ReferralService.getUserByReferralCode(code);

            expect(resolvedUid).toBe('referred-user-id');
        });

        it('should return null if code not found', async () => {
            (getDoc as any).mockResolvedValueOnce({ exists: () => false });

            const result = await ReferralService.getUserByReferralCode('INVALID');

            expect(result).toBeNull();
        });
    });
});
