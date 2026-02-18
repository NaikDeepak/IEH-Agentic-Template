import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InterviewPrep } from '../../../src/features/seeker/components/Interview/InterviewPrep';
import { generateQuestions, evaluateAnswer } from '../../../src/features/seeker/services/interviewService';

// Mock Dependencies
vi.mock('../../../src/features/seeker/services/interviewService', () => ({
    generateQuestions: vi.fn(),
    evaluateAnswer: vi.fn()
}));

describe('InterviewPrep', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders setup form initially', () => {
        render(<InterviewPrep />);
        expect(screen.getByText(/AI Interview Prep/i)).toBeDefined();
        expect(screen.getByLabelText(/Target Role/i)).toBeDefined();
    });

    it('handles question generation and switching to practice mode', async () => {
        const mockQuestions = [
            { id: 1, question: 'Question 1', type: 'technical', difficulty: 'medium' }
        ];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);

        render(<InterviewPrep />);

        const roleInput = screen.getByLabelText(/Target Role/i);
        fireEvent.change(roleInput, { target: { value: 'Frontend Developer' } });

        const startButton = screen.getByRole('button', { name: /Initialize Practice/i });
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Active Session/i)).toBeDefined();
            expect(screen.getByText('Question 1')).toBeDefined();
        });
    });

    it('handles answer submission and evaluation display', async () => {
        const mockQuestions = [
            { id: 1, question: 'Question 1', type: 'technical', difficulty: 'medium' }
        ];
        const mockEvaluation = {
            score: 85,
            strengths: ['Clear explanation'],
            weaknesses: ['Missing error handling'],
            suggestion: 'Add more detail on edge cases',
            betterAnswer: 'The ideal answer is...'
        };
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);
        (evaluateAnswer as any).mockResolvedValueOnce(mockEvaluation);

        render(<InterviewPrep />);

        // Setup
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Developer' } });
        fireEvent.click(screen.getByRole('button', { name: /Initialize Practice/i }));

        // Practice
        const answerInput = await screen.findByLabelText(/Input Buffer/i);
        fireEvent.change(answerInput, { target: { value: 'My answer...' } });

        fireEvent.click(screen.getByRole('button', { name: /Execute Transmission/i }));

        await waitFor(() => {
            expect(screen.getByText('85%')).toBeDefined();
            expect(screen.getByText('Clear explanation')).toBeDefined();
            expect(screen.getByText(/Golden Protocol/i)).toBeDefined();
        });
    });

    it('completes the session and shows summary', async () => {
        const mockQuestions = [
            { id: 1, question: 'Q1', type: 'technical', difficulty: 'easy' }
        ];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);
        (evaluateAnswer as any).mockResolvedValueOnce({
            score: 90, strengths: [], weaknesses: [], suggestion: '', betterAnswer: ''
        });

        render(<InterviewPrep />);

        // Setup
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Initialize Practice/i }));

        // Practice
        const answerInput = await screen.findByLabelText(/Input Buffer/i);
        fireEvent.change(answerInput, { target: { value: '...' } });
        fireEvent.click(screen.getByRole('button', { name: /Execute Transmission/i }));

        // Next/End
        const endButton = await screen.findByRole('button', { name: /End Session/i });
        fireEvent.click(endButton);

        await waitFor(() => {
            expect(screen.getByText(/Session Terminated/i)).toBeDefined();
            expect(screen.getByRole('button', { name: /Re-Initialize/i })).toBeDefined();
        });
    });
});
