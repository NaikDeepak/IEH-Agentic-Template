import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ProfileEditor } from '../ProfileEditor';
import { useAuth } from '../../../../../hooks/useAuth';
import { ProfileService } from '../../../services/profileService';
import { getLatestResume } from '../../../services/resumeService';

// Mock hooks and services
vi.mock('../../../../../hooks/useAuth');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});
vi.mock('../../../services/profileService');
vi.mock('../../../services/resumeService');

describe('ProfileEditor', () => {
    const mockNavigate = vi.fn();
    const mockUser = { uid: 'user-123', email: 'test@example.com' };
    const mockProfile = {
        uid: 'user-123',
        headline: 'Software Engineer',
        bio: 'Experienced developer',
        currentLocation: 'Mumbai',
        skills: ['React', 'Node.js'],
        work_preferences: ['Remote'],
        preferences: {
            roles: ['Frontend Developer'],
            locations: ['Mumbai'],
            remote: true,
        },
    };

    const mockResume = {
        parsed_data: {
            experience: [{ role: 'Senior React Dev' }],
        },
        keywords: {
            found: ['React', 'TypeScript', 'Next.js'],
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(ProfileService.getProfile).mockResolvedValue(mockProfile as any);
        vi.mocked(getLatestResume).mockResolvedValue(mockResume as any);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );
        expect(screen.getByText(/Loading your profile/i)).toBeInTheDocument();
    });

    it('loads and displays profile data', async () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Experienced developer')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Mumbai')).toBeInTheDocument();
        });

        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
    });

    it('pre-populates from resume if profile is missing', async () => {
        vi.mocked(ProfileService.getProfile).mockResolvedValue(null as any);

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Pre-populated from your latest resume/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('Senior React Dev')).toBeInTheDocument();
        });

        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Next.js')).toBeInTheDocument();
    });

    it('updates basic info fields', async () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Professional Headline/i), { target: { value: 'Staff Engineer' } });
        fireEvent.change(screen.getByLabelText(/Short Bio/i), { target: { value: 'New bio' } });

        expect(screen.getByDisplayValue('Staff Engineer')).toBeInTheDocument();
        expect(screen.getByDisplayValue('New bio')).toBeInTheDocument();
    });

    it('adds and removes skills', async () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument();
        });

        const skillInput = screen.getByPlaceholderText(/Add a skill/i);
        fireEvent.change(skillInput, { target: { value: 'GraphQL' } });
        fireEvent.click(screen.getByTestId('add-skill-button'));

        expect(screen.getByText('GraphQL')).toBeInTheDocument();

        // Remove skill
        const skillBubble = screen.getByText('React').closest('span');
        const removeBtn = skillBubble?.querySelector('button');
        if (removeBtn) fireEvent.click(removeBtn);
        
        await waitFor(() => {
            expect(screen.queryByText('React')).not.toBeInTheDocument();
        });
    });

    it('shows skill suggestions and handles selection', async () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument();
        });

        const skillInput = screen.getByPlaceholderText(/Add a skill/i);
        fireEvent.change(skillInput, { target: { value: 'Type' } });

        await waitFor(() => {
            expect(screen.getByText('TypeScript')).toBeInTheDocument();
        });

        fireEvent.mouseDown(screen.getByText('TypeScript'));
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('toggles work preferences', async () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Remote')).toBeInTheDocument();
        });

        const hybridCheckbox = screen.getByLabelText('Hybrid');
        fireEvent.click(hybridCheckbox);
        
        // Checkbox is hidden in SR-ONLY, but parent/div reflects state or checked prop
        expect(hybridCheckbox).toBeChecked();

        fireEvent.click(hybridCheckbox);
        expect(hybridCheckbox).not.toBeChecked();
    });

    it('handles save successfully', async () => {
        vi.mocked(ProfileService.upsertProfile).mockResolvedValue(undefined as any);

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Save Profile')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Save Profile'));
        });

        await waitFor(() => {
            expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/seeker/dashboard');
        }, { timeout: 5000 });
    });

    it('handles save error', async () => {
        vi.mocked(ProfileService.upsertProfile).mockRejectedValue(new Error('Save failed'));

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Save Profile')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Save Profile'));
        });

        await waitFor(() => {
            expect(screen.getByText(/Failed to save profile/i)).toBeInTheDocument();
        }, { timeout: 8000 });
    });

    it('calculates completeness score correctly', async () => {
        // Minimal profile
        vi.mocked(ProfileService.getProfile).mockResolvedValue({
            headline: 'Dev',
            bio: '',
            skills: [],
            preferences: { roles: [], locations: [], remote: false }
        } as any);

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Just started/i)).toBeInTheDocument();
        });

        // Add bio
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/Short Bio/i), { target: { value: 'A bio that is long enough' } });
        });
        
        // completeness score should update
        await waitFor(() => {
            expect(screen.getByText(/Getting there/i)).toBeInTheDocument();
        }, { timeout: 8000 });
    });
});
