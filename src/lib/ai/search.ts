import { z } from "zod";
import { callAIProxy } from './proxy';
import type { JobSearchFilters } from '../../features/jobs/types';



export interface CandidateSearchResult {
    id: string;
    displayName?: string;
    bio?: string;
    skills?: string | string[];
    experience?: string;
    location?: string;
    photoURL?: string;
    jobTitle?: string;
    availability?: string;
    preferredRole?: string;
    linkedIn?: string;
    portfolio?: string;
    github?: string;
    matchScore?: number;
}

// Zod Schemas for runtime validation
const JobResultSchema = z.record(z.string(), z.unknown());
const JobSearchResponseSchema = z.object({
    jobs: z.array(JobResultSchema).optional().default([])
});

const CandidateResultSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    experience: z.string().optional(),
    location: z.string().optional(),
    photoURL: z.string().optional(),
    jobTitle: z.string().optional(),
    availability: z.string().optional(),
    preferredRole: z.string().optional(),
    linkedIn: z.string().optional(),
    portfolio: z.string().optional(),
    github: z.string().optional(),
    matchScore: z.number().optional()
});
const CandidateSearchResponseSchema = z.object({
    candidates: z.array(CandidateResultSchema).optional().default([])
});

/**
 * Performs a semantic search on the 'jobs' collection via the backend API.
 *
 * @param searchQuery - The user's natural language query (e.g., "Remote React developer jobs")
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching job documents
 */
export async function searchJobs(searchQuery: string, filters: Partial<JobSearchFilters> = {}, limitCount = 10): Promise<Record<string, unknown>[]> {
    try {
        const rawData = await callAIProxy('/api/jobs/search', {
            query: searchQuery,
            location: filters.workMode && filters.workMode !== 'All' ? filters.workMode : '',
            city: filters.city ?? '',
            jobType: filters.jobType && filters.jobType !== 'All' ? filters.jobType.toLowerCase() : '',
            experienceLevel: filters.experienceLevel && filters.experienceLevel !== 'All' ? filters.experienceLevel.toLowerCase() : '',
            salaryMin: filters.salaryMin ? Number(filters.salaryMin) : 0,
            limit: limitCount,
        });

        // Validate with Zod
        const data = JobSearchResponseSchema.parse(rawData);
        return data.jobs;

    } catch (error) {
        console.error("Job Search failed:", error);
        throw error;
    }
}

/**
 * Performs a semantic search on the 'users' collection for candidates.
 *
 * @param searchQuery - The user's natural language query
 * @param limitCount - Number of results to return (default 10)
 * @returns Array of matching candidate profiles
 */
const SuggestResponseSchema = z.object({
    suggestions: z.array(z.string()).optional().default([])
});

export async function getJobSuggestions(query: string): Promise<string[]> {
    try {
        const response = await fetch(`/api/jobs/suggest?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        const rawData = (await response.json()) as unknown;
        const data = SuggestResponseSchema.parse(rawData);
        return data.suggestions;
    } catch {
        return [];
    }
}

export async function searchCandidates(searchQuery: string, limitCount = 10): Promise<CandidateSearchResult[]> {
    try {
        const rawData = await callAIProxy('/api/candidates/search', { query: searchQuery, limit: limitCount });


        // Validate with Zod
        const data = CandidateSearchResponseSchema.parse(rawData);
        // Cast to CandidateSearchResult[] because Zod schema is slightly broader (optional fields) but effectively compatible
        return data.candidates as CandidateSearchResult[];

    } catch (error) {
        console.error("Candidate Search failed:", error);
        throw error;
    }
}

