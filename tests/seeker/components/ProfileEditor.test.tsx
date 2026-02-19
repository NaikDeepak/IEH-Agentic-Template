import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileEditor } from '../../../src/features/seeker/components/Profile/ProfileEditor';
import { useAuth } from '../../../src/hooks/useAuth';
import { ProfileService } from '../../../src/features/seeker/services/profileService';
import { getLatestResume } from '../../../src/features/seeker/services/resumeService';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
vi.mock('../../../src/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn(),
        upsertProfile: vi.fn()
    }
}));

vi.mock('../../../src/features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('ProfileEditor', () => {
    const mockUser = { uid: 'user123' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (ProfileService.getProfile as any).mockResolvedValue(null);
        (getLatestResume as any).mockResolvedValue(null);
    });

    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );
        expect(screen.getByText(/Loading Profile/i)).toBeDefined();
    });

    it('pre-populates from resume if profile is missing', async () => {
        (getLatestResume as any).mockResolvedValueOnce({
            parsed_data: { experience: [{ role: 'Developer' }] },
            keywords: { found: ['React', 'Node'] }
        });

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Developer')).toBeDefined();
            expect(screen.getByText('React')).toBeDefined();
            expect(screen.getByText('Node')).toBeDefined();
        });
    });

    it('handles adding and removing skills', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce({
            skills: ['React'],
            preferences: { roles: [], locations: [], remote: false }
        });

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        const input = await screen.findByPlaceholderText(/Add a skill/i);
        fireEvent.change(input, { target: { value: 'TypeScript' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(screen.getByText(/TypeScript/i)).toBeInTheDocument();

        // More robust button finding
        const skillSpans = screen.getAllByText(/TypeScript/i);
        const targetSpan = skillSpans.find(s => s.tagName.toLowerCase() === 'span') || skillSpans[0].closest('span');
        const trashButton = targetSpan?.querySelector('button');

        if (trashButton) {
            fireEvent.click(trashButton);
        }

        await waitFor(() => {
            expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('handles profile save', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce({
            headline: 'Dev',
            skills: [],
            preferences: { roles: [], locations: [], remote: false }
        });
        (ProfileService.upsertProfile as any).mockResolvedValueOnce({});

        render(
            <MemoryRouter>
                <ProfileEditor />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByDisplayValue('Dev'));

        const saveButton = screen.getByRole('button', { name: /Update Professional Profile/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(ProfileService.upsertProfile).toHaveBeenCalled();
            expect(screen.getByText(/Profile updated successfully/i)).toBeDefined();
        });
    });
});
