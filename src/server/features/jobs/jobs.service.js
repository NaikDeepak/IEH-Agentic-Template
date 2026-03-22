import { generateEmbedding, analyzeQuery } from '../../lib/gemini.js';
import { runVectorSearch, createFilter } from '../../lib/firestore.js';
import * as gemini from '../../lib/gemini.js';
import { CONSTANTS } from '../../config/constants.js';
import { db } from '../../config/firebase.js';

// --- Fuzzy suggestion helpers ---

function getTrigrams(str) {
    const s = '  ' + str.toLowerCase() + '  ';
    const trigrams = new Set();
    for (let i = 0; i < s.length - 2; i++) {
        trigrams.add(s.slice(i, i + 3));
    }
    return trigrams;
}

function trigramSimilarity(a, b) {
    const ta = getTrigrams(a);
    const tb = getTrigrams(b);
    let intersection = 0;
    ta.forEach(t => { if (tb.has(t)) intersection++; });
    return (2 * intersection) / (ta.size + tb.size);
}

/**
 * Returns up to `limit` job title suggestions that fuzzy-match the query.
 */
export const getJobSuggestions = async (query, limit = 5) => {
    if (!query || query.trim().length < 2) return [];

    const snapshot = await db.collection(CONSTANTS.FIREBASE.COLLECTIONS.JOBS)
        .where('status', '==', CONSTANTS.FILTERS.STATUS.ACTIVE)
        .select('title', 'skills')
        .limit(CONSTANTS.SEARCH.SUGGEST_SCAN_LIMIT)
        .get();

    const q = query.toLowerCase();
    const seen = new Set();

    return snapshot.docs
        .map(doc => {
            const { title = '', skills = [] } = doc.data();
            const skillText = Array.isArray(skills) ? skills.join(' ') : String(skills);
            const score = trigramSimilarity(q, title) + trigramSimilarity(q, skillText) * CONSTANTS.SEARCH.SUGGEST_SKILL_WEIGHT;
            return { title, score };
        })
        .filter(({ title, score }) => {
            if (score < CONSTANTS.SEARCH.SUGGEST_MIN_SCORE || seen.has(title.toLowerCase())) return false;
            seen.add(title.toLowerCase());
            return true;
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ title }) => title);
};

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

    // Experience level — only include jobs with a matching experience_level field
    if (experienceLevel) {
        jobs = jobs.filter(job => job.experience_level && job.experience_level.toLowerCase().startsWith(experienceLevel.toLowerCase()));
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
        const finalScore = Math.round((job.matchScore * CONSTANTS.SEARCH.RANKING_VECTOR_WEIGHT) + (keywordScore * CONSTANTS.SEARCH.RANKING_KEYWORD_WEIGHT));
        return { ...job, matchScore: finalScore, originalScore: job.matchScore };
    });

    jobs.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out low-relevance results
    jobs = jobs.filter(job => job.matchScore >= CONSTANTS.SEARCH.MIN_MATCH_SCORE);

    return jobs.slice(0, limit);
};
