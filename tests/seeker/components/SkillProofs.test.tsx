import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkillProofs } from '../../../src/features/seeker/components/Assessments/SkillProofs';
import { useAuth } from '../../../src/hooks/useAuth';
import { generateAssessment, submitAssessment } from '../../../src/features/seeker/services/assessmentService';
import { getDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../../src/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/assessmentService', () => ({
    generateAssessment: vi.fn(),
    submitAssessment: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    getDoc: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn()
}));

vi.mock('../../../src/lib/firebase', () => ({
    db: {}
}));

describe('SkillProofs', () => {
    const mockUser = { uid: 'user123' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (getDoc as any).mockResolvedValue({
            exists: () => true,
            data: () => ({
                skills: ['React', 'TypeScript'],
                verified_skills: ['React']
            })
        });
    });

    it('renders skill lists (verified and unverified)', async () => {
        render(<SkillProofs />);

        await waitFor(() => {
            expect(screen.getByText('React')).toBeDefined();
            expect(screen.getByText('TypeScript')).toBeDefined();
        });

        const verifyButtons = screen.getAllByRole('button', { name: /Verify/i });
        expect(verifyButtons).toHaveLength(1); // Only TypeScript needs verification
    });

    it('handles assessment generation', async () => {
        const mockAssessment = {
            skill: 'TypeScript',
            questions: [
                { id: 'q1', text: 'What is TS?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }
            ]
        };
        (generateAssessment as any).mockResolvedValueOnce(mockAssessment);

        render(<SkillProofs />);

        const verifyButton = await screen.findByRole('button', { name: /Verify/i });
        fireEvent.click(verifyButton);

        expect(screen.getByText(/Generating Assessment/i)).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText('What is TS?')).toBeDefined();
        });
    });

    it('handles assessment submission and success', async () => {
        const mockAssessment = {
            skill: 'TypeScript',
            questions: [
                { id: 'q1', text: 'Q1', options: ['O1', 'O2'], correctAnswer: 0 }
            ]
        };
        (generateAssessment as any).mockResolvedValueOnce(mockAssessment);
        (submitAssessment as any).mockResolvedValueOnce({
            score: 100,
            passed: true,
            feedback: 'Excellent!'
        });

        render(<SkillProofs />);

        const verifyButton = await screen.findByRole('button', { name: /Verify/i });
        fireEvent.click(verifyButton);

        // Answer the question
        const option = await screen.findByText('O1');
        fireEvent.click(option);

        // Submit
        const submitButton = screen.getByRole('button', { name: /Submit Assessment/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Skill Verified!')).toBeDefined();
            expect(screen.getByText('100%')).toBeDefined();
            expect(screen.getByText('Excellent!')).toBeDefined();
        });
    });

    it('handles assessment failure', async () => {
        const mockAssessment = {
            skill: 'TypeScript',
            questions: [
                { id: 'q1', text: 'Q1', options: ['O1', 'O2'], correctAnswer: 0 }
            ]
        };
        (generateAssessment as any).mockResolvedValueOnce(mockAssessment);
        (submitAssessment as any).mockResolvedValueOnce({
            score: 0,
            passed: false,
            feedback: 'Try again.'
        });

        render(<SkillProofs />);

        const verifyButton = await screen.findByRole('button', { name: /Verify/i });
        fireEvent.click(verifyButton);

        // Answer the question
        const option = await screen.findByText('O2');
        fireEvent.click(option);

        // Submit
        const submitButton = screen.getByRole('button', { name: /Submit Assessment/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Assessment Failed')).toBeDefined();
            expect(screen.getByText('0%')).toBeDefined();
        });
    });
});
