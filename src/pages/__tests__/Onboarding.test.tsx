import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Onboarding } from '../Onboarding';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('Onboarding — seeker', () => {
    const completeOnboardingMock = vi.fn();

    const seekerAuth = {
        user: { displayName: 'Jane Doe' },
        userData: { role: 'seeker' },
        completeOnboarding: completeOnboardingMock,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue(seekerAuth);
    });

    const renderPage = () => render(<MemoryRouter><Onboarding /></MemoryRouter>);

    it('shows welcome step for seeker', () => {
        renderPage();
        expect(screen.getByText(/welcome, jane/i)).toBeInTheDocument();
        expect(screen.getByText(/get started/i)).toBeInTheDocument();
    });

    it('advances to CV step on Get Started click', () => {
        renderPage();
        fireEvent.click(screen.getByText(/get started/i));
        expect(screen.getByText(/add your cv/i)).toBeInTheDocument();
    });

    it('advances to target-role step on "I\'ll add it later"', () => {
        renderPage();
        fireEvent.click(screen.getByText(/get started/i));
        fireEvent.click(screen.getByText(/i'll add it later/i));
        expect(screen.getByText(/what's your target role/i)).toBeInTheDocument();
    });

    it('calls completeOnboarding with target role and navigates to seeker dashboard', async () => {
        completeOnboardingMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByText(/get started/i));
        fireEvent.click(screen.getByText(/i'll add it later/i));

        const input = screen.getByPlaceholderText(/senior frontend engineer/i);
        fireEvent.change(input, { target: { value: 'Product Manager' } });

        fireEvent.click(screen.getByText(/save & go to dashboard/i));

        await waitFor(() => {
            expect(completeOnboardingMock).toHaveBeenCalledWith({ target_role: 'Product Manager' });
            expect(mockNavigate).toHaveBeenCalledWith('/seeker/dashboard');
        });
    });

    it('calls completeOnboarding with no extra data when skipping target role', async () => {
        completeOnboardingMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByText(/get started/i));
        fireEvent.click(screen.getByText(/i'll add it later/i));

        fireEvent.click(screen.getByText(/skip & go to dashboard/i));

        await waitFor(() => {
            expect(completeOnboardingMock).toHaveBeenCalledWith({});
        });
    });
});

describe('Onboarding — employer', () => {
    const completeOnboardingMock = vi.fn();

    const employerAuth = {
        user: { displayName: 'Bob Smith' },
        userData: { role: 'employer' },
        completeOnboarding: completeOnboardingMock,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue(employerAuth);
    });

    const renderPage = () => render(<MemoryRouter><Onboarding /></MemoryRouter>);

    it('shows employer welcome step', () => {
        renderPage();
        expect(screen.getByText(/welcome, bob/i)).toBeInTheDocument();
        expect(screen.getByText(/set up company/i)).toBeInTheDocument();
    });

    it('advances to company step', () => {
        renderPage();
        fireEvent.click(screen.getByText(/set up company/i));
        expect(screen.getByText(/your company/i)).toBeInTheDocument();
    });

    it('calls completeOnboarding with company name and navigates to employer jobs', async () => {
        completeOnboardingMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByText(/set up company/i));

        const input = screen.getByPlaceholderText(/company name/i);
        fireEvent.change(input, { target: { value: 'Acme Corp' } });

        fireEvent.click(screen.getByText(/save & go to dashboard/i));

        await waitFor(() => {
            expect(completeOnboardingMock).toHaveBeenCalledWith({ onboarding_company_name: 'Acme Corp' });
            expect(mockNavigate).toHaveBeenCalledWith('/employer/jobs');
        });
    });
});
