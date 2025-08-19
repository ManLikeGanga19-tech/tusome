// auth/middleware.ts - Encore TypeScript Auth Middleware (IMPROVED)
import { middleware, APIError, ErrCode } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { verifyJWT, getUserByID } from "./helpers";
import type { User, JWTClaims } from "./helpers";

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

            // Store user in request context for access in endpoints
            // Note: In Encore, we typically pass user data through request parameters
            if (req.data && typeof req.data === 'object') {
                // We can't directly assign to req.data as it's readonly
                // Instead, endpoints should handle auth individually for now
            }

            console.log(`Authenticated user: ${user.email} (${user.id})`);

            // Call the next handler
            const response = await next(req);

            return response;

        } catch (error) {
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
                            console.log(`Optional auth: authenticated user ${user.email}`);
                        }
                    }
                } catch (error) {
                    // Silently ignore auth errors for optional auth
                    console.log('Optional auth failed, continuing as anonymous');
                }
            }

            const response = await next(req);

            return response;

        } catch (error) {
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
        // For subscription middleware, we need to re-authenticate since we don't have global state
        let token: string | undefined;
        let user: User | null = null;

        // Try to get token from request data
        if (req.data && typeof req.data === 'object' && 'authorization' in req.data) {
            const authHeader = req.data.authorization as string;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication required");
        }

        try {
            const claims: JWTClaims = verifyJWT(token);
            if (claims.userID) {
                user = await getUserByID(claims.userID);
            }
        } catch (error) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication failed");
        }

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
 * Helper function to get authenticated user from token
 * Use this in your API endpoints to access the authenticated user
 */
export async function getAuthenticatedUser(authHeader: string): Promise<User> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new APIError(ErrCode.Unauthenticated, "Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);

    if (!token) {
        throw new APIError(ErrCode.Unauthenticated, "No token provided");
    }

    const claims: JWTClaims = verifyJWT(token);

    if (!claims.userID) {
        throw new APIError(ErrCode.Unauthenticated, "Invalid token: missing user ID");
    }

    const user = await getUserByID(claims.userID);

    if (!user) {
        throw new APIError(ErrCode.Unauthenticated, "User not found");
    }

    if (!user.is_active) {
        throw new APIError(ErrCode.Unauthenticated, "Account has been deactivated");
    }

    return user;
}

/**
 * Helper function to optionally get authenticated user from token
 * Returns null if authentication fails instead of throwing
 */
export async function getOptionalAuthenticatedUser(authHeader?: string): Promise<User | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    try {
        return await getAuthenticatedUser(authHeader);
    } catch (error) {
        return null;
    }
}

/**
 * Helper function to check if user has specific permissions
 */
export function hasPermission(user: User, permission: 'admin' | 'teacher' | 'student'): boolean {
    if (!user) return false;

    switch (permission) {
        case 'admin':
            return user.email.endsWith('@tusome.ke') || user.email === 'admin@tusome.com';
        case 'teacher':
            // You can add teacher role logic here
            return user.email.includes('teacher') || hasPermission(user, 'admin');
        case 'student':
            return true; // All authenticated users are students by default
        default:
            return false;
    }
}

/**
 * Helper function to check if user has access to specific grade content
 */
export function hasGradeAccess(user: User, requiredGradeCategory: 'primary' | 'junior' | 'senior'): boolean {
    return user.grade_category === requiredGradeCategory;
}

/**
 * Helper function to validate subscription status
 */
export function hasActiveSubscription(user: User): boolean {
    if (user.subscription_status === 'expired' || user.subscription_status === 'cancelled') {
        return false;
    }

    // Check if trial has expired
    if (user.subscription_status === 'trial' && user.trial_end_date) {
        const now = new Date();
        return now <= user.trial_end_date;
    }

    return user.subscription_status === 'active' || user.subscription_status === 'trial';
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
            let token: string | undefined;
            let user: User | null = null;

            // Try to get token from request data
            if (req.data && typeof req.data === 'object' && 'authorization' in req.data) {
                const authHeader = req.data.authorization as string;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                throw new APIError(ErrCode.Unauthenticated, "Authentication required");
            }

            try {
                const claims: JWTClaims = verifyJWT(token);
                if (claims.userID) {
                    user = await getUserByID(claims.userID);
                }
            } catch (error) {
                throw new APIError(ErrCode.Unauthenticated, "Authentication failed");
            }

            if (!user) {
                throw new APIError(ErrCode.Unauthenticated, "Authentication required");
            }

            // Check if user's grade category matches required category
            if (!hasGradeAccess(user, requiredGradeCategory)) {
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
        let token: string | undefined;
        let user: User | null = null;

        // Try to get token from request data
        if (req.data && typeof req.data === 'object' && 'authorization' in req.data) {
            const authHeader = req.data.authorization as string;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication required");
        }

        try {
            const claims: JWTClaims = verifyJWT(token);
            if (claims.userID) {
                user = await getUserByID(claims.userID);
            }
        } catch (error) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication failed");
        }

        if (!user) {
            throw new APIError(ErrCode.Unauthenticated, "Authentication required");
        }

        // Check if user has admin privileges
        const isAdmin = hasPermission(user, 'admin');

        if (!isAdmin) {
            throw new APIError(ErrCode.PermissionDenied, "Administrator access required");
        }

        console.log(`Admin access granted to: ${user.email}`);

        return next(req);
    }
);