UPDATE programs
SET status = 'ARCHIVED'
WHERE status = 'DELETED';

UPDATE quizzes
SET status = 'ARCHIVED'
WHERE status = 'DELETED';

UPDATE programs
SET is_published = (status = 'PUBLISHED');

UPDATE quizzes
SET is_published = (status = 'PUBLISHED');

ALTER TABLE programs
    DROP CONSTRAINT IF EXISTS chk_program_status_values,
    DROP CONSTRAINT IF EXISTS chk_program_is_published_matches_status;

ALTER TABLE programs
    ADD CONSTRAINT chk_program_status_values
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    ADD CONSTRAINT chk_program_is_published_matches_status
        CHECK (is_published = (status = 'PUBLISHED'));

ALTER TABLE quizzes
    DROP CONSTRAINT IF EXISTS chk_quiz_status_values,
    DROP CONSTRAINT IF EXISTS chk_quiz_is_published_matches_status;

ALTER TABLE quizzes
    ADD CONSTRAINT chk_quiz_status_values
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    ADD CONSTRAINT chk_quiz_is_published_matches_status
        CHECK (is_published = (status = 'PUBLISHED'));
