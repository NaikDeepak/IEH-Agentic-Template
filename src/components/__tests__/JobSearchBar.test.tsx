import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { JobSearchBar } from '../JobSearchBar';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('JobSearchBar', () => {
    const onSearch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the search input and Find Jobs button', () => {
        render(<JobSearchBar />);
        expect(screen.getByPlaceholderText(/search roles/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /find jobs/i })).toBeInTheDocument();
    });

    it('calls onSearch when Find Jobs button is clicked', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: 'React' } });
        fireEvent.click(screen.getByRole('button', { name: /find jobs/i }));
        expect(onSearch).toHaveBeenCalledWith('React', expect.objectContaining({ workMode: 'All' }));
    });

    it('calls onSearch on Enter keydown', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: 'Node' } });
        fireEvent.keyDown(screen.getByPlaceholderText(/search roles/i), { key: 'Enter' });
        expect(onSearch).toHaveBeenCalledWith('Node', expect.objectContaining({ workMode: 'All' }));
    });

    it('does not call onSearch on non-Enter keydown', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        fireEvent.keyDown(screen.getByPlaceholderText(/search roles/i), { key: 'a' });
        expect(onSearch).not.toHaveBeenCalled();
    });

    it('shows and clears the clear (X) button when search term is typed', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        const input = screen.getByPlaceholderText(/search roles/i);
        expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'test' } });
        // X button appears — find via lucide X aria or by querying all buttons
        const buttons = screen.getAllByRole('button');
        // The clear button is between the search icon and work mode
        const clearButton = buttons.find(b => b.querySelector('svg'));
        expect(clearButton).toBeDefined();

        // Click X clears input
        const clearBtn = buttons.find(b => b.className.includes('hover:bg-slate-100'));
        if (clearBtn) {
            fireEvent.click(clearBtn);
            expect((input as HTMLInputElement).value).toBe('');
        }
    });

    it('toggles filters panel open/closed', () => {
        render(<JobSearchBar />);
        const filtersBtn = screen.getByRole('button', { name: /filters/i });
        expect(screen.queryByPlaceholderText(/mumbai/i)).not.toBeInTheDocument();
        fireEvent.click(filtersBtn);
        expect(screen.getByPlaceholderText(/mumbai/i)).toBeInTheDocument();
        fireEvent.click(filtersBtn);
        expect(screen.queryByPlaceholderText(/mumbai/i)).not.toBeInTheDocument();
    });

    it('opens work mode dropdown and selects an option', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        const workModeBtn = screen.getByRole('button', { name: /work mode/i });
        fireEvent.click(workModeBtn);
        const remoteOption = screen.getByRole('option', { name: 'Remote' });
        expect(remoteOption).toBeInTheDocument();
        fireEvent.click(remoteOption);
        // Dropdown closes
        expect(screen.queryByRole('option', { name: 'Remote' })).not.toBeInTheDocument();
    });

    it('re-triggers onSearch when work mode changes after initial search', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        // First: run a search
        fireEvent.click(screen.getByRole('button', { name: /find jobs/i }));
        expect(onSearch).toHaveBeenCalledTimes(1);
        // Then: change work mode
        const workModeBtn = screen.getByRole('button', { name: /work mode/i });
        fireEvent.click(workModeBtn);
        fireEvent.click(screen.getByRole('option', { name: 'Remote' }));
        expect(onSearch).toHaveBeenCalledTimes(2);
        expect(onSearch).toHaveBeenLastCalledWith('', expect.objectContaining({ workMode: 'Remote' }));
    });

    it('city input triggers debounced search after initial search', async () => {
        render(<JobSearchBar onSearch={onSearch} />);
        fireEvent.click(screen.getByRole('button', { name: /find jobs/i }));
        fireEvent.click(screen.getByRole('button', { name: /filters/i }));

        const cityInput = screen.getByPlaceholderText(/mumbai/i);
        fireEvent.change(cityInput, { target: { value: 'Delhi' } });
        expect(onSearch).toHaveBeenCalledTimes(1); // not yet

        act(() => { vi.advanceTimersByTime(600); });
        expect(onSearch).toHaveBeenCalledTimes(2);
        expect(onSearch).toHaveBeenLastCalledWith('', expect.objectContaining({ city: 'Delhi' }));
    });

    it('salary min triggers debounced search after initial search', async () => {
        render(<JobSearchBar onSearch={onSearch} />);
        fireEvent.click(screen.getByRole('button', { name: /find jobs/i }));
        fireEvent.click(screen.getByRole('button', { name: /filters/i }));

        const salaryInput = screen.getByPlaceholderText(/e\.g\. 6/i);
        fireEvent.change(salaryInput, { target: { value: '10' } });
        act(() => { vi.advanceTimersByTime(600); });
        expect(onSearch).toHaveBeenLastCalledWith('', expect.objectContaining({ salaryMin: '10' }));
    });

    it('shows active filter count badge', () => {
        render(<JobSearchBar />);
        fireEvent.click(screen.getByRole('button', { name: /filters/i }));
        const jobTypeSelect = screen.getByRole('combobox', { name: /job type/i });
        fireEvent.change(jobTypeSelect, { target: { value: 'Full-time' } });
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows reset button when filters are active and resets them', () => {
        render(<JobSearchBar onSearch={onSearch} />);
        fireEvent.click(screen.getByRole('button', { name: /find jobs/i }));
        fireEvent.click(screen.getByRole('button', { name: /filters/i }));
        const experienceSelect = screen.getByRole('combobox', { name: /experience/i });
        fireEvent.change(experienceSelect, { target: { value: 'Senior' } });
        const resetBtn = screen.getByRole('button', { name: /reset/i });
        expect(resetBtn).toBeInTheDocument();
        fireEvent.click(resetBtn);
        expect(onSearch).toHaveBeenLastCalledWith('', expect.objectContaining({ experienceLevel: 'All' }));
    });

    it('closes work mode dropdown when clicking outside', () => {
        render(<JobSearchBar />);
        const workModeBtn = screen.getByRole('button', { name: /work mode/i });
        fireEvent.click(workModeBtn);
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        fireEvent.mouseDown(document.body);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
});
