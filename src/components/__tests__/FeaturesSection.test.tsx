import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeaturesSection } from '../FeaturesSection';

describe('FeaturesSection', () => {
    it('renders key feature cards', () => {
        render(<FeaturesSection />);

        // Check for "AI Hiring Assistant" (Employer Feature)
        expect(screen.getByText(/AI Hiring Assistant/i)).toBeInTheDocument();

        // Check for "Resume Analyzer" (Job Seeker Feature)
        expect(screen.getByText(/Resume Analyzer/i)).toBeInTheDocument();

        // Check for "Active" keyword context (multiple instances expected)
        const activeElements = screen.getAllByText(/Active/i);
        expect(activeElements.length).toBeGreaterThan(0);
    });
});
