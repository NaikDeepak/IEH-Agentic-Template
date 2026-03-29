import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisDisplay } from '../AnalysisDisplay';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import React from 'react';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('framer-motion', () => ({
    motion: {
        circle: ({ children, ...props }: any) => {
            const { initial, animate, transition, strokeDasharray, strokeDashoffset, ...rest } = props;
            return <circle {...rest}>{children}</circle>;
        },
    },
}));

const mockNavigate = vi.fn();

const mockResult = {
    score: 85,
    sections: {
        experience: true,
        education: true,
        skills: true,
        summary: false,
    },
    keywords: {
        found: ['React', 'TypeScript'],
        missing: ['GraphQL'],
    },
    suggestions: ['Add a professional summary', 'Include quantified achievements'],
    parsed_data: {
        name: 'Jane Doe',
        experience: [],
        education: [],
        skills: [],
    },
} as any;

describe('AnalysisDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    it('renders candidate name and score', () => {
        render(<AnalysisDisplay result={mockResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('ATS Score')).toBeInTheDocument();
    });

    it('shows high score message when score >= 80', () => {
        render(<AnalysisDisplay result={mockResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText(/Great ATS compatibility/i)).toBeInTheDocument();
    });

    it('shows improvement message when score < 80', () => {
        const lowScoreResult = { ...mockResult, score: 55 };
        render(<AnalysisDisplay result={lowScoreResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText(/Some improvements can boost/i)).toBeInTheDocument();
    });

    it('renders section checks with present/missing status', () => {
        render(<AnalysisDisplay result={mockResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('experience')).toBeInTheDocument();
        expect(screen.getByText('summary')).toBeInTheDocument();
        const presentBadges = screen.getAllByText('Present');
        const missingBadges = screen.getAllByText('Missing');
        expect(presentBadges.length).toBe(3);
        expect(missingBadges.length).toBe(1);
    });

    it('renders improvement suggestions', () => {
        render(<AnalysisDisplay result={mockResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('Add a professional summary')).toBeInTheDocument();
        expect(screen.getByText('Include quantified achievements')).toBeInTheDocument();
    });

    it('renders no improvements message when suggestions are empty', () => {
        const perfectResult = { ...mockResult, suggestions: [] };
        render(<AnalysisDisplay result={perfectResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText("No improvements needed — great resume!")).toBeInTheDocument();
    });

    it('renders found and missing keywords', () => {
        render(<AnalysisDisplay result={mockResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('GraphQL')).toBeInTheDocument();
    });

    it('shows all keywords present message when missing is empty', () => {
        const allKeywordsResult = { ...mockResult, keywords: { found: ['React'], missing: [] } };
        render(<AnalysisDisplay result={allKeywordsResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('All target keywords present')).toBeInTheDocument();
    });

    it('shows no keywords detected when found is empty', () => {
        const noKeywordsResult = { ...mockResult, keywords: { found: [], missing: ['SQL'] } };
        render(<AnalysisDisplay result={noKeywordsResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('No keywords detected')).toBeInTheDocument();
    });

    it('calls onReset when Optimise with AI is clicked', () => {
        const onReset = vi.fn();
        render(<AnalysisDisplay result={mockResult} onReset={onReset} />, { wrapper: MemoryRouter });
        fireEvent.click(screen.getByText('Optimise with AI'));
        expect(onReset).toHaveBeenCalled();
    });

    it('navigates to dashboard when Back to Dashboard is clicked', () => {
        render(<AnalysisDisplay result={mockResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        fireEvent.click(screen.getByText('Back to Dashboard'));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/dashboard');
    });

    it('renders fallback name when parsed_data.name is null', () => {
        const noNameResult = { ...mockResult, parsed_data: { ...mockResult.parsed_data, name: null } };
        render(<AnalysisDisplay result={noNameResult} onReset={vi.fn()} />, { wrapper: MemoryRouter });
        expect(screen.getByText('Your Resume')).toBeInTheDocument();
    });
});
