// auth/service.ts - Service definition with middleware
import { middleware } from "encore.dev/api";

// In Encore TypeScript, services are defined by creating a folder and adding API endpoints
// The middleware is applied through the service configuration
// This file exports the middleware for use in the auth service

// Export middleware for use in this service
export {
    authMiddleware,
    optionalAuthMiddleware,
    adminMiddleware
} from "./middleware";

// You can also create service-specific middleware here
export const authServiceMiddleware = middleware(
    {
        target: { auth: true }
    },
    async (req, next) => {
        console.log(`Auth service middleware: processing request`);
        return next(req);
    }
);