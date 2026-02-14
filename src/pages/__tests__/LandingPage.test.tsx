import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { LandingPage } from '../LandingPage';

describe('LandingPage', () => {
    it('assembles all major sections', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );

        // Hero Section — dual-persona headlines
        expect(screen.getByText(/India Employment Hub/i)).toBeInTheDocument();
        expect(screen.getByText(/Hire Smarter/i)).toBeInTheDocument();

        // How It Works section
        expect(screen.getByText(/How It/i)).toBeInTheDocument();
        expect(screen.getByText("I'm a Job Seeker")).toBeInTheDocument();
        expect(screen.getByText("I'm Hiring")).toBeInTheDocument();

        // Trending Sectors (FeaturesSection)
        expect(screen.getByText(/Trending/i)).toBeInTheDocument();

        // Employer Value Section
        expect(screen.getByText(/Why Employers/i)).toBeInTheDocument();

        // Why Choose Us (dual-column)
        expect(screen.getByText(/Built for/i)).toBeInTheDocument();
        expect(screen.getByText(/For Job Seekers/i)).toBeInTheDocument();
        expect(screen.getAllByText(/For Employers/i).length).toBeGreaterThan(0);

        // Testimonials
        expect(screen.getByText(/Impact/i)).toBeInTheDocument();

        // CTA Banner — dual CTAs
        expect(screen.getAllByText(/Ready to find/i).length).toBe(2);
    });
});
