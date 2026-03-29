import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { PostJob } from '../PostJob';
import { useAuth } from '../../hooks/useAuth';
import { JobService } from '../../features/jobs/services/jobService';
import { CompanyService } from '../../features/companies/services/companyService';
import { callAIProxy } from '../../lib/ai/proxy';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../features/jobs/services/jobService');
vi.mock('../../features/companies/services/companyService');
vi.mock('../../lib/ai/proxy');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../components/Header', () => ({
    Header: () => <div data-testid="mock-header" />
}));

describe('PostJob', () => {
    const mockUser = { uid: 'emp123', email: 'employer@test.com' };
    const mockCompany = { id: 'comp123', name: 'Test Corp', bio: 'We build testing tools', tech_stack: ['Vitest'] };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue({ user: mockUser });
        (CompanyService.getCompanyByEmployerId as Mock).mockResolvedValue(mockCompany);
    });

    const renderPage = () => render(
        <MemoryRouter>
            <PostJob />
        </MemoryRouter>
    );

    it('renders initial form and loads company data', async () => {
        renderPage();
        expect(screen.getByText('Post a Position')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(CompanyService.getCompanyByEmployerId).toHaveBeenCalledWith('emp123');
            // Check if company bio is prefilled
            const bioArea = screen.getByLabelText(/Company Description/i);
            expect(bioArea).toHaveValue('We build testing tools');
        });
    });

    it('handles form submission successfully', async () => {
        renderPage();
        
        fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i), { target: { value: 'Frontend Lead' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. React, TypeScript, Node.js/i), { target: { value: 'React, Vitest' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. Remote or City/i), { target: { value: 'Remote' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe the role/i), { target: { value: 'Cool job description' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. 3-5 Years/i), { target: { value: '5 years' } });
        fireEvent.change(screen.getByLabelText(/Contact Email/i), { target: { value: 'jobs@test.com' } });

        const submitBtn = screen.getByText('Publish Job Posting');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(JobService.createJob).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Frontend Lead',
                employer_id: 'emp123',
                skills: ['React', 'Vitest']
            }));
            expect(mockNavigate).toHaveBeenCalledWith('/jobs');
        });
    });

    it('handles AI JD generation', async () => {
        (callAIProxy as Mock).mockResolvedValue({
            jd: 'AI Generated JD',
            suggestedSkills: ['AI', 'ML'],
            screeningQuestions: [{ question: 'Do you like AI?', hint: 'Yes/No' }]
        });

        renderPage();
        
        fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i), { target: { value: 'AI Researcher' } });
        
        const generateBtn = screen.getByText(/Generate Description with AI/i);
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/generate-jd', expect.anything());
            expect(screen.getByPlaceholderText(/Describe the role/i)).toHaveValue('AI Generated JD');
            expect(screen.getByPlaceholderText(/e.g. React, TypeScript, Node.js/i)).toHaveValue('AI, ML');
            expect(screen.getByDisplayValue('Do you like AI?')).toBeInTheDocument();
        });
    });

    it('handles adding and removing screening questions', async () => {
        renderPage();
        
        const addBtn = screen.getByText(/Add Question Manually/i);
        fireEvent.click(addBtn);

        expect(screen.getByLabelText(/Question 1/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/e.g. How many years/i), { target: { value: 'Test Question' } });
        
        const removeBtn = screen.getByLabelText(/Remove question/i);
        fireEvent.click(removeBtn);

        expect(screen.queryByLabelText(/Question 1/i)).not.toBeInTheDocument();
    });

    it('shows error if AI generation fails', async () => {
        (callAIProxy as Mock).mockRejectedValue(new Error('AI Service Down'));

        renderPage();

        fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i), { target: { value: 'Dev' } });
        fireEvent.click(screen.getByText(/Generate Description with AI/i));

        await waitFor(() => {
            expect(screen.getByText('AI Service Down')).toBeInTheDocument();
        });
    });

    it('shows error when AI generate is clicked without title', async () => {
        renderPage();
        // Title is empty; button is disabled when title is empty, so we can check the error via direct call simulation
        // The button is disabled when formData.title is empty - so we just check the button is disabled initially
        const generateBtn = screen.getByText(/Generate Description with AI/i);
        expect(generateBtn).toBeDisabled();
    });

    it('navigates back when Back button is clicked', async () => {
        renderPage();
        const backBtn = screen.getByText(/Back/i);
        fireEvent.click(backBtn);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('handles AI review draft and shows suggestions', async () => {
        (callAIProxy as Mock).mockResolvedValue({ suggestions: ['Add salary range', 'Include benefits'] });
        renderPage();

        fireEvent.change(screen.getByPlaceholderText(/Describe the role/i), { target: { value: 'A great job description here.' } });

        const reviewBtn = screen.getByText(/Review Draft & Get Tips/i);
        fireEvent.click(reviewBtn);

        await waitFor(() => {
            expect(callAIProxy).toHaveBeenCalledWith('/api/ai/generate-job-assist', expect.anything());
            expect(screen.getByText('Add salary range')).toBeInTheDocument();
        });
    });

    it('shows error when AI review draft fails', async () => {
        (callAIProxy as Mock).mockRejectedValue(new Error('Review failed'));
        renderPage();

        fireEvent.change(screen.getByPlaceholderText(/Describe the role/i), { target: { value: 'Description here.' } });
        fireEvent.click(screen.getByText(/Review Draft & Get Tips/i));

        await waitFor(() => {
            expect(screen.getByText(/AI Review failed/i)).toBeInTheDocument();
        });
    });

    it('review draft button is disabled when description is empty', () => {
        renderPage();
        const reviewBtn = screen.getByText(/Review Draft & Get Tips/i);
        expect(reviewBtn).toBeDisabled();
    });

    it('shows error when form submission fails', async () => {
        (JobService.createJob as Mock).mockRejectedValue(new Error('Server error'));
        renderPage();

        fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i), { target: { value: 'Dev Role' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. React, TypeScript, Node.js/i), { target: { value: 'React' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. Remote or City/i), { target: { value: 'Remote' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe the role/i), { target: { value: 'Job description.' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. 3-5 Years/i), { target: { value: '3 years' } });
        fireEvent.change(screen.getByLabelText(/Contact Email/i), { target: { value: 'hr@test.com' } });

        fireEvent.click(screen.getByText('Publish Job Posting'));

        await waitFor(() => {
            expect(screen.getByText('Server error')).toBeInTheDocument();
        });
    });

    it('handles hint field changes on screening questions', async () => {
        renderPage();

        fireEvent.click(screen.getByText(/Add Question Manually/i));
        expect(screen.getByLabelText(/Question 1/i)).toBeInTheDocument();

        const hintInput = screen.getByPlaceholderText(/Please mention specific projects/i);
        fireEvent.change(hintInput, { target: { value: 'My hint text' } });
        expect(hintInput).toHaveValue('My hint text');
    });

    it('handles CompanyService fetch error silently', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (CompanyService.getCompanyByEmployerId as Mock).mockRejectedValue(new Error('Firestore error'));
        renderPage();
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching'), expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('shows company branding when company has a name', async () => {
        renderPage();
        await waitFor(() => {
            expect(screen.getByText(/Test Corp Branding Applied/i)).toBeInTheDocument();
        });
    });
});
