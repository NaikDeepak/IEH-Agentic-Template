import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CandidateDetailModal } from '../CandidateDetailModal';
import { SavedCandidatesService } from '../../services/savedCandidatesService';
import { useAuth } from '../../../../hooks/useAuth';
import React from 'react';

// Mock focus-trap-react
vi.mock('focus-trap-react', () => ({
    FocusTrap: ({ children }: any) => <div data-testid="focus-trap">{children}</div>,
}));

// Mock services and hooks
vi.mock('../../services/savedCandidatesService', () => ({
    SavedCandidatesService: {
        isSaved: vi.fn(),
        save: vi.fn(),
        unsave: vi.fn(),
    },
}));

vi.mock('../../../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

describe('CandidateDetailModal', () => {
    const mockCandidate = {
        id: 'cand-1',
        displayName: 'John Doe',
        jobTitle: 'Software Engineer',
        location: 'San Francisco',
        matchScore: 85,
        bio: 'Experienced engineer',
        skills: ['React', 'TypeScript'],
        experience: '5 years',
        availability: 'Immediate',
        preferredRole: 'Full Stack',
        linkedIn: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        portfolio: 'https://johndoe.com',
        photoURL: 'https://example.com/photo.jpg',
    };

    const mockUser = { uid: 'user-123' };
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        // Manually cast useAuth as a mock since vi.mocked failed
        (useAuth as any).mockReturnValue({ user: mockUser });
        (SavedCandidatesService.isSaved as any).mockResolvedValue(false);
    });

    it('does not render when isOpen is false', () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={false}
                onClose={mockOnClose}
            />
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders candidate details correctly when open', async () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('San Francisco')).toBeInTheDocument();
        expect(screen.getByText('85% match')).toBeInTheDocument();
        expect(screen.getByText('Experienced engineer')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('checks saved status on mount when open', async () => {
        (SavedCandidatesService.isSaved as any).mockResolvedValue(true);

        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        await waitFor(() => {
            expect(SavedCandidatesService.isSaved).toHaveBeenCalledWith('user-123', 'cand-1');
        });
        
        expect(await screen.findByText('Saved')).toBeInTheDocument();
    });

    it('handles toggling save status (save)', async () => {
        (SavedCandidatesService.isSaved as any).mockResolvedValue(false);
        (SavedCandidatesService.save as any).mockResolvedValue(undefined);

        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const saveButton = await screen.findByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(SavedCandidatesService.save).toHaveBeenCalled();
        });
        expect(await screen.findByText('Saved')).toBeInTheDocument();
    });

    it('handles toggling save status (unsave)', async () => {
        (SavedCandidatesService.isSaved as any).mockResolvedValue(true);
        (SavedCandidatesService.unsave as any).mockResolvedValue(undefined);

        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const savedButton = await screen.findByText('Saved');
        fireEvent.click(savedButton);

        await waitFor(() => {
            expect(SavedCandidatesService.unsave).toHaveBeenCalledWith('user-123', 'cand-1');
        });
        expect(await screen.findByText('Save')).toBeInTheDocument();
    });

    it('shows contact form when contact button is clicked', () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(screen.getByText('Contact'));
        expect(screen.getByPlaceholderText(/Introduce yourself/i)).toBeInTheDocument();
    });

    it('handles skill string splitting', () => {
        const candidateWithSkillString = {
            ...mockCandidate,
            skills: 'React, Node, CSS'
        };

        render(
            <CandidateDetailModal
                candidate={candidateWithSkillString as any}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Node')).toBeInTheDocument();
        expect(screen.getByText('CSS')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(screen.getByLabelText('Close'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const backdrop = screen.getByRole('presentation');
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles escape key to close', () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles match score colors', () => {
        const { rerender } = render(
            <CandidateDetailModal
                candidate={{ ...mockCandidate, matchScore: 90 }}
                isOpen={true}
                onClose={mockOnClose}
            />
        );
        expect(screen.getByText('90% match')).toHaveClass('text-emerald-700');

        rerender(
            <CandidateDetailModal
                candidate={{ ...mockCandidate, matchScore: 60 }}
                isOpen={true}
                onClose={mockOnClose}
            />
        );
        expect(screen.getByText('60% match')).toHaveClass('text-amber-700');

        rerender(
            <CandidateDetailModal
                candidate={{ ...mockCandidate, matchScore: 30 }}
                isOpen={true}
                onClose={mockOnClose}
            />
        );
        expect(screen.getByText('30% match')).toHaveClass('text-slate-500');
    });

    it('handles contact message change and sending error', async () => {
        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(screen.getByText('Contact'));
        
        const textarea = screen.getByPlaceholderText(/Introduce yourself/i);
        fireEvent.change(textarea, { target: { value: 'Hello John' } });
        expect(textarea).toHaveValue('Hello John');

        // Check if send button is disabled
        const sendButton = screen.getByRole('button', { name: /send/i });
        expect(sendButton).toBeDisabled();
    });

    it('handles toggle save error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (SavedCandidatesService.save as any).mockRejectedValue(new Error('Save failed'));

        render(
            <CandidateDetailModal
                candidate={mockCandidate}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const saveButton = await screen.findByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                "[CandidateDetailModal] save toggle failed:",
                expect.any(Error)
            );
        });
        consoleSpy.mockRestore();
    });
});
