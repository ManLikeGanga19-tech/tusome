// auth/auth.ts - TypeScript Encore Auth Service
import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Header } from "encore.dev/api";
import { randomUUID } from "crypto";
import {
	RegisterRequest,
	AuthResponse,
	validateRegistration,
	checkUserExists,
	gradeConfig,
	hashPassword,
	User,
	generateTokens,
	storeRefreshToken,
	logActivity,
	initializeUserProgress,
	sendWelcomeEmail,
	LoginRequest,
	validateLogin,
	getUserByEmail,
	verifyPassword,
	getUserByID,
	invalidateRefreshToken
} from "./helpers";

// Database configuration - exported so helpers.ts can import it
export const db = new SQLDatabase("auth", {
	migrations: "./migrations",
});

// Register endpoint - exactly as shown in Encore docs
export const register = api(
	{ method: "POST", path: "/auth/register", expose: true },
	async (req: RegisterRequest): Promise<AuthResponse> => {
		// Validate the registration request
		validateRegistration(req);

		// Check if user already exists
		const existingUser = await checkUserExists(req.email);
		if (existingUser) {
			throw new Error("A user with this email address already exists");
		}

		// Get grade configuration
		const gradeInfo = gradeConfig[req.gradeLevel];
		if (!gradeInfo) {
			throw new Error("Invalid grade level selected");
		}

		// Hash the password using helper function
		const hashedPassword = await hashPassword(req.password);

		// Generate user ID using randomUUID() to match UUID type
		const userID = randomUUID();

		// Calculate trial period (7 days)
		const trialStart = new Date();
		const trialEnd = new Date();
		trialEnd.setDate(trialStart.getDate() + 7);

		// Create user object
		const user: User = {
			id: userID,
			first_name: req.firstName.trim(),
			last_name: req.lastName.trim(),
			email: req.email.trim().toLowerCase(),
			grade: req.gradeLevel,
			grade_category: gradeInfo.category as 'primary' | 'junior' | 'senior',
			grade_tier: gradeInfo.tier as 'Primary CBC' | 'Junior Secondary' | 'Senior Secondary',
			is_active: true,
			email_verified: false,
			trial_start_date: trialStart,
			trial_end_date: trialEnd,
			subscription_status: "trial",
			created_at: new Date(),
			updated_at: new Date(),
		};

		// Insert user into database using Encore's db.exec method
		await db.exec`
      INSERT INTO users (
        id, first_name, last_name, email, password_hash, grade, 
        grade_category, grade_tier, is_active, email_verified,
        trial_start_date, trial_end_date, subscription_status
      ) VALUES (
        ${user.id}, ${user.first_name}, ${user.last_name}, ${user.email}, ${hashedPassword},
        ${user.grade}, ${user.grade_category}, ${user.grade_tier}, ${user.is_active},
        ${user.email_verified}, ${user.trial_start_date}, ${user.trial_end_date},
        ${user.subscription_status}
      )
    `;

		// Generate JWT tokens using helper function
		const { token, refreshToken, expiresIn } = await generateTokens(userID);

		// Store refresh token with proper hashing
		await storeRefreshToken(userID, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

		// Log registration activity
		await logActivity(userID, "user_registered", {
			grade: user.grade,
			grade_tier: user.grade_tier,
			trial_expires: user.trial_end_date,
		});

		// Async operations (don't await these to avoid blocking)
		Promise.all([
			initializeUserProgress(userID, user.grade_category),
			sendWelcomeEmail(user)
		]).catch(console.error);

		return {
			user,
			token,
			refresh_token: refreshToken,
			expires_in: expiresIn,
			message: "Account created successfully! Your 7-day free trial has started.",
		};
	}
);

// Login endpoint
export const login = api(
	{ method: "POST", path: "/auth/login", expose: true },
	async (req: LoginRequest): Promise<AuthResponse> => {
		// Validate login request
		validateLogin(req);

		// Get user by email
		const user = await getUserByEmail(req.email);
		if (!user) {
			throw new Error("Invalid email or password");
		}

		// Verify password using helper function
		const isValidPassword = await verifyPassword(user.id, req.password);
		if (!isValidPassword) {
			// Log failed login attempt
			await logActivity(user.id, "login_failed", {
				reason: "invalid_password",
			});

			throw new Error("Invalid email or password");
		}

		// Check if user is active
		if (!user.is_active) {
			throw new Error("Your account has been deactivated. Please contact support.");
		}

		// Check trial/subscription status
		if (user.subscription_status === "expired") {
			throw new Error("Your subscription has expired. Please renew to continue learning.");
		}

		// Generate new tokens using helper function
		const { token, refreshToken, expiresIn } = await generateTokens(user.id);

		// Store new refresh token
		await storeRefreshToken(user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

		// Update last login time
		const now = new Date();
		await db.exec`UPDATE users SET last_login_at = ${now}, updated_at = ${now} WHERE id = ${user.id}`;

		// Update user with last login time
		user.last_login_at = now;

		// Log successful login
		await logActivity(user.id, "user_login", {
			subscription_status: user.subscription_status,
		});

		// Determine welcome message based on subscription status
		let message = "Welcome back to Tusome!";
		if (user.subscription_status === "trial" && user.trial_end_date) {
			const daysLeft = Math.ceil((user.trial_end_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
			if (daysLeft > 0) {
				message = `Welcome back! You have ${daysLeft} days left in your free trial.`;
			} else {
				message = "Welcome back! Your trial has expired. Please subscribe to continue.";
			}
		}

		return {
			user,
			token,
			refresh_token: refreshToken,
			expires_in: expiresIn,
			message,
		};
	}
);

// Get profile endpoint (requires authentication)
export const getProfile = api(
	{ method: "GET", path: "/auth/profile", expose: true },
	async (req: { authorization: Header<"Authorization"> }): Promise<User> => {
		// Extract token from Authorization header
		const authHeader = req.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new Error("Missing or invalid authorization header");
		}

		const token = authHeader.substring(7); // Remove "Bearer " prefix

		if (!token) {
			throw new Error("No token provided");
		}

		// Verify the JWT token
		const { verifyJWT } = await import("./helpers");
		const claims = verifyJWT(token);

		if (!claims.userID) {
			throw new Error("Invalid token: missing user ID");
		}

		// Get the user from the database
		const user = await getUserByID(claims.userID);

		if (!user) {
			throw new Error("User not found");
		}

		// Check if user is active
		if (!user.is_active) {
			throw new Error("Account has been deactivated");
		}

		return user;
	}
);

// Update user profile (requires authentication)
export const updateProfile = api(
	{ method: "PUT", path: "/auth/profile", expose: true },
	async (req: {
		authorization: Header<"Authorization">;
		first_name?: string;
		last_name?: string;
		profile_image?: string;
	}): Promise<User> => {
		// Extract token from Authorization header
		const authHeader = req.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new Error("Missing or invalid authorization header");
		}

		const token = authHeader.substring(7);

		if (!token) {
			throw new Error("No token provided");
		}

		// Verify the JWT token
		const { verifyJWT } = await import("./helpers");
		const claims = verifyJWT(token);

		if (!claims.userID) {
			throw new Error("Invalid token: missing user ID");
		}

		// Get current user
		const currentUser = await getUserByID(claims.userID);

		if (!currentUser) {
			throw new Error("User not found");
		}

		// Update allowed fields only (security consideration)
		await db.exec`
      UPDATE users 
      SET first_name = ${req.first_name || currentUser.first_name}, 
          last_name = ${req.last_name || currentUser.last_name}, 
          profile_image = ${req.profile_image || currentUser.profile_image},
          updated_at = ${new Date()}
      WHERE id = ${currentUser.id}
    `;

		// Log profile update
		await logActivity(currentUser.id, "profile_updated", {
			first_name: req.first_name,
			last_name: req.last_name,
			profile_image: req.profile_image
		});

		// Return updated user
		const updatedUser = await getUserByID(currentUser.id);
		if (!updatedUser) {
			throw new Error("Failed to retrieve updated user");
		}

		return updatedUser;
	}
);

// Logout endpoint (requires authentication)  
export const logout = api(
	{ method: "POST", path: "/auth/logout", expose: true },
	async (req: {
		authorization: Header<"Authorization">;
		refreshToken?: string;
	}): Promise<{ message: string }> => {
		// Extract token from Authorization header
		const authHeader = req.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new Error("Missing or invalid authorization header");
		}

		const token = authHeader.substring(7);

		if (!token) {
			throw new Error("No token provided");
		}

		// Verify the JWT token
		const { verifyJWT } = await import("./helpers");
		const claims = verifyJWT(token);

		if (!claims.userID) {
			throw new Error("Invalid token: missing user ID");
		}

		// Invalidate refresh token if provided
		if (req.refreshToken) {
			await invalidateRefreshToken(req.refreshToken);
		}

		// Log logout activity
		await logActivity(claims.userID, "user_logout", {});

		return { message: "Logged out successfully" };
	}
);