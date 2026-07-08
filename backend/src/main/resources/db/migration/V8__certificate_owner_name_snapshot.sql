-- Add owner name snapshot to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS owner_name_snapshot VARCHAR(150);
