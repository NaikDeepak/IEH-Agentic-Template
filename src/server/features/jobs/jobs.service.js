import { generateEmbedding, analyzeQuery } from '../../lib/gemini.js';
import { runVectorSearch, createFilter } from '../../lib/firestore.js';
import * as gemini from '../../lib/gemini.js';
import { CONSTANTS } from '../../config/constants.js';

export const searchJobs = async (searchQuery, location, limit = CONSTANTS.DEFAULTS.PAGINATION_LIMIT, authToken = null, explicitFilters = {}) => {
    const { city = '', jobType = '', experienceLevel = '', salaryMin = 0 } = explicitFilters;

    // 1. Analyze Query
    const { semanticQuery, filters: extractedFilters } = await gemini.analyzeQuery(searchQuery, "finding a job");

    // 2. Build Firestore Filters
    const filters = [createFilter("status", CONSTANTS.FILTERS.STATUS.ACTIVE)];

    // Apply explicit work mode from UI if provided, OR extracted location
    const effectiveLocation = location || extractedFilters.location;
    let postFilterWorkMode = null;

    if (effectiveLocation) {
        const locLower = effectiveLocation.toLowerCase();
        if (['remote', 'hybrid', 'onsite', 'office', 'wfh'].includes(locLower)) {
            const modeMap = {
                'remote': 'remote', 'wfh': 'remote',
                'hybrid': 'hybrid',
                'office': 'onsite', 'onsite': 'onsite'
            };
            postFilterWorkMode = modeMap[locLower];
        }
    }

    if (extractedFilters.work_mode) {
        postFilterWorkMode = extractedFilters.work_mode;
    }

    // 3. Generate Embedding
    const queryVector = await gemini.generateEmbedding(semanticQuery);
    console.log(`[JobsService] Generated embedding length: ${queryVector ? queryVector.length : 'null'}`);

    // 4. Run Vector Search
    let jobs = await runVectorSearch(CONSTANTS.FIREBASE.COLLECTIONS.JOBS, queryVector, filters, limit, authToken);

    // 5. Post-Processing — work mode
    if (postFilterWorkMode) {
        jobs = jobs.filter(job => job.work_mode === postFilterWorkMode);
    }

    // City filter (substring match on location field)
    if (city) {
        const cityLower = city.toLowerCase();
        jobs = jobs.filter(job => job.location && job.location.toLowerCase().includes(cityLower));
    }

    // Job type — prefer explicit UI value, fall back to AI-extracted
    const effectiveJobType = jobType || extractedFilters.job_type;
    if (effectiveJobType) {
        jobs = jobs.filter(job => job.type && job.type.toLowerCase().replace(/_/g, '-') === effectiveJobType.toLowerCase().replace(/_/g, '-'));
    }

    // Experience level
    if (experienceLevel) {
        jobs = jobs.filter(job => !job.experience_level || job.experience_level.toLowerCase().startsWith(experienceLevel.toLowerCase()));
    }

    // Salary — prefer explicit UI value, fall back to AI-extracted
    const effectiveSalaryMin = salaryMin || extractedFilters.min_salary;
    if (effectiveSalaryMin) {
        jobs = jobs.filter(job => {
            if (!job.salary_range) return true;
            return job.salary_range.max >= effectiveSalaryMin;
        });
    }

    // Hybrid Ranking
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    jobs = jobs.map(job => {
        const skills = Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills ?? '');
        const textToMatch = `${job.title} ${skills} ${job.location}`.toLowerCase();

        let matchedCount = 0;
        keywords.forEach(kw => { if (textToMatch.includes(kw)) matchedCount++; });

        const keywordScore = keywords.length > 0 ? (matchedCount / keywords.length) * 100 : 0;
        const finalScore = Math.round((job.matchScore * 0.7) + (keywordScore * 0.3));
        return { ...job, matchScore: finalScore, originalScore: job.matchScore };
    });

    jobs.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out low-relevance results (threshold: 30)
    jobs = jobs.filter(job => job.matchScore >= 30);

    return jobs.slice(0, limit);
};
