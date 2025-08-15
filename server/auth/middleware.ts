// auth/middleware.ts - Encore TypeScript Auth Middleware
import { middleware, APIError, ErrCode } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { verifyJWT, getUserByID } from "./helpers";
import type { User, JWTClaims } from "./helpers";

// Global variable to store current user context (Encore pattern)
let currentUser: User | null = null;
let currentUserID: string | null = null;

/**
 * Authentication middleware that validates JWT tokens
 * This middleware extracts Bearer token from Authorization header
 */
export const authMiddleware = middleware(
    {
        target: { auth: true } // Apply to endpoints that require auth
    },
    async (req, next) => {
        try {
            // In Encore TypeScript, we need to handle auth differently
            // The authorization header should be passed as part of the request data
            // For now, we'll use a simpler approach until we can access headers properly

            // Note: In a real implementation, you'd extract the token from the actual request
            // For this demo, we'll assume the token is passed in a different way

            let token: string | undefined;

            // Try to get token from request data if it's available
            if (req.data && typeof req.data === 'object' && 'authorization' in req.data) {
                const authHeader = req.data.authorization as string;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                throw new APIError(ErrCode.Unauthenticated, "Missing or invalid authorization header");
            }

            // Verify the JWT token
            const claims: JWTClaims = verifyJWT(token);

            if (!claims.userID) {
                throw new APIError(ErrCode.Unauthenticated, "Invalid token: missing user ID");
            }

            // Get the user from the database
            const user = await getUserByID(claims.userID);

            if (!user) {
                throw new APIError(ErrCode.Unauthenticated, "User not found");
            }

            // Check if user is active
            if (!user.is_active) {
                throw new APIError(ErrCode.Unauthenticated, "Account has been deactivated");
            }

            // Check subscription status for certain actions
            if (user.subscription_status === "expired") {
                throw new APIError(ErrCode.PermissionDenied, "Subscription has expired");
            }

            // Set the current user context
            currentUser = user;
            currentUserID = user.id;

            // Store user in middleware data for access in endpoints
            if (req.data && typeof req.data === 'object') {
                // We can't directly assign to req.data as it's readonly
                // Instead, we'll use global variables and helper functions
            }

            console.log(`Authenticated user: ${user.email} (${user.id})`);

            // Call the next handler
            const response = await next(req);

            // Clear user context after request
            currentUser = null;
            currentUserID = null;

            return response;

        } catch (error) {
            // Clear user context on error
            currentUser = null;
            currentUserID = null;

            // Re-throw API errors
            if (error instanceof APIError) {
                throw error;
            }

            // Handle JWT verification errors
            if (error instanceof Error) {
                if (error.message.includes('expired')) {
                    throw new APIError(ErrCode.Unauthenticated, "Token has expired");
                }
                if (error.message.includes('invalid')) {
                    throw new APIError(ErrCode.Unauthenticated, "Invalid token");
                }
            }

            // Generic authentication error
            throw new APIError(ErrCode.Unauthenticated, "Authentication failed");
        }
    }
);

/**
 * Optional middleware for endpoints that may have auth but don't require it
 */
export const optionalAuthMiddleware = middleware(
    {
        target: { auth: false } // Apply to public endpoints that can optionally use auth
    },
    async (req, next) => {
        try {
            let token: string | undefined;

            // Try to get token from request data if it's available
            if (req.data && typeof req.data === 'object' && 'authorization' in req.data) {
                const authHeader = req.data.authorization as string;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (token) {
                try {
                    const claims: JWTClaims = verifyJWT(token);

                    if (claims.userID) {
                        const user = await getUserByID(claims.userID);

                        if (user && user.is_active) {
                            currentUser = user;
                            currentUserID = user.id;
                            console.log(`Optional auth: authenticated user ${user.email}`);
                        }
                    }
                } catch (error) {
                    // Silently ignore auth errors for optional auth
                    console.log('Optional auth failed, continuing as anonymous');
                }
            }

            const response = await next(req);

            // Clear user context after request
            currentUser = null;
            currentUserID = null;

            return response;

        } catch (error) {
            // Clear user context on error
            currentUser = null;
            currentUserID = null;
            throw error;
        }
    }
);

/**
 * Subscription validation middleware
 * Ensures user has active subscription for premium features
 */
export const subscriptionMiddleware = middleware(
    {
        target: { auth: true }
    },
    async (req, next) => {
        const user = getCurrentUser();

        if (!user) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication required");
        }

        // Check subscription status
        if (user.subscription_status === 'expired' || user.subscription_status === 'cancelled') {
            throw new APIError(ErrCode.PermissionDenied, "Active subscription required");
        }

        // Check if trial has expired
        if (user.subscription_status === 'trial' && user.trial_end_date) {
            const now = new Date();
            if (now > user.trial_end_date) {
                throw new APIError(ErrCode.PermissionDenied, "Trial period has expired. Please subscribe to continue.");
            }
        }

        console.log(`Subscription validated for: ${user.email} (${user.subscription_status})`);

        return next(req);
    }
);

/**
 * Helper function to get the current authenticated user
 * Use this in your API endpoints to access the authenticated user
 */
export function getCurrentUser(): User | null {
    return currentUser;
}

/**
 * Helper function to get the current authenticated user ID
 */
export function getCurrentUserID(): string | null {
    return currentUserID;
}

/**
 * Helper function that throws if no user is authenticated
 */
export function requireAuth(): User {
    const user = getCurrentUser();
    if (!user) {
        throw new APIError(ErrCode.Unauthenticated, "Authentication required");
    }
    return user;
}

/**
 * Helper function to check if current user has specific permissions
 */
export function hasPermission(permission: 'admin' | 'teacher' | 'student'): boolean {
    const user = getCurrentUser();
    if (!user) return false;

    switch (permission) {
        case 'admin':
            return user.email.endsWith('@tusome.ke') || user.email === 'admin@tusome.com';
        case 'teacher':
            // You can add teacher role logic here
            return user.email.includes('teacher') || hasPermission('admin');
        case 'student':
            return true; // All authenticated users are students by default
        default:
            return false;
    }
}

/**
 * Grade-specific middleware
 * Ensures user has access to specific grade content
 */
export function createGradeMiddleware(requiredGradeCategory: 'primary' | 'junior' | 'senior') {
    return middleware(
        {
            target: { auth: true }
        },
        async (req, next) => {
            const user = getCurrentUser();

            if (!user) {
                throw new APIError(ErrCode.Unauthenticated, "Authentication required");
            }

            // Check if user's grade category matches required category
            if (user.grade_category !== requiredGradeCategory) {
                throw new APIError(
                    ErrCode.PermissionDenied,
                    `This content is only available for ${requiredGradeCategory} students`
                );
            }

            console.log(`Grade access granted: ${user.grade_category} user accessing ${requiredGradeCategory} content`);

            return next(req);
        }
    );
}

// Export pre-configured grade middlewares
export const primaryOnlyMiddleware = createGradeMiddleware('primary');
export const juniorOnlyMiddleware = createGradeMiddleware('junior');
export const seniorOnlyMiddleware = createGradeMiddleware('senior');

/**
 * Admin middleware for admin-only endpoints
 */
export const adminMiddleware = middleware(
    {
        target: { auth: true }
    },
    async (req, next) => {
        const user = getCurrentUser();

        if (!user) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication required");
        }

        // Check if user has admin privileges
        const isAdmin = user.email.endsWith('@tusome.ke') ||
            user.email === 'admin@tusome.com';

        if (!isAdmin) {
            throw new APIError(ErrCode.PermissionDenied, "Administrator access required");
        }

        console.log(`Admin access granted to: ${user.email}`);

        return next(req);
    }
);