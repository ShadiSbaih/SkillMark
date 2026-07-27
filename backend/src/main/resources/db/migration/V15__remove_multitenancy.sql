-- V15: Remove multi-tenancy (organizations, memberships, invitations) in accordance with the new PRD
ALTER TABLE programs DROP COLUMN IF EXISTS organization_id;
ALTER TABLE certificates DROP COLUMN IF EXISTS organization_id;
ALTER TABLE certificates DROP COLUMN IF EXISTS organization_name_snapshot;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS organization_id;

DROP TABLE IF EXISTS invitation_links CASCADE;
DROP TABLE IF EXISTS organization_memberships CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
