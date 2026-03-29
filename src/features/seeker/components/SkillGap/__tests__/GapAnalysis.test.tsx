import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GapAnalysis } from '../GapAnalysis';
import { useAuth } from '../../../../../hooks/useAuth';
import { analyzeSkillGap } from '../../../../../features/seeker/services/skillService';
import { ProfileService } from '../../../../../features/seeker/services/profileService';
import { getLatestResume } from '../../../../../features/seeker/services/resumeService';
import { getDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../../../../hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../../../features/seeker/services/skillService', () => ({
    analyzeSkillGap: vi.fn()
}));

vi.mock('../../../../../features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn(),
        updateProfileField: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('../../../../../features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    getDoc: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    arrayUnion: vi.fn(val => val),
    getFirestore: vi.fn(() => ({}))
}));

vi.mock('../../../../../lib/firebase', () => ({
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

        const input = screen.getByLabelText(/Target Role/i);
        fireEvent.change(input, { target: { value: 'Architect' } });

        const analyzeButton = screen.getByRole('button', { name: /Analyse Gap/i });
        fireEvent.click(analyzeButton);

        expect(screen.getByText(/Analysing/i)).toBeDefined();

        await waitFor(() => {
            expect(screen.getAllByText('GraphQL').length).toBeGreaterThan(0);
            expect(screen.getByText('GraphQL Docs')).toBeDefined();
        });
    });

    it('handles error during analysis', async () => {
        (analyzeSkillGap as any).mockRejectedValueOnce(new Error('API Error'));

        render(<GapAnalysis />);

        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Analyse Gap/i }));

        await waitFor(() => {
            const errorMsg = screen.getByText(/Failed to analyze skill gap/i);
            expect(errorMsg).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('shows skills list and "From resume" badge when dataSource is profile', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce({
            skills: ['React', 'TypeScript'],
            preferences: { roles: ['Frontend Developer'] }
        });

        render(<GapAnalysis />);

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument();
            expect(screen.getByText('TypeScript')).toBeInTheDocument();
            expect(screen.getByText(/From resume/i)).toBeInTheDocument();
        });
    });

    it('shows "+N more" when skills exceed 8', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce({
            skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'C#', 'SQL', 'GraphQL'],
            preferences: { roles: ['Lead Developer'] }
        });

        render(<GapAnalysis />);

        await waitFor(() => {
            expect(screen.getByText('+2 more')).toBeInTheDocument();
        });
    });

    it('falls back to users collection when profile has no skills', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce({
            skills: [],
            preferences: { roles: [] }
        });
        (getDoc as any).mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ skills: ['CSS', 'HTML'], preferences: { roles: ['Web Dev'] } })
        });

        render(<GapAnalysis />);

        await waitFor(() => {
            expect(screen.getByText('CSS')).toBeInTheDocument();
        });
    });

    it('saves a resource when save button is clicked', async () => {
        const { updateDoc } = await import('firebase/firestore');
        (analyzeSkillGap as any).mockResolvedValueOnce({
            missing_skills: [{ name: 'GraphQL', importance: 'medium', description: 'Useful' }],
            resources: [{ title: 'GraphQL Guide', url: 'https://graphql.org', type: 'article', skill_name: 'GraphQL' }]
        });
        (updateDoc as any).mockResolvedValue(undefined);

        render(<GapAnalysis />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Analyse Gap/i }));

        await waitFor(() => {
            expect(screen.getByTitle('Save resource')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('Save resource'));

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalled();
        });
    });

    it('shows importance colors: medium and low', async () => {
        (analyzeSkillGap as any).mockResolvedValueOnce({
            missing_skills: [
                { name: 'Skill A', importance: 'medium', description: 'medium skill' },
                { name: 'Skill B', importance: 'low', description: 'low skill' }
            ],
            resources: []
        });

        render(<GapAnalysis />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Analyse Gap/i }));

        await waitFor(() => {
            expect(screen.getByText('medium')).toBeInTheDocument();
            expect(screen.getByText('low')).toBeInTheDocument();
        });
    });

    it('shows video icon for video resource type', async () => {
        (analyzeSkillGap as any).mockResolvedValueOnce({
            missing_skills: [],
            resources: [{ title: 'React Video', url: 'https://youtube.com/react', type: 'video', skill_name: 'React' }]
        });

        render(<GapAnalysis />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Analyse Gap/i }));

        await waitFor(() => {
            expect(screen.getByText('video')).toBeInTheDocument();
        });
    });

    it('does not fetch when user is null', async () => {
        (useAuth as any).mockReturnValue({ user: null });
        render(<GapAnalysis />);
        await waitFor(() => {
            expect(ProfileService.getProfile).not.toHaveBeenCalled();
        });
    });

    it('analyse button is disabled when targetRole is empty', () => {
        render(<GapAnalysis />);
        expect(screen.getByRole('button', { name: /Analyse Gap/i })).toBeDisabled();
    });
});
