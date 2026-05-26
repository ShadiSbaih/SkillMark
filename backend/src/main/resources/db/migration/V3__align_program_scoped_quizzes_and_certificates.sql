ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id),
    ADD COLUMN IF NOT EXISTS program_title_snapshot VARCHAR(255),
    ADD COLUMN IF NOT EXISTS pdf_object_key TEXT,
    ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
    ADD COLUMN IF NOT EXISTS qr_code_object_key TEXT;

DO $$
DECLARE
    has_old_quiz_org_column BOOLEAN;
    has_new_quiz_program_column BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quizzes' AND column_name = 'organization_id'
    ) INTO has_old_quiz_org_column;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quizzes' AND column_name = 'program_id'
    ) INTO has_new_quiz_program_column;

    IF has_old_quiz_org_column AND NOT has_new_quiz_program_column THEN
        INSERT INTO programs (organization_id, title, description, status, is_published, created_at, updated_at)
        SELECT DISTINCT q.organization_id, 'Migrated Quizzes', 'Program created to preserve pre-program quiz data.', 'PUBLISHED', true, now(), now()
        FROM quizzes q
        WHERE NOT EXISTS (
            SELECT 1 FROM programs p
            WHERE p.organization_id = q.organization_id AND p.title = 'Migrated Quizzes'
        );

        ALTER TABLE quizzes ADD COLUMN program_id UUID REFERENCES programs(id);

        UPDATE quizzes q
        SET program_id = p.id
        FROM programs p
        WHERE p.organization_id = q.organization_id
          AND p.title = 'Migrated Quizzes'
          AND q.program_id IS NULL;

        ALTER TABLE quizzes ALTER COLUMN program_id SET NOT NULL;
        ALTER TABLE quizzes DROP COLUMN organization_id;
    END IF;
END $$;

UPDATE certificates c
SET program_id = q.program_id,
    program_title_snapshot = COALESCE(c.program_title_snapshot, p.title)
FROM quizzes q
JOIN programs p ON p.id = q.program_id
WHERE c.quiz_id = q.id
  AND (c.program_id IS NULL OR c.program_title_snapshot IS NULL);

ALTER TABLE certificates
    ALTER COLUMN program_id SET NOT NULL,
    ALTER COLUMN program_title_snapshot SET NOT NULL;

DROP INDEX IF EXISTS idx_quizzes_organization_id;
CREATE INDEX IF NOT EXISTS idx_quizzes_program_id ON quizzes(program_id);
CREATE INDEX IF NOT EXISTS idx_certificates_program_id ON certificates(program_id);
CREATE INDEX IF NOT EXISTS idx_certificates_quiz_id ON certificates(quiz_id);
