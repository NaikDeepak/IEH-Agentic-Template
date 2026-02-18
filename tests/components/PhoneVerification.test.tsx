import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhoneVerification } from '../../src/features/growth/components/Verification/PhoneVerification';
import { useAuth } from '../../src/hooks/useAuth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Phone: () => <div data-testid="phone-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
    Send: () => <div data-testid="send-icon" />
}));

// Mock useAuth
vi.mock('../../src/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({
        currentUser: { uid: 'user123' }
    })),
    connectAuthEmulator: vi.fn(),
    GoogleAuthProvider: class {
        setCustomParameters = vi.fn();
    },
    RecaptchaVerifier: vi.fn().mockImplementation(() => ({
        clear: vi.fn()
    })),
    linkWithPhoneNumber: vi.fn()
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    updateDoc: vi.fn(),
    connectFirestoreEmulator: vi.fn(),
    getFirestore: vi.fn(() => ({}))
}));

// Mock global fetch
global.fetch = vi.fn();

describe('PhoneVerification', () => {
    const mockUser = {
        uid: 'user123',
        getIdToken: vi.fn().mockResolvedValue('mock-token')
    };
    const mockRefresh = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            userData: { phoneVerified: false },
            refreshUserData: mockRefresh
        } as any);
    });

    it('should show phone input step initially', () => {
        render(<PhoneVerification />);
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
    });

    it('should show verified state when phoneVerified is true', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            userData: { phoneVerified: true },
            refreshUserData: mockRefresh
        } as any);
        render(<PhoneVerification />);
        expect(screen.getByText(/Phone Verified/i)).toBeInTheDocument();
    });

    it('should handle simulation mode for sending code', async () => {
        render(<PhoneVerification />);

        const input = screen.getByLabelText(/phone number/i);
        fireEvent.change(input, { target: { value: '+919999999999' } });

        const sendBtn = screen.getByRole('button', { name: /send code/i });
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should handle simulated verification success', async () => {
        render(<PhoneVerification />);

        // 1. Send Code (Simulation)
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+919999999999' } });
        fireEvent.click(screen.getByRole('button', { name: /send code/i }));

        await waitFor(() => screen.getByLabelText(/verification code/i), { timeout: 3000 });

        // 2. Verify Code (Simulation)
        fireEvent.change(screen.getByLabelText(/verification code/i), { target: { value: '123456' } });

        vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as any);

        fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

        await waitFor(() => {
            expect(mockRefresh).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('should show error for invalid simulated OTP', async () => {
        render(<PhoneVerification />);

        // Go to code step
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+919999999999' } });
        fireEvent.click(screen.getByRole('button', { name: /send code/i }));

        await waitFor(() => screen.getByLabelText(/verification code/i), { timeout: 3000 });

        // Enter wrong code
        fireEvent.change(screen.getByLabelText(/verification code/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid simulated OTP/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
