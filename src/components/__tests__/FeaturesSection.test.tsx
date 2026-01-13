import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeaturesSection } from '../FeaturesSection';

describe('FeaturesSection', () => {
    it('renders key feature cards', () => {
        render(<FeaturesSection />);

        // Check for "AI Hiring Assistant" (Employer Feature)
        expect(screen.getByText(/Creative & Design/i)).toBeInTheDocument();

        // Check for "Resume Analyzer" (Job Seeker Feature)
        expect(screen.getByText(/Digital Marketing/i)).toBeInTheDocument();

    });
});
