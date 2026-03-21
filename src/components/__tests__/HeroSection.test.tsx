import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
    it('renders main headline and CTAs', () => {
        render(
            <MemoryRouter>
                <HeroSection />
            </MemoryRouter>
        );

        // Check for main heading
        expect(screen.getByText(/India's Smartest/i)).toBeInTheDocument();

        // Check for sub-headline
        expect(screen.getByText(/AI-powered matching/i)).toBeInTheDocument();

        // Check for CTAs
        expect(screen.getByPlaceholderText(/Search roles/i)).toBeInTheDocument();
        expect(screen.getByText(/Post a Job Free/i)).toBeInTheDocument();
    });
});
