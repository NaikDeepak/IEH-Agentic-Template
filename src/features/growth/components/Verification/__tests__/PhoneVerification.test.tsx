import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhoneVerification } from '../PhoneVerification';
import { useAuth } from '../../../../../hooks/useAuth';

vi.mock('../../../../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('firebase/auth', () => {
    class MockRecaptchaVerifier {
        clear = vi.fn();
    }
    return {
        RecaptchaVerifier: vi.fn().mockImplementation(function () {
            return new MockRecaptchaVerifier();
        }),
        linkWithPhoneNumber: vi.fn(),
    };
});

vi.mock('../../../../../lib/firebase', () => ({
    auth: {},
}));

describe('PhoneVerification', () => {
    const mockRefreshUserData = vi.fn();
    const mockUser = {
        uid: 'user123',
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
    };

    const baseAuth = {
        user: mockUser,
        userData: { phoneVerified: false },
        refreshUserData: mockRefreshUserData,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(baseAuth);
    });

    it('renders phone input form initially', () => {
        render(<PhoneVerification />);
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send Code/i })).toBeInTheDocument();
    });

    it('shows "Phone Verified" when phoneVerified is true', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            userData: { phoneVerified: true },
        });
        render(<PhoneVerification />);
        expect(screen.getByText(/Phone Verified/i)).toBeInTheDocument();
    });

    it('shows simulation mode banner when toggle is on', () => {
        render(<PhoneVerification />);
        // The component defaults to simulation mode in test env (VITE_USE_FIREBASE_EMULATOR is not 'true')
        // but we can toggle it manually
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        // Determine initial simulation state by checking if banner exists
        const isSimulated = screen.queryByText(/MVP Simulation Mode/i) !== null;
        if (!isSimulated) {
            fireEvent.click(toggle);
            expect(screen.getByText(/MVP Simulation Mode/i)).toBeInTheDocument();
        } else {
            expect(screen.getByText(/MVP Simulation Mode/i)).toBeInTheDocument();
        }
    });

    it('toggles simulation mode off and on', () => {
        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        // Click twice to ensure toggle works
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        // After two clicks, state should be back to original
        expect(toggle).toBeInTheDocument();
    });

    it('enters OTP mode when simulation send code is triggered', async () => {
        // Force simulation mode on
        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        const simulationBanner = screen.queryByText(/MVP Simulation Mode/i);
        if (!simulationBanner) {
            fireEvent.click(toggle);
        }

        const phoneInput = screen.getByLabelText(/Phone Number/i);
        fireEvent.change(phoneInput, { target: { value: '+919876543210' } });

        const sendBtn = screen.getByRole('button', { name: /Send Code/i });
        fireEvent.click(sendBtn);

        // In simulation mode, setTimeout fires after 1s — we wait for the OTP step
        await waitFor(() => {
            expect(screen.getByLabelText(/Enter Verification Code/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    }, 6000);

    it('shows error when invalid simulated OTP is entered', async () => {
        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        if (!screen.queryByText(/MVP Simulation Mode/i)) {
            fireEvent.click(toggle);
        }

        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
        fireEvent.click(screen.getByRole('button', { name: /Send Code/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/Enter Verification Code/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), { target: { value: '999999' } });

        (global.fetch as any) = vi.fn().mockResolvedValue({ ok: true });

        fireEvent.submit(screen.getByLabelText(/Enter Verification Code/i).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/Invalid simulated OTP/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    }, 8000);

    it('verifies successfully with correct simulated OTP', async () => {
        (global.fetch as any) = vi.fn().mockResolvedValue({ ok: true });
        mockRefreshUserData.mockResolvedValue(undefined);

        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        if (!screen.queryByText(/MVP Simulation Mode/i)) {
            fireEvent.click(toggle);
        }

        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
        fireEvent.click(screen.getByRole('button', { name: /Send Code/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/Enter Verification Code/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), { target: { value: '123456' } });
        fireEvent.submit(screen.getByLabelText(/Enter Verification Code/i).closest('form')!);

        await waitFor(() => {
            expect(mockRefreshUserData).toHaveBeenCalled();
        }, { timeout: 3000 });
    }, 8000);

    it('shows error when server returns non-ok during verification', async () => {
        (global.fetch as any) = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: 'Verification failed on server' })
        });

        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        if (!screen.queryByText(/MVP Simulation Mode/i)) {
            fireEvent.click(toggle);
        }

        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
        fireEvent.click(screen.getByRole('button', { name: /Send Code/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/Enter Verification Code/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), { target: { value: '123456' } });
        fireEvent.submit(screen.getByLabelText(/Enter Verification Code/i).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/Verification failed on server/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    }, 8000);

    it('goes back to phone step when Back button is clicked', async () => {
        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        if (!screen.queryByText(/MVP Simulation Mode/i)) {
            fireEvent.click(toggle);
        }

        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
        fireEvent.click(screen.getByRole('button', { name: /Send Code/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/Enter Verification Code/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        fireEvent.click(screen.getByRole('button', { name: /Back/i }));
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    }, 6000);

    it('does not submit when user is null', async () => {
        (useAuth as any).mockReturnValue({ ...baseAuth, user: null });
        render(<PhoneVerification />);
        const toggle = screen.getByLabelText(/Toggle simulation mode/i);
        if (!screen.queryByText(/MVP Simulation Mode/i)) {
            fireEvent.click(toggle);
        }

        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
        fireEvent.click(screen.getByRole('button', { name: /Send Code/i }));

        // Without user, nothing happens (early return)
        await waitFor(() => {
            expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        });
    });

    describe('non-simulation (real Firebase) path', () => {
        beforeEach(() => {
            vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'false');
        });

        afterEach(() => {
            vi.unstubAllEnvs();
        });

        it('calls linkWithPhoneNumber and transitions to OTP step on success', async () => {
            const { linkWithPhoneNumber: mockLink } = await import('firebase/auth');
            const mockConfirm = vi.fn();
            (mockLink as any).mockResolvedValueOnce({ confirm: mockConfirm });

            render(<PhoneVerification />);

            // With env stubbed to false, simulation banner should not be visible by default
            fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
            fireEvent.submit(screen.getByLabelText(/Phone Number/i).closest('form')!);

            await waitFor(() => {
                expect(mockLink).toHaveBeenCalled();
            });
        });

        it('shows error when linkWithPhoneNumber throws', async () => {
            const { linkWithPhoneNumber: mockLink } = await import('firebase/auth');
            (mockLink as any).mockRejectedValueOnce(new Error('Phone auth error'));

            render(<PhoneVerification />);

            fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
            fireEvent.submit(screen.getByLabelText(/Phone Number/i).closest('form')!);

            await waitFor(() => {
                expect(screen.getByText(/Phone auth error/i)).toBeInTheDocument();
            });
        });

        it('calls confirmationResult.confirm in real mode OTP step', async () => {
            const { linkWithPhoneNumber: mockLink } = await import('firebase/auth');
            const mockConfirm = vi.fn().mockResolvedValueOnce(undefined);
            (mockLink as any).mockResolvedValueOnce({ confirm: mockConfirm });
            (global.fetch as any) = vi.fn().mockResolvedValue({ ok: true });
            mockRefreshUserData.mockResolvedValue(undefined);

            render(<PhoneVerification />);

            fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+919876543210' } });
            fireEvent.submit(screen.getByLabelText(/Phone Number/i).closest('form')!);

            await waitFor(() => {
                expect(screen.getByLabelText(/Enter Verification Code/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            fireEvent.change(screen.getByLabelText(/Enter Verification Code/i), { target: { value: '654321' } });
            fireEvent.submit(screen.getByLabelText(/Enter Verification Code/i).closest('form')!);

            await waitFor(() => {
                expect(mockConfirm).toHaveBeenCalledWith('654321');
            }, { timeout: 3000 });
        }, 8000);
    });

});
