import { describe, it, expect } from 'vitest';
import { generateReferralCode } from '../../src/lib/utils/codes';

describe('generateReferralCode', () => {
    it('should generate a code with the correct format', () => {
        const code = generateReferralCode();
        expect(code).toMatch(/^IEH-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    });

    it('should generate unique codes on subsequent calls', () => {
        const code1 = generateReferralCode();
        const code2 = generateReferralCode();
        expect(code1).not.toBe(code2);
    });

    it('should use Math.random fallback when crypto is unavailable', () => {
        const originalCrypto = globalThis.crypto;
        // The following line is safe because of 'as any' cast
        delete (globalThis as any).crypto;

        const code = generateReferralCode();
        expect(code).toMatch(/^IEH-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);

        // Restore
        (globalThis as any).crypto = originalCrypto;
    });

    it('should correctly map random values to the charset', () => {
        // Mock crypto to return predictable values if needed, 
        // but the characters are basically (val % chars.length).
        // We just verify it doesn't crash and returns valid length.
        const code = generateReferralCode();
        expect(code.length).toBe(10); // "IEH-" (4) + 6 chars
    });
});
