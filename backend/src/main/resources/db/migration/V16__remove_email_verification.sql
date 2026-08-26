-- V16: Remove email verification columns (registration is now instant, no email verification required)
ALTER TABLE users
    DROP COLUMN IF EXISTS email_verification_token,
    DROP COLUMN IF EXISTS email_verification_expires_at;
