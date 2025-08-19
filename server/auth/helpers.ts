// auth/helpers.ts - Helper functions for Tusome authentication (UPDATED WITH @node-rs/argon2)
import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes, randomUUID } from "crypto";
// Import the database instance from auth.ts to avoid duplicates
import { db } from "./auth";

// Type definitions
export interface User {
  id: string; // UUID as string
  first_name: string;
  last_name: string;
  email: string;
  grade: string;
  grade_category: 'primary' | 'junior' | 'senior';
  grade_tier: 'Primary CBC' | 'Junior Secondary' | 'Senior Secondary';
  profile_image?: string;
  is_active: boolean;
  email_verified: boolean;
  trial_start_date?: Date;
  trial_end_date?: Date;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  gradeLevel: string;
  gradeTier: string;
  gradeCategory: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
  message: string;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const TOKEN_EXPIRY = "24h"; // 24 hours

// Custom JWT claims interface
export interface JWTClaims {
  userID: string;
  email: string;
  grade: string;
  tier: string;
  iat: number;
  exp: number;
  iss: string;
  sub: string;
}

// Simple JWT implementation functions
function createJWT(payload: any, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const exp = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  const payloadWithExp = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
  const payloadStr = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64');

  const signature = createHash('sha256').update(`${header}.${payloadStr}.${secret}`).digest('hex').substring(0, 32);
  return `${header}.${payloadStr}.${signature}`;
}

function validateJWT(token: string, secret: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [header, payload, signature] = parts;

  // Verify signature
  const expectedSignature = createHash('sha256').update(`${header}.${payload}.${secret}`).digest('hex').substring(0, 32);
  if (signature !== expectedSignature) throw new Error('Invalid signature');

  // Parse payload
  const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

  // Check expiration
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return decoded;
}

// Grade configuration that matches your database
export const gradeConfig: Record<string, { category: string; tier: string; price_ksh: number; subjects: string[] }> = {
  "grade-4": {
    category: "primary",
    tier: "Primary CBC",
    price_ksh: 499,
    subjects: ["Mathematics", "English", "Kiswahili", "Environmental Studies", "Creative Arts"]
  },
  "grade-5": {
    category: "primary",
    tier: "Primary CBC",
    price_ksh: 499,
    subjects: ["Mathematics", "English", "Kiswahili", "Environmental Studies", "Creative Arts"]
  },
  "grade-6": {
    category: "primary",
    tier: "Primary CBC",
    price_ksh: 499,
    subjects: ["Mathematics", "English", "Kiswahili", "Environmental Studies", "Creative Arts"]
  },
  "grade-7": {
    category: "junior",
    tier: "Junior Secondary",
    price_ksh: 899,
    subjects: ["Mathematics", "English", "Kiswahili", "Integrated Science", "Social Studies", "Creative Arts"]
  },
  "grade-8": {
    category: "junior",
    tier: "Junior Secondary",
    price_ksh: 899,
    subjects: ["Mathematics", "English", "Kiswahili", "Integrated Science", "Social Studies", "Creative Arts"]
  },
  "grade-9": {
    category: "junior",
    tier: "Junior Secondary",
    price_ksh: 899,
    subjects: ["Mathematics", "English", "Kiswahili", "Integrated Science", "Social Studies", "Creative Arts"]
  },
  "grade-10": {
    category: "senior",
    tier: "Senior Secondary",
    price_ksh: 1499,
    subjects: ["Mathematics", "English", "Kiswahili", "Physics", "Chemistry", "Biology", "Geography", "History"]
  },
  "grade-11": {
    category: "senior",
    tier: "Senior Secondary",
    price_ksh: 1499,
    subjects: ["Mathematics", "English", "Kiswahili", "Physics", "Chemistry", "Biology", "Geography", "History"]
  },
  "grade-12": {
    category: "senior",
    tier: "Senior Secondary",
    price_ksh: 1499,
    subjects: ["Mathematics", "English", "Kiswahili", "Physics", "Chemistry", "Biology", "Geography", "History"]
  },
};

// Validation functions
export function validateRegistration(req: RegisterRequest): void {
  // Check required fields
  if (!req.firstName?.trim()) {
    throw new Error("First name is required");
  }
  if (!req.lastName?.trim()) {
    throw new Error("Last name is required");
  }
  if (!req.email?.trim()) {
    throw new Error("Email is required");
  }
  if (!req.password) {
    throw new Error("Password is required");
  }
  if (!req.gradeLevel) {  // Fixed: changed from req.grade to req.gradeLevel
    throw new Error("Grade level is required");
  }

  // Validate name lengths
  if (req.firstName.trim().length < 2 || req.firstName.trim().length > 50) {
    throw new Error("First name must be between 2 and 50 characters");
  }
  if (req.lastName.trim().length < 2 || req.lastName.trim().length > 50) {
    throw new Error("Last name must be between 2 and 50 characters");
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(req.email)) {
    throw new Error("Invalid email format");
  }

  // Validate password strength
  if (req.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Check password confirmation
  if (req.password !== req.confirmPassword) {
    throw new Error("Password and confirmation do not match");
  }

  // Check terms agreement
  if (!req.agreeTerms) {
    throw new Error("You must agree to the Terms of Service and Privacy Policy");
  }

  // Validate grade level
  if (!gradeConfig[req.gradeLevel]) {
    throw new Error("Invalid grade level selected");
  }
}

export function validateLogin(req: LoginRequest): void {
  if (!req.email?.trim()) {
    throw new Error("Email is required");
  }
  if (!req.password) {
    throw new Error("Password is required");
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(req.email)) {
    throw new Error("Invalid email format");
  }
}

// Password functions using @node-rs/argon2
export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(userID: string, password: string): Promise<boolean> {
  try {
    const result = await db.queryRow`SELECT password_hash FROM users WHERE id = ${userID}`;
    if (!result) {
      return false;
    }

    return verify(result.password_hash as string, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// ===== FIXED: User database functions with proper error handling =====
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const result = await db.queryRow`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    return result !== null;
  } catch (error) {
    console.error('Database error in checkUserExists:', error);
    // FIXED: Don't swallow database errors - let them bubble up
    throw new Error("Unable to check user existence. Please try again.");
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.queryRow`
        SELECT id, first_name, last_name, email, grade, grade_category, grade_tier,
              profile_image, is_active, email_verified, trial_start_date, trial_end_date,
              subscription_status, last_login_at, created_at, updated_at
        FROM users WHERE email = ${email.toLowerCase()}
      `;

    return result ? (result as User) : null;
  } catch (error) {
    console.error('Database error in getUserByEmail:', error);
    // FIXED: For login, we should throw an error if we can't check the database
    throw new Error("Unable to verify login credentials. Please try again.");
  }
}

export async function getUserByID(userID: string): Promise<User | null> {
  try {
    const result = await db.queryRow`
        SELECT id, first_name, last_name, email, grade, grade_category, grade_tier,
              profile_image, is_active, email_verified, trial_start_date, trial_end_date,
              subscription_status, last_login_at, created_at, updated_at
        FROM users WHERE id = ${userID}
      `;

    return result ? (result as User) : null;
  } catch (error) {
    console.error('Database error in getUserByID:', error);
    // FIXED: Throw error instead of returning null
    throw new Error("Unable to retrieve user information. Please try again.");
  }
}

// ===== ADDED: Additional helper function for email uniqueness =====
export async function ensureUniqueEmail(email: string): Promise<void> {
  const exists = await checkUserExists(email);
  if (exists) {
    throw new Error("A user with this email address already exists");
  }
}

// Token functions
export function generateUserID(): string {
  return randomUUID();
}

export async function generateTokens(userID: string): Promise<{
  token: string;
  refreshToken: string;
  expiresIn: number;
}> {
  try {
    // Get user details for token
    const user = await getUserByID(userID);
    if (!user) {
      throw new Error("User not found");
    }

    // Create JWT token payload
    const payload: Omit<JWTClaims, 'iat' | 'exp'> = {
      userID,
      email: user.email,
      grade: user.grade,
      tier: user.grade_tier,
      iss: "tusome",
      sub: userID,
    };

    // Generate the JWT token
    const token = createJWT(payload, JWT_SECRET);

    // Generate refresh token
    const refreshToken = randomBytes(32).toString('hex');

    // Calculate expires in seconds (24 hours)
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds

    return { token, refreshToken, expiresIn };
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw new Error("Failed to generate tokens");
  }
}

export async function storeRefreshToken(userID: string, refreshToken: string, expiresAt: Date): Promise<void> {
  try {
    // Hash the refresh token before storing
    const hashedToken = hashToken(refreshToken);

    await db.exec`
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES (${userID}, ${hashedToken}, ${expiresAt})
      `;
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw new Error("Failed to store refresh token");
  }
}

export async function validateRefreshToken(refreshToken: string): Promise<string> {
  try {
    const hashedToken = hashToken(refreshToken);

    const result = await db.queryRow`
        SELECT user_id FROM refresh_tokens 
        WHERE token_hash = ${hashedToken} AND expires_at > ${new Date()}
      `;

    if (!result) {
      throw new Error("Invalid or expired refresh token");
    }

    return result.user_id as string;
  } catch (error) {
    console.error('Error validating refresh token:', error);
    throw new Error("Invalid or expired refresh token");
  }
}

export async function invalidateRefreshToken(refreshToken: string): Promise<void> {
  try {
    const hashedToken = hashToken(refreshToken);
    await db.exec`DELETE FROM refresh_tokens WHERE token_hash = ${hashedToken}`;
  } catch (error) {
    console.error('Error invalidating refresh token:', error);
  }
}

// Utility functions
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

// Activity logging
export async function logActivity(userID: string, activityType: string, metadata?: Record<string, any>): Promise<void> {
  try {
    await db.exec`
        INSERT INTO user_activities (user_id, activity_type, metadata)
        VALUES (${userID}, ${activityType}, ${JSON.stringify(metadata || {})})
      `;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Email functions (async operations)
export async function sendWelcomeEmail(user: User): Promise<void> {
  try {
    // Generate email verification token
    const verificationToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await db.exec`
        INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
        VALUES (${user.id}, ${hashToken(verificationToken)}, ${expiresAt})
      `;

    // In production, you would send actual email here
    console.log(`
  ===== WELCOME EMAIL =====
  To: ${user.email}
  Subject: Welcome to Tusome - Verify Your Email

  Hi ${user.first_name},

  Welcome to Tusome! Your 7-day free trial for ${user.grade_tier} has started.

  Please verify your email by clicking the link below:
  https://tusome.ke/auth/verify-email?token=${verificationToken}

  Your trial includes:
  - Full access to ${user.grade_tier} curriculum
  - Interactive lessons and quizzes
  - Progress tracking
  - Mobile-optimized learning

  Trial expires: ${user.trial_end_date?.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}

  Best regards,
  The Tusome Team
  ========================
      `);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
  try {
    // In production, you would send actual email here
    console.log(`
  ===== PASSWORD RESET EMAIL =====
  To: ${user.email}
  Subject: Reset Your Tusome Password

  Hi ${user.first_name},

  You requested to reset your password for your Tusome account.

  Click the link below to reset your password:
  https://tusome.ke/auth/reset-password?token=${resetToken}

  This link will expire in 1 hour.

  If you didn't request this reset, please ignore this email.

  Best regards,
  The Tusome Team
  ===============================
      `);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

// Progress initialization
export async function initializeUserProgress(userID: string, gradeCategory: string): Promise<void> {
  try {
    const subjects = getSubjectsForGrade(gradeCategory);

    console.log(`Initializing progress for user ${userID} with subjects:`, subjects);

    // In production, you would:
    // 1. Insert records into user_subject_progress table
    // 2. Set up initial lesson progress tracking
    // 3. Create achievement tracking entries

    // For now, just log the initialization
    await logActivity(userID, "progress_initialized", {
      grade_category: gradeCategory,
      subjects_count: subjects.length,
      subjects: subjects
    });
  } catch (error) {
    console.error('Error initializing user progress:', error);
  }
}

// Helper function to get subjects for a grade category
function getSubjectsForGrade(gradeCategory: string): string[] {
  switch (gradeCategory) {
    case "primary":
      return ["mathematics", "english", "kiswahili", "environmental-studies", "creative-arts"];
    case "junior":
      return ["mathematics", "english", "kiswahili", "integrated-science", "social-studies", "creative-arts"];
    case "senior":
      return ["mathematics", "english", "kiswahili", "physics", "chemistry", "biology", "geography", "history"];
    default:
      return [];
  }
}

// JWT verification helper (for protected routes)
export function verifyJWT(token: string): JWTClaims {
  try {
    return validateJWT(token, JWT_SECRET) as JWTClaims;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Clean expired tokens (utility function)
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    await db.exec`
        DELETE FROM refresh_tokens WHERE expires_at < ${new Date()}
      `;

    await db.exec`
        DELETE FROM email_verification_tokens WHERE expires_at < ${new Date()}
      `;

    await db.exec`
        DELETE FROM password_reset_tokens WHERE expires_at < ${new Date()}
      `;

    await db.exec`
        DELETE FROM user_sessions WHERE expires_at < ${new Date()}
      `;

    console.log('Cleaned up expired tokens');
    return 0; // Encore doesn't return affected rows count easily
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
}