import { generateEmbedding, analyzeQuery } from '../../lib/gemini.js';
import { runVectorSearch, createFilter } from '../../lib/firestore.js';
import * as gemini from '../../lib/gemini.js';
import { CONSTANTS } from '../../config/constants.js';

export const searchJobs = async (searchQuery, location, limit = CONSTANTS.DEFAULTS.PAGINATION_LIMIT, authToken = null) => {
    // 1. Analyze Query
    const { semanticQuery, filters: extractedFilters } = await gemini.analyzeQuery(searchQuery, "finding a job");

    // 2. Build Firestore Filters
    const filters = [createFilter("status", CONSTANTS.FILTERS.STATUS.ACTIVE)];

    // Apply explicit location from UI if provided, OR extracted location
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

    // 5. Post-Processing
    if (postFilterWorkMode) {
        jobs = jobs.filter(job => job.work_mode === postFilterWorkMode);
    }

    if (extractedFilters.job_type) {
        jobs = jobs.filter(job => job.type === extractedFilters.job_type);
    }

    if (extractedFilters.min_salary) {
        jobs = jobs.filter(job => {
            if (!job.salary_range) return true;
            return job.salary_range.max >= extractedFilters.min_salary;
        });
    }

    // Hybrid Ranking
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    jobs = jobs.map(job => {
        let keywordScore = 0;
        const textToMatch = `${job.title} ${job.skills.join(' ')} ${job.location}`.toLowerCase();

        let matchedCount = 0;
        keywords.forEach(kw => {
            if (textToMatch.includes(kw)) matchedCount++;
        });

        if (keywords.length > 0) {
            keywordScore = (matchedCount / keywords.length) * 100;
        }

        const finalScore = Math.round((job.matchScore * 0.7) + (keywordScore * 0.3));
        return { ...job, matchScore: finalScore, originalScore: job.matchScore };
    });

    jobs.sort((a, b) => b.matchScore - a.matchScore);

    return jobs.slice(0, limit);
};
