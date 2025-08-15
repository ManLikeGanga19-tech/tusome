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