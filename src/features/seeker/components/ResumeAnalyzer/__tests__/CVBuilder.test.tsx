import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CVBuilder } from '../CVBuilder';

vi.mock('../../../../../lib/ai/proxy', () => ({
    callAIProxy: vi.fn(),
}));

import { callAIProxy } from '../../../../../lib/ai/proxy';

const mockCV = {
    summary: 'Experienced React developer.',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: [
        {
            company: 'Acme Corp',
            role: 'Senior Dev',
            duration: '2021-2024',
            highlights: ['Built dashboards', 'Led team of 4'],
        },
    ],
    education: [
        {
            institution: 'IIT Delhi',
            degree: 'B.Tech CS',
            year: '2019',
        },
    ],
};

describe('CVBuilder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form with all input fields', () => {
        render(<CVBuilder />);
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/skills/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/work history/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/education/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /build with ai/i })).toBeInTheDocument();
    });

    it('pre-fills form with prefill props', () => {
        render(<CVBuilder prefillName="Priya" prefillRole="Engineer" prefillSkills={['React', 'TS']} />);
        expect(screen.getByLabelText(/full name/i)).toHaveValue('Priya');
        expect(screen.getByLabelText(/target role/i)).toHaveValue('Engineer');
        expect(screen.getByLabelText(/skills/i)).toHaveValue('React, TS');
    });

    it('disables submit button when targetRole is empty', () => {
        render(<CVBuilder />);
        const btn = screen.getByRole('button', { name: /build with ai/i });
        expect(btn).toBeDisabled();
    });

    it('enables submit button when targetRole is filled', () => {
        render(<CVBuilder prefillRole="Developer" />);
        const btn = screen.getByRole('button', { name: /build with ai/i });
        expect(btn).not.toBeDisabled();
    });

    it('handles form field changes', () => {
        render(<CVBuilder />);
        const nameInput = screen.getByLabelText(/full name/i);
        fireEvent.change(nameInput, { target: { value: 'John', name: 'name' } });
        expect(nameInput).toHaveValue('John');
    });

    it('calls callAIProxy on submit and renders result', async () => {
        (callAIProxy as any).mockResolvedValue(mockCV);
        render(<CVBuilder prefillRole="Dev" />);
        fireEvent.submit(screen.getByRole('button', { name: /build with ai/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Experienced React developer.')).toBeInTheDocument();
        });

        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Senior Dev')).toBeInTheDocument();
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('B.Tech CS')).toBeInTheDocument();
        expect(screen.getByText('IIT Delhi')).toBeInTheDocument();
    });

    it('shows error message when callAIProxy throws', async () => {
        (callAIProxy as any).mockRejectedValue(new Error('AI service unavailable'));
        render(<CVBuilder prefillRole="Dev" />);
        fireEvent.submit(screen.getByRole('button', { name: /build with ai/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('AI service unavailable')).toBeInTheDocument();
        });
    });

    it('shows generic error for non-Error throws', async () => {
        (callAIProxy as any).mockRejectedValue('unexpected failure');
        render(<CVBuilder prefillRole="Dev" />);
        fireEvent.submit(screen.getByRole('button', { name: /build with ai/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/failed to build CV/i)).toBeInTheDocument();
        });
    });

    it('shows Rebuild button in result view and returns to form', async () => {
        (callAIProxy as any).mockResolvedValue(mockCV);
        render(<CVBuilder prefillRole="Dev" />);
        fireEvent.submit(screen.getByRole('button', { name: /build with ai/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /rebuild/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /rebuild/i }));
        expect(screen.getByRole('button', { name: /build with ai/i })).toBeInTheDocument();
    });

    it('copies CV text to clipboard', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

        (callAIProxy as any).mockResolvedValue(mockCV);
        render(<CVBuilder prefillRole="Dev" />);
        fireEvent.submit(screen.getByRole('button', { name: /build with ai/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /copy all/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /copy all/i }));
        await waitFor(() => {
            expect(writeTextMock).toHaveBeenCalled();
        });

        // Shows "Copied!" feedback
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();
        });
    });

    it('does not render experience or education sections when arrays are empty', async () => {
        const minimalCV = { ...mockCV, experience: [], education: [] };
        (callAIProxy as any).mockResolvedValue(minimalCV);
        render(<CVBuilder prefillRole="Dev" />);
        fireEvent.submit(screen.getByRole('button', { name: /build with ai/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Experienced React developer.')).toBeInTheDocument();
        });

        expect(screen.queryByText('Experience')).not.toBeInTheDocument();
        expect(screen.queryByText('Education')).not.toBeInTheDocument();
    });
});
