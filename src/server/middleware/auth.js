/**
 * Middleware to extract Bearer token from Authorization header.
 * Attaches token to req.authToken.
 * Does not validate the token itself (validation happens at Firebase layer or REST API usage),
 * but ensures it's available for downstream services.
 */
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        req.authToken = authHeader.slice(7);
    } else {
        req.authToken = null;
    }
    next();
};
