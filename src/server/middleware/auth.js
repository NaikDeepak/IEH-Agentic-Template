import { getAuth } from 'firebase-admin/auth';
import { db } from '../config/firebase.js';

/**
 * Middleware to extract and verify Bearer token from Authorization header.
 * Attaches token to req.authToken and user data to req.user.
 */
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Initialize defaults
    req.authToken = null;
    req.user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        req.authToken = token;

        try {
            const decodedToken = await getAuth().verifyIdToken(token);

            // Start with token data
            req.user = { ...decodedToken };

            // Try to fetch extended role/profile from Firestore
            try {
                const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    req.user.role = userData.role;
                    req.user.employerRole = userData.employerRole;
                }
            } catch (dbError) {
                console.warn(`Failed to fetch user profile for ${decodedToken.uid}:`, dbError.message);
                // Continue with just the token data
            }
        } catch (error) {
            console.error('Token verification failed:', error.message);
            // Leave req.user as null
        }
    }
    next();
};

/**
 * Middleware to require authentication.
 */
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

/**
 * Middleware to require specific roles.
 * @param {string[]} allowedRoles
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
