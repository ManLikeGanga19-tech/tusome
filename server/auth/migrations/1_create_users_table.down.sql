-- auth/migrations/1_create_users_table.up.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main users table matching your signup form exactly
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    grade VARCHAR(20) NOT NULL CHECK (grade IN (
        'grade-4', 'grade-5', 'grade-6',    -- Primary CBC
        'grade-7', 'grade-8', 'grade-9',    -- Junior Secondary  
        'grade-10', 'grade-11', 'grade-12'  -- Senior Secondary
    )),
    grade_category VARCHAR(20) NOT NULL CHECK (grade_category IN ('primary', 'junior', 'senior')),
    grade_tier VARCHAR(100) NOT NULL CHECK (grade_tier IN ('Primary CBC', 'Junior Secondary', 'Senior Secondary')),
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_grade_category ON users(grade_category);
CREATE INDEX idx_users_grade ON users(grade);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_trial_end ON users(trial_end_date);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL, -- SHA256 hash of the actual token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL, -- SHA256 hash of the actual token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_hash ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_expires ON email_verification_tokens(expires_at);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL, -- SHA256 hash of the actual token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

-- User activities for audit trail and analytics
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'user_registered', 'user_login', 'password_reset_requested', etc.
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- Additional data specific to the activity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- User sessions for tracking active sessions (optional, for enhanced security)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(64) NOT NULL, -- Hashed session identifier
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at when users table is modified
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Cleanup function for expired tokens (call this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Clean up expired refresh tokens
    DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up expired email verification tokens
    DELETE FROM email_verification_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Clean up expired password reset tokens
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Clean up expired user sessions
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create a view for user statistics (useful for analytics)
CREATE VIEW user_stats AS
SELECT 
    grade_category,
    grade_tier,
    subscription_status,
    COUNT(*) as user_count,
    COUNT(CASE WHEN email_verified THEN 1 END) as verified_users,
    COUNT(CASE WHEN last_login_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as active_weekly,
    COUNT(CASE WHEN last_login_at > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 1 END) as active_monthly,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at))/86400) as avg_days_since_signup
FROM users 
WHERE is_active = true
GROUP BY grade_category, grade_tier, subscription_status;

-- Insert initial grade configuration data (optional reference table)
CREATE TABLE grade_configurations (
    grade_code VARCHAR(20) PRIMARY KEY,
    grade_label VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    tier VARCHAR(100) NOT NULL,
    monthly_price_ksh INTEGER NOT NULL,
    subjects TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the grade data that matches your frontend exactly
INSERT INTO grade_configurations (grade_code, grade_label, category, tier, monthly_price_ksh, subjects) VALUES
('grade-4', 'Grade 4', 'primary', 'Primary CBC', 499, ARRAY['Mathematics', 'English', 'Kiswahili', 'Environmental Studies', 'Creative Arts']),
('grade-5', 'Grade 5', 'primary', 'Primary CBC', 499, ARRAY['Mathematics', 'English', 'Kiswahili', 'Environmental Studies', 'Creative Arts']),
('grade-6', 'Grade 6', 'primary', 'Primary CBC', 499, ARRAY['Mathematics', 'English', 'Kiswahili', 'Environmental Studies', 'Creative Arts']),
('grade-7', 'Grade 7', 'junior', 'Junior Secondary', 899, ARRAY['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'Creative Arts']),
('grade-8', 'Grade 8', 'junior', 'Junior Secondary', 899, ARRAY['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'Creative Arts']),
('grade-9', 'Grade 9', 'junior', 'Junior Secondary', 899, ARRAY['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'Creative Arts']),
('grade-10', 'Grade 10', 'senior', 'Senior Secondary', 1499, ARRAY['Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History']),
('grade-11', 'Grade 11', 'senior', 'Senior Secondary', 1499, ARRAY['Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History']),
('grade-12', 'Grade 12', 'senior', 'Senior Secondary', 1499, ARRAY['Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History']);

-- Down migration
-- auth/migrations/1_create_users_table.down.sql
DROP VIEW IF EXISTS user_stats;
DROP FUNCTION IF EXISTS cleanup_expired_tokens();
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS email_verification_tokens;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS grade_configurations;
DROP TABLE IF EXISTS users;
DROP EXTENSION IF EXISTS "uuid-ossp";