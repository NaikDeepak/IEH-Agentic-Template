import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from '../HeroSection';

vi.mock('../../lib/ai/search', () => ({
    searchJobs: vi.fn(),
}));

import { searchJobs } from '../../lib/ai/search';

const renderHero = () => render(
    <MemoryRouter>
        <HeroSection />
    </MemoryRouter>
);

describe('HeroSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders main headline and CTAs', () => {
        renderHero();
        expect(screen.getByText(/India's Smartest/i)).toBeInTheDocument();
        expect(screen.getByText(/AI-powered matching/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search roles/i)).toBeInTheDocument();
        expect(screen.getByText(/Post a Job Free/i)).toBeInTheDocument();
    });

    it('renders stats (50K+, 12K+, 98%)', () => {
        renderHero();
        expect(screen.getByText('50K+')).toBeInTheDocument();
        expect(screen.getByText('12K+')).toBeInTheDocument();
        expect(screen.getByText('98%')).toBeInTheDocument();
    });

    it('does not call searchJobs when search term is empty', () => {
        renderHero();
        fireEvent.click(screen.getByLabelText('Search'));
        expect(searchJobs).not.toHaveBeenCalled();
    });

    it('calls searchJobs when search button is clicked with a term', async () => {
        (searchJobs as any).mockResolvedValue([]);
        renderHero();
        fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: 'React Developer' } });
        fireEvent.click(screen.getByLabelText('Search'));
        await waitFor(() => {
            expect(searchJobs).toHaveBeenCalledWith('React Developer');
        });
    });

    it('calls searchJobs when Enter is pressed in the input', async () => {
        (searchJobs as any).mockResolvedValue([]);
        renderHero();
        const input = screen.getByPlaceholderText(/search roles/i);
        fireEvent.change(input, { target: { value: 'Backend Engineer' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => {
            expect(searchJobs).toHaveBeenCalledWith('Backend Engineer');
        });
    });

    it('does not trigger search on non-Enter keydown', () => {
        renderHero();
        const input = screen.getByPlaceholderText(/search roles/i);
        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.keyDown(input, { key: 'Tab' });
        expect(searchJobs).not.toHaveBeenCalled();
    });

    it('disables search button while loading', async () => {
        (searchJobs as any).mockImplementation(() => new Promise(() => {}));
        renderHero();
        const input = screen.getByPlaceholderText(/search roles/i);
        fireEvent.change(input, { target: { value: 'React' } });
        fireEvent.click(screen.getByLabelText('Search'));
        expect(screen.getByLabelText('Search')).toBeDisabled();
    });

    it('handles searchJobs error gracefully and re-enables button', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (searchJobs as any).mockRejectedValue(new Error('Search failed'));
        renderHero();
        fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: 'React' } });
        fireEvent.click(screen.getByLabelText('Search'));
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(screen.getByLabelText('Search')).not.toBeDisabled();
        });
        consoleSpy.mockRestore();
    });
});
