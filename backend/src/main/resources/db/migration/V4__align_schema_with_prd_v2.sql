ALTER TABLE organization_memberships
    ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS removed_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

UPDATE organization_memberships
SET joined_at = COALESCE(joined_at, created_at, now())
WHERE joined_at IS NULL;

ALTER TABLE organization_memberships
    ALTER COLUMN joined_at SET NOT NULL;

ALTER TABLE organization_memberships
    DROP CONSTRAINT IF EXISTS uq_membership_org_user;

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_org_membership
    ON organization_memberships (organization_id, user_id)
    WHERE status = 'ACTIVE';

ALTER TABLE invitation_links
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;

ALTER TABLE programs
    ALTER COLUMN start_date TYPE DATE USING start_date::DATE,
    ALTER COLUMN end_date TYPE DATE USING end_date::DATE;

ALTER TABLE quiz_attempts
    ADD COLUMN IF NOT EXISTS attempt_number INT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS total_points INT,
    ADD COLUMN IF NOT EXISTS earned_points INT,
    ADD COLUMN IF NOT EXISTS is_passed BOOLEAN;

WITH numbered_attempts AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY quiz_id, user_id ORDER BY started_at, id) AS attempt_number
    FROM quiz_attempts
)
UPDATE quiz_attempts qa
SET attempt_number = numbered_attempts.attempt_number
FROM numbered_attempts
WHERE qa.id = numbered_attempts.id
  AND qa.attempt_number IS NULL;

UPDATE quiz_attempts qa
SET expires_at = qa.started_at + (COALESCE(q.duration_minutes, 0) || ' minutes')::interval
FROM quizzes q
WHERE qa.quiz_id = q.id
  AND qa.expires_at IS NULL;

UPDATE quiz_attempts qa
SET total_points = totals.total_points
FROM (
    SELECT quiz_id, COALESCE(SUM(ROUND(points)), 0)::INT AS total_points
    FROM quiz_questions
    GROUP BY quiz_id
) totals
WHERE qa.quiz_id = totals.quiz_id
  AND qa.total_points IS NULL
  AND qa.status = 'SUBMITTED';

UPDATE quiz_attempts
SET earned_points = ROUND(score)::INT
WHERE earned_points IS NULL
  AND score IS NOT NULL;

UPDATE quiz_attempts
SET is_passed = passed
WHERE is_passed IS NULL
  AND passed IS NOT NULL;

ALTER TABLE quiz_attempts
    ALTER COLUMN attempt_number SET NOT NULL,
    ALTER COLUMN expires_at SET NOT NULL;

ALTER TABLE quizzes
    ALTER COLUMN passing_score TYPE INT USING ROUND(passing_score)::INT;

UPDATE quizzes
SET duration_minutes = 30
WHERE duration_minutes IS NULL;

ALTER TABLE quizzes
    ALTER COLUMN duration_minutes SET NOT NULL;

ALTER TABLE quiz_questions
    ALTER COLUMN points TYPE INT USING ROUND(points)::INT;

ALTER TABLE quiz_attempt_answers
    ALTER COLUMN selected_option_id DROP NOT NULL,
    ALTER COLUMN points_awarded TYPE INT USING ROUND(points_awarded)::INT;

ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100),
    ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE audit_logs
    ALTER COLUMN metadata TYPE JSONB USING
        CASE
            WHEN metadata IS NULL THEN NULL
            ELSE to_jsonb(metadata)
        END;

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org_id ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user_id ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_deleted_at ON programs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program_user ON program_enrollments(program_id, user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_links_org_id ON invitation_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitation_links_status ON invitation_links(status);
CREATE INDEX IF NOT EXISTS idx_program_resources_type ON program_resources(type);
CREATE INDEX IF NOT EXISTS idx_program_resources_status ON program_resources(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_deleted_at ON quizzes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_position ON quiz_questions(quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_position ON quiz_options(question_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_user ON quiz_attempts(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_id ON quiz_attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

DROP INDEX IF EXISTS uq_active_certificate_per_user_quiz;
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_certificate_user_quiz
    ON certificates (user_id, quiz_id)
    WHERE status = 'ACTIVE';
