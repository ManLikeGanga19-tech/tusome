// auth/helpers.go - Helper functions for Tusome authentication
package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"encore.dev/beta/auth"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// JWT configuration
const (
	jwtSecret = "your-super-secret-jwt-key-change-in-production" // Use environment variable in production
	tokenExpiry = 24 * time.Hour // 24 hours
)

// Custom JWT claims
type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Grade  string `json:"grade"`
	Tier   string `json:"tier"`
	jwt.RegisteredClaims
}

// Validation functions
func validateRegistration(req *RegisterRequest) error {
	// Check required fields
	if strings.TrimSpace(req.FirstName) == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "First name is required"}
	}
	if strings.TrimSpace(req.LastName) == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Last name is required"}
	}
	if strings.TrimSpace(req.Email) == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Email is required"}
	}
	if req.Password == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Password is required"}
	}
	if req.Grade == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Grade level is required"}
	}

	// Validate name lengths
	if len(strings.TrimSpace(req.FirstName)) < 2 || len(strings.TrimSpace(req.FirstName)) > 50 {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "First name must be between 2 and 50 characters"}
	}
	if len(strings.TrimSpace(req.LastName)) < 2 || len(strings.TrimSpace(req.LastName)) > 50 {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Last name must be between 2 and 50 characters"}
	}

	// Validate email format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Invalid email format"}
	}

	// Validate password strength
	if len(req.Password) < 8 {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Password must be at least 8 characters long"}
	}

	// Check password confirmation
	if req.Password != req.ConfirmPassword {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Password and confirmation do not match"}
	}

	// Check terms agreement
	if !req.AgreeTerms {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "You must agree to the Terms of Service and Privacy Policy"}
	}

	// Validate grade level
	if _, exists := gradeConfig[req.GradeLevel]; !exists {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Invalid grade level selected"}
	}

	return nil
}

func validateLogin(req *LoginRequest) error {
	if strings.TrimSpace(req.Email) == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Email is required"}
	}
	if req.Password == "" {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Password is required"}
	}

	// Validate email format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return &auth.Error{Code: "VALIDATION_ERROR", Message: "Invalid email format"}
	}

	return nil
}

// Password functions
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func verifyPassword(ctx context.Context, userID, password string) (bool, error) {
	var hashedPassword string
	err := db.QueryRow(ctx, "SELECT password_hash FROM users WHERE id = $1", userID).Scan(&hashedPassword)
	if err != nil {
		return false, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil, nil
}

// User database functions
func checkUserExists(ctx context.Context, email string) (bool, error) {
	var count int
	err := db.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE email = $1", strings.ToLower(email)).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func getUserByEmail(ctx context.Context, email string) (*User, error) {
	user := &User{}
	err := db.QueryRow(ctx, `
		SELECT id, first_name, last_name, email, grade, grade_category, grade_tier,
			   profile_image, is_active, email_verified, trial_start_date, trial_end_date,
			   subscription_status, created_at, updated_at, last_login_at
		FROM users WHERE email = $1
	`, strings.ToLower(email)).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Grade,
		&user.GradeCategory, &user.GradeTier, &user.ProfileImage, &user.IsActive,
		&user.EmailVerified, &user.TrialStartDate, &user.TrialEndDate,
		&user.SubscriptionStatus, &user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

func getUserByID(ctx context.Context, userID string) (*User, error) {
	user := &User{}
	err := db.QueryRow(ctx, `
		SELECT id, first_name, last_name, email, grade, grade_category, grade_tier,
			   profile_image, is_active, email_verified, trial_start_date, trial_end_date,
			   subscription_status, created_at, updated_at, last_login_at
		FROM users WHERE id = $1
	`, userID).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Grade,
		&user.GradeCategory, &user.GradeTier, &user.ProfileImage, &user.IsActive,
		&user.EmailVerified, &user.TrialStartDate, &user.TrialEndDate,
		&user.SubscriptionStatus, &user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

// Token functions
func generateUserID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func generateTokens(userID string) (token, refreshToken string, expiresIn int64, err error) {
	// Get user details for token
	user, err := getUserByID(context.Background(), userID)
	if err != nil {
		return "", "", 0, err
	}

	// Create JWT token
	now := time.Now()
	expiresAt := now.Add(tokenExpiry)
	
	claims := JWTClaims{
		UserID: userID,
		Email:  user.Email,
		Grade:  user.Grade,
		Tier:   user.GradeTier,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "tusome",
			Subject:   userID,
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := jwtToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", "", 0, err
	}

	// Generate refresh token
	refreshBytes := make([]byte, 32)
	rand.Read(refreshBytes)
	refreshTokenString := hex.EncodeToString(refreshBytes)

	return tokenString, refreshTokenString, int64(tokenExpiry.Seconds()), nil
}

func storeRefreshToken(ctx context.Context, userID, refreshToken string, expiresAt time.Time) error {
	// Hash the refresh token before storing
	hashedToken := hashToken(refreshToken)
	
	_, err := db.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4)
	`, userID, hashedToken, expiresAt, time.Now())
	
	return err
}

func validateRefreshToken(ctx context.Context, refreshToken string) (string, error) {
	hashedToken := hashToken(refreshToken)
	
	var userID string
	err := db.QueryRow(ctx, `
		SELECT user_id FROM refresh_tokens 
		WHERE token_hash = $1 AND expires_at > $2
	`, hashedToken, time.Now()).Scan(&userID)
	
	if err == sql.ErrNoRows {
		return "", fmt.Errorf("invalid or expired refresh token")
	}
	if err != nil {
		return "", err
	}
	
	return userID, nil
}

func invalidateRefreshToken(ctx context.Context, refreshToken string) {
	hashedToken := hashToken(refreshToken)
	db.Exec(ctx, "DELETE FROM refresh_tokens WHERE token_hash = $1", hashedToken)
}

// Utility functions
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func generateResetToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func getClientIP(ctx context.Context) string {
	// Try to get IP from various headers in order of preference
	if req, ok := ctx.Value(http.Request{}).(*http.Request); ok {
		// Check X-Forwarded-For header first
		if xff := req.Header.Get("X-Forwarded-For"); xff != "" {
			ips := strings.Split(xff, ",")
			return strings.TrimSpace(ips[0])
		}
		
		// Check X-Real-IP header
		if xri := req.Header.Get("X-Real-IP"); xri != "" {
			return xri
		}
		
		// Fall back to RemoteAddr
		return req.RemoteAddr
	}
	
	return "unknown"
}

// Activity logging
func logActivity(ctx context.Context, userID, activityType string, metadata map[string]interface{}) {
	// This would typically log to a separate activities table
	// For now, we'll just log to console in development
	fmt.Printf("Activity Log - User: %s, Type: %s, Metadata: %+v\n", userID, activityType, metadata)
	
	// In production, you'd insert into an activities table:
	// INSERT INTO user_activities (user_id, activity_type, metadata, ip_address, created_at)
	// VALUES ($1, $2, $3, $4, $5)
}

// Email functions (async operations)
func sendWelcomeEmail(ctx context.Context, user User) {
	// Generate email verification token
	verificationToken := generateResetToken() // Reuse the same token generation
	expiresAt := time.Now().Add(24 * time.Hour) // 24 hours to verify email
	
	// Store verification token
	_, err := db.Exec(ctx, `
		INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4)
	`, user.ID, hashToken(verificationToken), expiresAt, time.Now())
	
	if err != nil {
		fmt.Printf("Failed to store email verification token for user %s: %v\n", user.ID, err)
		return
	}
	
	// In production, you would send actual email here
	fmt.Printf(`
===== WELCOME EMAIL =====
To: %s
Subject: Welcome to Tusome - Verify Your Email

Hi %s,

Welcome to Tusome! Your 7-day free trial for %s has started.

Please verify your email by clicking the link below:
https://tusome.ke/auth/verify-email?token=%s

Your trial includes:
- Full access to %s curriculum
- Interactive lessons and quizzes
- Progress tracking
- Mobile-optimized learning

Trial expires: %s

Best regards,
The Tusome Team
========================
`, user.Email, user.FirstName, user.GradeTier, verificationToken, 
   user.GradeTier, user.TrialEndDate.Format("January 2, 2006"))
}

func sendPasswordResetEmail(ctx context.Context, user User, resetToken string) {
	// In production, i will send actual email here
	fmt.Printf(`
===== PASSWORD RESET EMAIL =====
To: %s
Subject: Reset Your Tusome Password

Hi %s,

You requested to reset your password for your Tusome account.

Click the link below to reset your password:
https://tusome.ke/auth/reset-password?token=%s

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
The Tusome Team
===============================
`, user.Email, user.FirstName, resetToken)
}

// Progress initialization
func initializeUserProgress(ctx context.Context, userID, gradeCategory string) {
	// This would typically initialize the user's progress for their grade level
	// Create entries in progress tables for subjects available to their tier
	
	var subjects []string
	switch gradeCategory {
	case "primary":
		subjects = []string{"mathematics", "english", "kiswahili", "environmental-studies", "creative-arts"}
	case "junior":
		subjects = []string{"mathematics", "english", "kiswahili", "integrated-science", "social-studies", "creative-arts"}
	case "senior":
		subjects = []string{"mathematics", "english", "kiswahili", "physics", "chemistry", "biology", "geography", "history"}
	}
	
	fmt.Printf("Initializing progress for user %s with subjects: %v\n", userID, subjects)
	
	// In production, you would:
	// 1. Insert records into user_subject_progress table
	// 2. Set up initial lesson progress tracking
	// 3. Create achievement tracking entries
}