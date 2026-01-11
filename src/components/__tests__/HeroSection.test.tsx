import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
    it('renders main headline and CTAs', () => {
        render(<HeroSection />);

        // Check for AI Search Badge
        expect(screen.getByText(/AI-Powered Job Search/i)).toBeInTheDocument();

        // Check for Search Input
        expect(screen.getByPlaceholderText(/Ex: Product Designer/i)).toBeInTheDocument();

        // Check for Search Button
        expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });
});
