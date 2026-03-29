import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InterviewPrep } from '../InterviewPrep';
import { generateQuestions, evaluateAnswer } from '../../../../../features/seeker/services/interviewService';

// Mock Dependencies
vi.mock('../../../../../features/seeker/services/interviewService', () => ({
    generateQuestions: vi.fn(),
    evaluateAnswer: vi.fn()
}));

vi.mock('../../../../../hooks/useAuth', () => ({
    useAuth: () => ({ user: { uid: 'test-user' } })
}));

vi.mock('../../../../../features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn().mockResolvedValue(null)
    }
}));

vi.mock('../../../../../features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn().mockResolvedValue(null)
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
}));

vi.mock('../../../../../lib/firebase', () => ({ db: {}, auth: {} }));

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

        const startButton = screen.getByRole('button', { name: /Start Practice/i });
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Practising for/i)).toBeDefined();
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
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        // Practice
        const answerInput = await screen.findByLabelText(/Your Answer/i);
        fireEvent.change(answerInput, { target: { value: 'My answer...' } });

        fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));

        await waitFor(() => {
            expect(screen.getByText('85%')).toBeDefined();
            expect(screen.getByText('Clear explanation')).toBeDefined();
            expect(screen.getByText(/Model Answer/i)).toBeDefined();
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
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        // Practice
        const answerInput = await screen.findByLabelText(/Your Answer/i);
        fireEvent.change(answerInput, { target: { value: '...' } });
        fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));

        // Finish session (only 1 question)
        const finishButton = await screen.findByRole('button', { name: /Finish Session/i });
        fireEvent.click(finishButton);

        await waitFor(() => {
            expect(screen.getByText(/Practice Complete/i)).toBeDefined();
            expect(screen.getByRole('button', { name: /Start New Session/i })).toBeDefined();
        });
    });

    it('shows error when question generation fails', async () => {
        (generateQuestions as any).mockRejectedValueOnce(new Error('Generation failed'));

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        await waitFor(() => {
            expect(screen.getByText(/Failed to generate questions/i)).toBeInTheDocument();
        });
    });

    it('handles evaluation failure gracefully (no evaluation panel shown)', async () => {
        const mockQuestions = [
            { id: 1, question: 'Q1', type: 'technical', difficulty: 'medium' }
        ];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);
        (evaluateAnswer as any).mockRejectedValueOnce(new Error('Eval failed'));

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        const answerInput = await screen.findByLabelText(/Your Answer/i);
        fireEvent.change(answerInput, { target: { value: 'my answer' } });
        fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));

        // After failure, the answer textarea should still be visible (no evaluation panel)
        await waitFor(() => {
            expect(evaluateAnswer).toHaveBeenCalled();
            expect(screen.queryByText('AI Feedback')).not.toBeInTheDocument();
        });
    });

    it('advances to next question when multiple questions remain', async () => {
        const mockQuestions = [
            { id: 1, question: 'Q1', type: 'technical', difficulty: 'easy' },
            { id: 2, question: 'Q2', type: 'behavioural', difficulty: 'hard' }
        ];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);
        (evaluateAnswer as any).mockResolvedValueOnce({
            score: 70, strengths: ['Good'], weaknesses: ['Needs work'], suggestion: 'Try harder', betterAnswer: 'Better answer'
        });

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        const answerInput = await screen.findByLabelText(/Your Answer/i);
        fireEvent.change(answerInput, { target: { value: 'answer' } });
        fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));

        const nextBtn = await screen.findByRole('button', { name: /Next Question/i });
        fireEvent.click(nextBtn);

        await waitFor(() => {
            expect(screen.getByText('Q2')).toBeInTheDocument();
        });
    });

    it('resets session from practice mode via End Session', async () => {
        const mockQuestions = [
            { id: 1, question: 'Q1', type: 'technical', difficulty: 'easy' }
        ];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        await screen.findByText('Q1');
        fireEvent.click(screen.getByRole('button', { name: /End Session/i }));

        await waitFor(() => {
            expect(screen.getByText(/AI Interview Prep/i)).toBeInTheDocument();
        });
    });

    it('resets session from summary via Start New Session', async () => {
        const mockQuestions = [
            { id: 1, question: 'Q1', type: 'technical', difficulty: 'easy' }
        ];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);
        (evaluateAnswer as any).mockResolvedValueOnce({
            score: 90, strengths: [], weaknesses: [], suggestion: '', betterAnswer: ''
        });

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        const answerInput = await screen.findByLabelText(/Your Answer/i);
        fireEvent.change(answerInput, { target: { value: '...' } });
        fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));

        const finishBtn = await screen.findByRole('button', { name: /Finish Session/i });
        fireEvent.click(finishBtn);
        await screen.findByText(/Practice Complete/i);

        fireEvent.click(screen.getByRole('button', { name: /Start New Session/i }));
        expect(screen.getByText(/AI Interview Prep/i)).toBeInTheDocument();
    });

    it('shows correct score color for score < 60', async () => {
        const mockQuestions = [{ id: 1, question: 'Q1', type: 'technical', difficulty: 'hard' }];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);
        (evaluateAnswer as any).mockResolvedValueOnce({
            score: 40, strengths: [], weaknesses: [], suggestion: '', betterAnswer: ''
        });

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        const answerInput = await screen.findByLabelText(/Your Answer/i);
        fireEvent.change(answerInput, { target: { value: 'my answer' } });
        fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));

        await waitFor(() => {
            expect(screen.getByText('40%')).toBeInTheDocument();
        });
        expect(screen.getByText('40%')).toHaveClass('bg-red-100');
    });

    it('Submit Answer button is disabled when answer is empty', async () => {
        const mockQuestions = [{ id: 1, question: 'Q1', type: 'technical', difficulty: 'easy' }];
        (generateQuestions as any).mockResolvedValueOnce(mockQuestions);

        render(<InterviewPrep />);
        fireEvent.change(screen.getByLabelText(/Target Role/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByRole('button', { name: /Start Practice/i }));

        await screen.findByText('Q1');
        expect(screen.getByRole('button', { name: /Submit Answer/i })).toBeDisabled();
    });
});
