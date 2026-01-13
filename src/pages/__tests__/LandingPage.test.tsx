import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LandingPage } from '../LandingPage';

describe('LandingPage', () => {
    it('assembles the hero and feature sections', () => {
        render(<LandingPage />);

        // Check for Hero Section (Headline)
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/India Employment Hub - AI Powered Recruitment Platform/i);

        // Check for Features Section (Section Title)
        expect(screen.getByRole('heading', { level: 2, name: /Trending Job Roles/i })).toBeInTheDocument();
    });
});
