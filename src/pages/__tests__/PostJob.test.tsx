import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostJob } from '../PostJob';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { JobService } from '../../features/jobs/services/jobService';
import { callAIProxy } from '../../lib/ai/proxy';

// 1. Mocks
vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../features/jobs/services/jobService', () => ({
    JobService: {
        createJob: vi.fn()
    }
}));

vi.mock('../../features/companies/services/companyService', () => ({
    CompanyService: {
        getCompanyByEmployerId: vi.fn().mockResolvedValue(null)
    }
}));

vi.mock('../../lib/ai/proxy', () => ({
    callAIProxy: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('PostJob Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            user: { uid: 'emp123', email: 'emp@test.com', emailVerified: true, isAnonymous: false, metadata: {}, providerData: [], refreshToken: '', tenantId: null, delete: vi.fn(), getIdToken: vi.fn(), getIdTokenResult: vi.fn(), reload: vi.fn(), toJSON: vi.fn(), phoneNumber: null, photoURL: null, displayName: null, providerId: 'firebase' },
            userData: null,
            loading: false,
            error: null,
            loginWithGoogle: vi.fn(),
            loginWithEmail: vi.fn(),
            signupWithEmail: vi.fn(),
            logout: vi.fn(),
            refreshUserData: vi.fn(),
            clearError: vi.fn()
        });
    });

    it('should render the form with initial values', () => {
        render(
            <MemoryRouter>
                <PostJob />
            </MemoryRouter>
        );

        expect(screen.getByText(/Post a Position/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i)).toBeInTheDocument();
    });

    it('should handle AI JD generation', async () => {
        const callAIProxyMock = vi.mocked(callAIProxy);
        callAIProxyMock.mockResolvedValueOnce({
            jd: 'Generated JD Content',
            suggestedSkills: ['React', 'TypeScript'],
            screeningQuestions: [{ question: 'Experience?', hint: 'Years' }]
        });

        render(
            <MemoryRouter>
                <PostJob />
            </MemoryRouter>
        );

        // Fill title
        const titleInput = screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i);
        fireEvent.change(titleInput, { target: { value: 'Software Engineer', name: 'title' } });

        // Click generate
        const genBtn = screen.getByText(/Generate Description with AI/i);
        fireEvent.click(genBtn);

        await waitFor(() => {
            expect(callAIProxyMock).toHaveBeenCalledWith('/api/ai/generate-jd', expect.any(Object));
        });

        expect(screen.getByDisplayValue(/Generated JD Content/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/React, TypeScript/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/Experience\?/i)).toBeInTheDocument();
    });

    it('should submit the form successfully', async () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const createJobMock = vi.mocked(JobService.createJob);
        createJobMock.mockResolvedValueOnce('job123');

        render(
            <MemoryRouter>
                <PostJob />
            </MemoryRouter>
        );

        // Fill required fields
        fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Frontend Engineer/i), { target: { value: 'Dev', name: 'title' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. React, TypeScript, Node.js/i), { target: { value: 'JS', name: 'skills' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. Remote or City/i), { target: { value: 'NY', name: 'location' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. 3-5 Years/i), { target: { value: '5', name: 'experience' } });

        // Find text area by label or placeholder
        const descArea = screen.getByPlaceholderText(/Describe the role, responsibilities, and requirements.../i);
        fireEvent.change(descArea, { target: { value: 'Cool job', name: 'description' } });

        const submitBtn = screen.getByText(/Publish Job Posting/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(createJobMock).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/jobs');
        });
    });
});
