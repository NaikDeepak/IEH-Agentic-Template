import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GapAnalysis } from '../../../src/features/seeker/components/SkillGap/GapAnalysis';
import { useAuth } from '../../../src/hooks/useAuth';
import { analyzeSkillGap } from '../../../src/features/seeker/services/skillService';
import { ProfileService } from '../../../src/features/seeker/services/profileService';
import { getLatestResume } from '../../../src/features/seeker/services/resumeService';
import { getDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../../src/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/skillService', () => ({
    analyzeSkillGap: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn()
    }
}));

vi.mock('../../../src/features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    getDoc: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    arrayUnion: vi.fn(val => val)
}));

vi.mock('../../../src/lib/firebase', () => ({
    db: {}
}));

describe('GapAnalysis', () => {
    const mockUser = { uid: 'user123' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (ProfileService.getProfile as any).mockResolvedValue(null);
        (getLatestResume as any).mockResolvedValue(null);
        (getDoc as any).mockResolvedValue({ exists: () => false });
    });

    it('renders initial state and fetches user data', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce({
            skills: ['React'],
            preferences: { roles: ['Frontend Developer'] }
        });

        render(<GapAnalysis />);

        await waitFor(() => {
            expect(screen.getByDisplayValue(/FRONTEND DEVELOPER/i)).toBeDefined();
            expect(screen.getByText(/React/i)).toBeDefined();
        });
    });

    it('handles skill gap analysis trigger', async () => {
        (analyzeSkillGap as any).mockResolvedValueOnce({
            missing_skills: [
                { name: 'GraphQL', importance: 'high', description: 'Essential for APIs' }
            ],
            resources: [
                { title: 'GraphQL Docs', url: 'https://graphql.org', type: 'article', skill_name: 'GraphQL' }
            ]
        });

        render(<GapAnalysis />);

        const input = screen.getByLabelText(/Target Career Path/i);
        fireEvent.change(input, { target: { value: 'Architect' } });

        const analyzeButton = screen.getByRole('button', { name: /Calculate Delta/i });
        fireEvent.click(analyzeButton);

        expect(screen.getByText(/Analyzing/i)).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('GraphQL')).toBeDefined();
            expect(screen.getByText('GraphQL Docs')).toBeDefined();
        });
    });

    it('handles error during analysis', async () => {
        (analyzeSkillGap as any).mockRejectedValueOnce(new Error('API Error'));

        render(<GapAnalysis />);

        fireEvent.change(screen.getByLabelText(/Target Career Path/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Calculate Delta/i }));

        await waitFor(() => {
            const errorMsg = screen.getByText(/Failed to analyze skill gap/i);
            expect(errorMsg).toBeInTheDocument();
        }, { timeout: 4000 });
    });
});
