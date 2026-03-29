import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeInput } from '../ResumeInput';
import React from 'react';

vi.mock('../CVBuilder', () => ({
    CVBuilder: ({ prefillName, prefillRole }: any) => (
        <div data-testid="cv-builder">CVBuilder: {prefillName} {prefillRole}</div>
    ),
}));

describe('ResumeInput', () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all tabs', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        expect(screen.getByText('Upload File')).toBeInTheDocument();
        expect(screen.getByText('Paste Text')).toBeInTheDocument();
        expect(screen.getByText('LinkedIn Import')).toBeInTheDocument();
        expect(screen.getByText('Build with AI')).toBeInTheDocument();
    });

    it('shows file upload area by default', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        expect(screen.getByText('Click or drag your resume here')).toBeInTheDocument();
        expect(screen.getByText(/PDF, DOC, DOCX/i)).toBeInTheDocument();
    });

    it('switches to paste text mode', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        fireEvent.click(screen.getByText('Paste Text'));
        expect(screen.getByLabelText('Resume Text')).toBeInTheDocument();
    });

    it('switches to linkedin mode', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        fireEvent.click(screen.getByText('LinkedIn Import'));
        expect(screen.getByText('How to export your LinkedIn profile')).toBeInTheDocument();
    });

    it('switches to Build with AI mode and shows CVBuilder', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} prefillName="John" prefillRole="Engineer" />);
        fireEvent.click(screen.getByText('Build with AI'));
        expect(screen.getByTestId('cv-builder')).toBeInTheDocument();
        expect(screen.getByText(/CVBuilder: John Engineer/)).toBeInTheDocument();
    });

    it('calls onSubmit with text in paste mode', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        fireEvent.click(screen.getByText('Paste Text'));
        const textarea = screen.getByLabelText('Resume Text');
        fireEvent.change(textarea, { target: { value: 'My resume content' } });
        fireEvent.submit(textarea.closest('form')!);
        expect(mockOnSubmit).toHaveBeenCalledWith({ type: 'text', content: 'My resume content' });
    });

    it('shows Analysing text when isLoading is true', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} isLoading={true} />);
        expect(screen.getByText('Analysing...')).toBeInTheDocument();
    });

    it('submit button is disabled by default (no file selected)', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        const submitButton = screen.getByRole('button', { name: /Analyse Resume/i });
        expect(submitButton).toBeDisabled();
    });

    it('does not submit when paste mode text is empty', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        fireEvent.click(screen.getByText('Paste Text'));
        const form = document.querySelector('form');
        fireEvent.submit(form!);
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows LinkedIn PDF upload instructions', () => {
        render(<ResumeInput onSubmit={mockOnSubmit} />);
        fireEvent.click(screen.getByText('LinkedIn Import'));
        expect(screen.getByText('Go to your LinkedIn profile')).toBeInTheDocument();
        expect(screen.getByText(/Save to PDF/i)).toBeInTheDocument();
    });
});
