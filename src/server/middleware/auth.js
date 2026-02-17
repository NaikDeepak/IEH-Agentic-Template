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
    req.authError = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        req.authToken = token;

        try {
            // console.log('[Auth Middleware] Verifying token...');
            const decodedToken = await getAuth().verifyIdToken(token);
            // console.log('[Auth Middleware] Token verified successfully for UID:', decodedToken.uid);

            // Start with token data
            req.user = { ...decodedToken };

            // Try to fetch extended role/profile from Firestore
            try {
                const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    req.user.role = userData.role;
                    req.user.employerRole = userData.employerRole;
                    // console.log('[Auth Middleware] Fetched user role:', userData.role);
                } else {
                    // console.log('[Auth Middleware] User doc not found in Firestore for UID:', decodedToken.uid);
                }
            } catch (dbError) {
                console.warn(`[Auth Middleware] Failed to fetch user profile for ${decodedToken.uid}:`, dbError.message);
                // Continue with just the token data
            }
        } catch (error) {
            console.error('[Auth Middleware] Token verification failed:', error.message);
            req.authError = error;
            if (error.code) console.error('[Auth Middleware] Error code:', error.code);
            // Leave req.user as null
        }
    } else {
        // console.log('[Auth Middleware] No Bearer token found in request headers');
    }
    next();
};


/**
 * Middleware to require authentication.
 */
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        const errorMessage = req.authError ? `Authentication failed: ${req.authError.message}` : 'Authentication required';
        return res.status(401).json({ error: errorMessage });
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
            const errorMessage = req.authError ? `Authentication failed: ${req.authError.message}` : 'Authentication required';
            return res.status(401).json({ error: errorMessage });
        }

        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
