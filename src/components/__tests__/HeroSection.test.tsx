import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
    it('renders main headline and CTAs', () => {
        render(<HeroSection />);

        // Check for AI Search Badge
        expect(screen.getByText(/Trusted by Recruiters/i)).toBeInTheDocument();

        // Check for Search Input
        expect(screen.getByPlaceholderText(/Search 'Java Developer'/i)).toBeInTheDocument();

        // Check for Search Button
        expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });
});
