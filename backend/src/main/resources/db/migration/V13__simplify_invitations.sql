ALTER TABLE invitation_links
    DROP COLUMN IF EXISTS max_uses,
    DROP COLUMN IF EXISTS used_count,
    DROP COLUMN IF EXISTS expires_at;
