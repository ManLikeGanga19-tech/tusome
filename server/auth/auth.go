
package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"

	"encore.dev/beta/auth"
	"encore.dev/storage/sqldb"
	"golang.org/x/crypto/bcrypt"
)

// Database for auth service
var db = sqldb.NewDatabase("auth", sqldb.DatabaseConfig{
	Migrations: "./migrations",
})

// User represents a Tusome platform user - matches your form exactly
type User struct {
	ID              string     `json:"id"`
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	Email           string     `json:"email"`
	Grade           string     `json:"grade"`           // grade-4, grade-5, etc.
	GradeCategory   string     `json:"grade_category"`  // primary, junior, senior
	GradeTier       string     `json:"grade_tier"`      // Primary CBC, Junior Secondary, etc.
	ProfileImage    *string    `json:"profile_image,omitempty"`
	IsActive        bool       `json:"is_active"`
	EmailVerified   bool       `json:"email_verified"`
	TrialStartDate  *time.Time `json:"trial_start_date,omitempty"`
	TrialEndDate    *time.Time `json:"trial_end_date,omitempty"`
	SubscriptionStatus string  `json:"subscription_status"` // trial, active, expired, cancelled
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
}

// Registration request - matches your form fields exactly
type RegisterRequest struct {
	FirstName       string `json:"firstName" validate:"required,min=2,max=50"`
	LastName        string `json:"lastName" validate:"required,min=2,max=50"`
	Email           string `json:"email" validate:"required,email"`
	Grade           string `json:"grade" validate:"required"`
	GradeLevel      string `json:"gradeLevel"`    // from frontend
	GradeTier       string `json:"gradeTier"`     // from frontend  
	GradeCategory   string `json:"gradeCategory"` // from frontend
	Password        string `json:"password" validate:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" validate:"required"`
	AgreeTerms      bool   `json:"agreeTerms" validate:"required"`
}

// Login request
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// Authentication response
type AuthResponse struct {
	User         User   `json:"user"`
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	Message      string `json:"message"`
}

// Error response structure
type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Field   string `json:"field,omitempty"`
}

// Grade configuration that matches your frontend exactly
var gradeConfig = map[string]struct {
	Category string
	Tier     string
	Price    string
}{
	"grade-4":  {"primary", "Primary CBC", "KSh 499/month"},
	"grade-5":  {"primary", "Primary CBC", "KSh 499/month"},
	"grade-6":  {"primary", "Primary CBC", "KSh 499/month"},
	"grade-7":  {"junior", "Junior Secondary", "KSh 899/month"},
	"grade-8":  {"junior", "Junior Secondary", "KSh 899/month"},
	"grade-9":  {"junior", "Junior Secondary", "KSh 899/month"},
	"grade-10": {"senior", "Senior Secondary", "KSh 1,499/month"},
	"grade-11": {"senior", "Senior Secondary", "KSh 1,499/month"},
	"grade-12": {"senior", "Senior Secondary", "KSh 1,499/month"},
}

// Register a new student in Tusome platform
//encore:api public method=POST path=/auth/register
func Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	// Validate the registration request
	if err := validateRegistration(req); err != nil {
		return nil, err
	}

	// Check if user already exists
	exists, err := checkUserExists(ctx, req.Email)
	if err != nil {
		return nil, &auth.Error{
			Code:    "DATABASE_ERROR",
			Message: "Failed to check user existence",
		}
	}
	if exists {
		return nil, &auth.Error{
			Code:    "USER_EXISTS",
			Message: "A user with this email address already exists",
		}
	}

	// Get grade configuration
	gradeInfo, exists := gradeConfig[req.GradeLevel]
	if !exists {
		return nil, &auth.Error{
			Code:    "INVALID_GRADE",
			Message: "Invalid grade level selected",
		}
	}

	// Hash the password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		return nil, &auth.Error{
			Code:    "PASSWORD_HASH_ERROR",
			Message: "Failed to secure password",
		}
	}

	// Generate user ID
	userID := generateUserID()

	// Calculate trial period (7 days)
	trialStart := time.Now()
	trialEnd := trialStart.AddDate(0, 0, 7)

	// Create user in database
	user := User{
		ID:                 userID,
		FirstName:          strings.TrimSpace(req.FirstName),
		LastName:           strings.TrimSpace(req.LastName),
		Email:              strings.ToLower(strings.TrimSpace(req.Email)),
		Grade:              req.GradeLevel,
		GradeCategory:      gradeInfo.Category,
		GradeTier:          gradeInfo.Tier,
		IsActive:           true,
		EmailVerified:      false,
		TrialStartDate:     &trialStart,
		TrialEndDate:       &trialEnd,
		SubscriptionStatus: "trial",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	// Insert user into database
	_, err = db.Exec(ctx, `
		INSERT INTO users (
			id, first_name, last_name, email, password_hash, grade, 
			grade_category, grade_tier, is_active, email_verified,
			trial_start_date, trial_end_date, subscription_status,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`, 
		user.ID, user.FirstName, user.LastName, user.Email, hashedPassword,
		user.Grade, user.GradeCategory, user.GradeTier, user.IsActive,
		user.EmailVerified, user.TrialStartDate, user.TrialEndDate,
		user.SubscriptionStatus, user.CreatedAt, user.UpdatedAt,
	)

	if err != nil {
		return nil, &auth.Error{
			Code:    "DATABASE_ERROR", 
			Message: "Failed to create user account",
		}
	}

	// Generate JWT tokens
	token, refreshToken, expiresIn, err := generateTokens(userID)
	if err != nil {
		return nil, &auth.Error{
			Code:    "TOKEN_ERROR",
			Message: "Failed to generate authentication tokens",
		}
	}

	// Store refresh token
	err = storeRefreshToken(ctx, userID, refreshToken, time.Now().AddDate(0, 0, 30))
	if err != nil {
		return nil, &auth.Error{
			Code:    "TOKEN_STORAGE_ERROR",
			Message: "Failed to store authentication tokens",
		}
	}

	// Initialize user progress for their tier (async)
	go initializeUserProgress(ctx, userID, user.GradeCategory)

	// Send welcome email with email verification (async)
	go sendWelcomeEmail(ctx, user)

	// Log registration activity
	go logActivity(ctx, userID, "user_registered", map[string]interface{}{
		"grade":         user.Grade,
		"grade_tier":    user.GradeTier,
		"trial_expires": user.TrialEndDate,
	})

	return &AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
		Message:      "Account created successfully! Your 7-day free trial has started.",
	}, nil
}

// Login to Tusome platform
//encore:api public method=POST path=/auth/login
func Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	// Validate login request
	if err := validateLogin(req); err != nil {
		return nil, err
	}

	// Get user by email
	user, err := getUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, &auth.Error{
			Code:    "INVALID_CREDENTIALS",
			Message: "Invalid email or password",
		}
	}

	// Verify password
	valid, err := verifyPassword(ctx, user.ID, req.Password)
	if err != nil || !valid {
		// Log failed login attempt
		go logActivity(ctx, user.ID, "login_failed", map[string]interface{}{
			"reason": "invalid_password",
			"ip":     getClientIP(ctx),
		})
		
		return nil, &auth.Error{
			Code:    "INVALID_CREDENTIALS",
			Message: "Invalid email or password",
		}
	}

	// Check if user is active
	if !user.IsActive {
		return nil, &auth.Error{
			Code:    "ACCOUNT_INACTIVE",
			Message: "Your account has been deactivated. Please contact support.",
		}
	}

	// Check trial/subscription status
	if user.SubscriptionStatus == "expired" {
		return nil, &auth.Error{
			Code:    "SUBSCRIPTION_EXPIRED",
			Message: "Your subscription has expired. Please renew to continue learning.",
		}
	}

	// Generate new tokens
	token, refreshToken, expiresIn, err := generateTokens(user.ID)
	if err != nil {
		return nil, &auth.Error{
			Code:    "TOKEN_ERROR",
			Message: "Failed to generate authentication tokens",
		}
	}

	// Store new refresh token
	err = storeRefreshToken(ctx, user.ID, refreshToken, time.Now().AddDate(0, 0, 30))
	if err != nil {
		return nil, &auth.Error{
			Code:    "TOKEN_STORAGE_ERROR",
			Message: "Failed to store authentication tokens",
		}
	}

	// Update last login time
	now := time.Now()
	_, err = db.Exec(ctx, `UPDATE users SET last_login_at = $1, updated_at = $2 WHERE id = $3`, 
		now, now, user.ID)
	if err != nil {
		// Log error but don't fail login
		fmt.Printf("Failed to update last login time for user %s: %v\n", user.ID, err)
	}

	// Update user with last login time
	user.LastLoginAt = &now

	// Log successful login
	go logActivity(ctx, user.ID, "user_login", map[string]interface{}{
		"ip":                getClientIP(ctx),
		"subscription_status": user.SubscriptionStatus,
	})

	// Determine welcome message based on subscription status
	var message string
	if user.SubscriptionStatus == "trial" && user.TrialEndDate != nil {
		daysLeft := int(time.Until(*user.TrialEndDate).Hours() / 24)
		if daysLeft > 0 {
			message = fmt.Sprintf("Welcome back! You have %d days left in your free trial.", daysLeft)
		} else {
			message = "Welcome back! Your trial has expired. Please subscribe to continue."
		}
	} else {
		message = "Welcome back to Tusome!"
	}

	return &AuthResponse{
		User:         *user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
		Message:      message,
	}, nil
}

// Get current user profile
//encore:api auth method=GET path=/auth/profile
func GetProfile(ctx context.Context) (*User, error) {
	userID := auth.UserID()

	user, err := getUserByID(ctx, userID)
	if err != nil {
		return nil, &auth.Error{
			Code:    "USER_NOT_FOUND",
			Message: "User profile not found",
		}
	}

	return user, nil
}

// Update user profile
//encore:api auth method=PUT path=/auth/profile
func UpdateProfile(ctx context.Context, updates *User) (*User, error) {
	userID := auth.UserID()

	// Update allowed fields only (security consideration)
	_, err := db.Exec(ctx, `
		UPDATE users 
		SET first_name = $1, last_name = $2, profile_image = $3, updated_at = $4
		WHERE id = $5
	`, updates.FirstName, updates.LastName, updates.ProfileImage, time.Now(), userID)

	if err != nil {
		return nil, &auth.Error{
			Code:    "UPDATE_ERROR",
			Message: "Failed to update profile",
		}
	}

	// Log profile update
	go logActivity(ctx, userID, "profile_updated", nil)

	// Return updated user
	return getUserByID(ctx, userID)
}

// Refresh authentication token
//encore:api public method=POST path=/auth/refresh
func RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error) {
	if refreshToken == "" {
		return nil, &auth.Error{
			Code:    "MISSING_TOKEN",
			Message: "Refresh token is required",
		}
	}

	// Validate refresh token and get user ID
	userID, err := validateRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, &auth.Error{
			Code:    "INVALID_TOKEN",
			Message: "Invalid or expired refresh token",
		}
	}

	// Get user
	user, err := getUserByID(ctx, userID)
	if err != nil {
		return nil, &auth.Error{
			Code:    "USER_NOT_FOUND",
			Message: "User not found",
		}
	}

	// Check if user is still active
	if !user.IsActive {
		return nil, &auth.Error{
			Code:    "ACCOUNT_INACTIVE",
			Message: "Account has been deactivated",
		}
	}

	// Generate new tokens
	newToken, newRefreshToken, expiresIn, err := generateTokens(userID)
	if err != nil {
		return nil, &auth.Error{
			Code:    "TOKEN_ERROR",
			Message: "Failed to generate new tokens",
		}
	}

	// Store new refresh token and invalidate old one
	err = storeRefreshToken(ctx, userID, newRefreshToken, time.Now().AddDate(0, 0, 30))
	if err != nil {
		return nil, &auth.Error{
			Code:    "TOKEN_STORAGE_ERROR",
			Message: "Failed to store new tokens",
		}
	}

	// Invalidate old refresh token
	go invalidateRefreshToken(ctx, refreshToken)

	return &AuthResponse{
		User:         *user,
		Token:        newToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    expiresIn,
		Message:      "Tokens refreshed successfully",
	}, nil
}

// Logout user and invalidate tokens
//encore:api auth method=POST path=/auth/logout
func Logout(ctx context.Context, refreshToken string) error {
	userID := auth.UserID()

	// Invalidate refresh token if provided
	if refreshToken != "" {
		go invalidateRefreshToken(ctx, refreshToken)
	}

	// Log logout activity
	go logActivity(ctx, userID, "user_logout", nil)

	return nil
}

// Request password reset
//encore:api public method=POST path=/auth/forgot-password
func ForgotPassword(ctx context.Context, email string) error {
	if email == "" {
		return &auth.Error{
			Code:    "MISSING_EMAIL",
			Message: "Email address is required",
		}
	}

	// Check if user exists (don't reveal if email exists or not for security)
	user, err := getUserByEmail(ctx, email)
	if err == nil && user != nil {
		// Generate password reset token
		resetToken := generateResetToken()
		expiresAt := time.Now().Add(1 * time.Hour) // 1 hour expiry

		// Store reset token
		_, err = db.Exec(ctx, `
			INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
			VALUES ($1, $2, $3, $4)
		`, user.ID, hashToken(resetToken), expiresAt, time.Now())

		if err == nil {
			// Send password reset email (async)
			go sendPasswordResetEmail(ctx, *user, resetToken)
			
			// Log password reset request
			go logActivity(ctx, user.ID, "password_reset_requested", nil)
		}
	}

	// Always return success to prevent email enumeration
	return nil
}

// Verify email address
//encore:api public method=POST path=/auth/verify-email
func VerifyEmail(ctx context.Context, token string) error {
	if token == "" {
		return &auth.Error{
			Code:    "MISSING_TOKEN",
			Message: "Verification token is required",
		}
	}

	// Find user by verification token
	var userID string
	err := db.QueryRow(ctx, `
		SELECT user_id FROM email_verification_tokens 
		WHERE token_hash = $1 AND expires_at > $2 AND used_at IS NULL
	`, hashToken(token), time.Now()).Scan(&userID)

	if err != nil {
		return &auth.Error{
			Code:    "INVALID_TOKEN",
			Message: "Invalid or expired verification token",
		}
	}

	// Mark email as verified
	_, err = db.Exec(ctx, `
		UPDATE users SET email_verified = true, updated_at = $1 WHERE id = $2
	`, time.Now(), userID)

	if err != nil {
		return &auth.Error{
			Code:    "VERIFICATION_ERROR",
			Message: "Failed to verify email",
		}
	}

	// Mark token as used
	_, err = db.Exec(ctx, `
		UPDATE email_verification_tokens SET used_at = $1 WHERE token_hash = $2
	`, time.Now(), hashToken(token))

	// Log email verification
	go logActivity(ctx, userID, "email_verified", nil)

	return nil
}

// Helper functions implementation will go here...
// (I'll continue with the helper functions in the next part due to length)