import * as gemini from '../../lib/gemini.js';
import { runVectorSearch, createFilter } from '../../lib/firestore.js';
import { CONSTANTS } from '../../config/constants.js';

export const searchCandidates = async (searchQuery, limit = CONSTANTS.DEFAULTS.PAGINATION_LIMIT, authToken = null) => {
    // 1. Expand Query
    const expandedQuery = await gemini.expandQuery(searchQuery, "finding a candidate");

    // 2. Generate Embedding
    const queryVector = await gemini.generateEmbedding(expandedQuery);

    // 3. Run Vector Search
    const filters = [
        createFilter("status", CONSTANTS.FILTERS.STATUS.ACTIVE),
        createFilter("role", CONSTANTS.FILTERS.ROLES.SEEKER)
    ];

    const candidatesRaw = await runVectorSearch(CONSTANTS.FIREBASE.COLLECTIONS.USERS, queryVector, filters, limit, authToken);

    // 4. Filter Sensitive Dat
    return candidatesRaw.map(c => {
        const {
            id, matchScore, displayName, bio, skills, experience,
            location, photoURL, jobTitle, availability,
            preferredRole, linkedIn, portfolio, github
        } = c;

        return {
            id, matchScore, displayName, bio, skills, experience,
            location, photoURL, jobTitle, availability,
            preferredRole, linkedIn, portfolio, github
        };
    });
};
