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

    // Resolve work mode — from UI dropdown (location param) or AI-extracted
    const WORK_MODE_KEYWORDS = ['remote', 'hybrid', 'onsite', 'office', 'wfh'];
    const workModeMap = {
        'remote': 'remote', 'wfh': 'remote',
        'hybrid': 'hybrid',
        'office': 'onsite', 'onsite': 'onsite'
    };

    let postFilterWorkMode = null;
    let aiExtractedCity = '';

    // Check UI-supplied work mode (the `location` param holds the dropdown value)
    if (location) {
        const locLower = location.toLowerCase();
        if (WORK_MODE_KEYWORDS.includes(locLower)) {
            postFilterWorkMode = workModeMap[locLower];
        }
    }

    // Check AI-extracted location — if it's a work mode keyword treat it as such,
    // otherwise treat it as a city (so "developer in Gurgaon" correctly filters by city)
    if (extractedFilters.location) {
        const locLower = extractedFilters.location.toLowerCase();
        if (WORK_MODE_KEYWORDS.includes(locLower)) {
            postFilterWorkMode = postFilterWorkMode || workModeMap[locLower];
        } else if (!city) {
            // Not a work mode — use as city filter only if user didn't supply one explicitly
            aiExtractedCity = extractedFilters.location;
        }
    }

    // AI-extracted work_mode overrides if present
    if (extractedFilters.work_mode) {
        postFilterWorkMode = extractedFilters.work_mode;
    }

    // Effective city — UI filter wins, AI extraction is fallback
    const effectiveCity = city || aiExtractedCity;

    // 3. Generate Embedding
    const queryVector = await gemini.generateEmbedding(semanticQuery);
    console.log(`[JobsService] Generated embedding length: ${queryVector ? queryVector.length : 'null'}`);

    // 4. Run Vector Search — over-fetch more when hard filters are active so
    //    post-filtering has enough candidates to fill the requested limit
    const hasHardFilters = !!(postFilterWorkMode || effectiveCity || jobType || experienceLevel);
    const fetchMultiplier = hasHardFilters ? 5 : CONSTANTS.DEFAULTS.SEARCH_LIMIT_MULTIPLIER;
    let jobs = await runVectorSearch(CONSTANTS.FIREBASE.COLLECTIONS.JOBS, queryVector, filters, limit * fetchMultiplier, authToken);

    // 5. Post-Processing — work mode (case-insensitive; DB stores 'REMOTE'/'HYBRID'/'ONSITE')
    if (postFilterWorkMode) {
        const filterMode = postFilterWorkMode.toLowerCase();
        jobs = jobs.filter(job => job.work_mode && job.work_mode.toLowerCase() === filterMode);
    }

    // City filter (substring match on location field)
    if (effectiveCity) {
        const cityLower = effectiveCity.toLowerCase();
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

    // Hybrid Ranking — with explicit filter-match bonus
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Determine which explicit filters are active (user-selected OR AI-extracted)
    const hasExplicitFilters = !!(effectiveCity || jobType || experienceLevel || (location && !['', 'all'].includes(location.toLowerCase())));

    jobs = jobs.map(job => {
        const skills = Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills ?? '');
        const textToMatch = `${job.title} ${skills} ${job.location}`.toLowerCase();

        // 1. Keyword score
        let matchedCount = 0;
        keywords.forEach(kw => { if (textToMatch.includes(kw)) matchedCount++; });
        const keywordScore = keywords.length > 0 ? (matchedCount / keywords.length) * 100 : 0;

        // 2. Explicit filter-match bonus — reward jobs that match user-selected filters
        let filterBonus = 0;
        if (hasExplicitFilters) {
            let filterHits = 0;
            let filterTotal = 0;

            // City match — strongest signal when user explicitly types a city
            if (effectiveCity) {
                filterTotal++;
                if (job.location && job.location.toLowerCase().includes(effectiveCity.toLowerCase())) {
                    filterHits++;
                }
            }

            // Job type match
            if (jobType) {
                filterTotal++;
                if (job.type && job.type.toLowerCase().replace(/_/g, '-') === jobType.toLowerCase().replace(/_/g, '-')) {
                    filterHits++;
                }
            }

            // Work mode match
            if (postFilterWorkMode) {
                filterTotal++;
                if (job.work_mode && job.work_mode.toLowerCase() === postFilterWorkMode.toLowerCase()) {
                    filterHits++;
                }
            }

            // Experience level match
            if (experienceLevel) {
                filterTotal++;
                if (job.experience_level && job.experience_level.toLowerCase().startsWith(experienceLevel.toLowerCase())) {
                    filterHits++;
                }
            }

            // Scale: 0–100 based on fraction of explicit filters matched
            filterBonus = filterTotal > 0 ? (filterHits / filterTotal) * 100 : 0;
        }

        // 3. Final weighted score — shift weight toward filter bonus when filters are active
        let finalScore;
        if (hasExplicitFilters) {
            // 55% vector + 20% keyword + 25% filter-match bonus
            finalScore = Math.round(
                (job.matchScore * 0.55) +
                (keywordScore * 0.20) +
                (filterBonus * 0.25)
            );
        } else {
            // No explicit filters — original weighting
            finalScore = Math.round(
                (job.matchScore * CONSTANTS.SEARCH.RANKING_VECTOR_WEIGHT) +
                (keywordScore * CONSTANTS.SEARCH.RANKING_KEYWORD_WEIGHT)
            );
        }

        return { ...job, matchScore: finalScore, originalScore: job.matchScore };
    });

    jobs.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out low-relevance results
    jobs = jobs.filter(job => job.matchScore >= CONSTANTS.SEARCH.MIN_MATCH_SCORE);

    return jobs.slice(0, limit);
};
