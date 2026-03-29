/**
 * Tokenizer utility for job alerts and jobs
 * Generates normalized search tokens for efficient matching
 */

/**
 * Normalize a string for tokenization
 * @param {string} str - Input string
 * @returns {string} Lowercase, trimmed string
 */
function normalize(str) {
    return (str ?? '').toLowerCase().trim();
}

/**
 * Generate tokens from keywords string
 * @param {string} keywords - Comma or space separated keywords
 * @returns {string[]} Array of normalized tokens
 */
function tokenizeKeywords(keywords) {
    return normalize(keywords)
        .split(/[,\s]+/)
        .filter(token => token.length >= 2) // Skip single chars
        .slice(0, 20); // Limit to 20 tokens
}

/**
 * Generate location token
 * @param {string} location - Location string
 * @returns {string|null} Normalized location token or null
 */
function tokenizeLocation(location) {
    const normalized = normalize(location).replace(/\s+/g, '-');
    return normalized.length >= 2 ? `loc:${normalized}` : null;
}

/**
 * Generate job type token
 * @param {string} jobType - Job type (FULL_TIME, PART_TIME, etc.)
 * @returns {string|null} Lowercase job type token or null
 */
function tokenizeJobType(jobType) {
    const normalized = normalize(jobType);
    return normalized ? `type:${normalized}` : null;
}

/**
 * Generate all search tokens for a job alert
 * @param {Object} alert - Job alert object with keywords, location, jobType
 * @returns {string[]} Array of search tokens
 */
function generateAlertTokens(alert) {
    const tokens = [];
    
    // Add keyword tokens
    tokens.push(...tokenizeKeywords(alert.keywords || ''));
    
    // Add location token
    const locToken = tokenizeLocation(alert.location || '');
    if (locToken) tokens.push(locToken);
    
    // Add job type token
    const typeToken = tokenizeJobType(alert.jobType || '');
    if (typeToken) tokens.push(typeToken);
    
    return [...new Set(tokens)]; // Deduplicate
}

/**
 * Generate search tokens from a job posting
 * @param {Object} job - Job object with title, skills, location, type
 * @returns {string[]} Array of search tokens (max 30 for array-contains-any)
 */
function generateJobTokens(job) {
    const tokens = [];
    
    // Tokenize title
    tokens.push(...tokenizeKeywords(job.title || ''));
    
    // Tokenize skills
    const skills = Array.isArray(job.skills) ? job.skills.join(' ') : '';
    tokens.push(...tokenizeKeywords(skills));
    
    // Add location token
    const locToken = tokenizeLocation(job.location || '');
    if (locToken) tokens.push(locToken);
    
    // Add job type token
    const typeToken = tokenizeJobType(job.type || '');
    if (typeToken) tokens.push(typeToken);
    
    // Deduplicate and limit to 30 (Firestore array-contains-any limit)
    return [...new Set(tokens)].slice(0, 30);
}

export {
    normalize,
    tokenizeKeywords,
    tokenizeLocation,
    tokenizeJobType,
    generateAlertTokens,
    generateJobTokens,
};
