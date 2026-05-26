ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS visible_to_participants boolean NOT NULL DEFAULT true;

ALTER TABLE program_resources
    ADD COLUMN IF NOT EXISTS visible_to_participants boolean NOT NULL DEFAULT true;
