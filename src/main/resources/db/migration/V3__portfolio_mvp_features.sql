ALTER TABLE certificates
    ADD COLUMN certificate_code VARCHAR(50),
    ADD COLUMN verification_url VARCHAR(255),
    ADD COLUMN issued_at TIMESTAMPTZ;

UPDATE certificates
SET certificate_code = 'COHIVE-' || EXTRACT(YEAR FROM created_at)::int || '-' || upper(substring(replace(id::text, '-', ''), 1, 8)),
    verification_url = '/api/v1/certificates/verify/' || 'COHIVE-' || EXTRACT(YEAR FROM created_at)::int || '-' || upper(substring(replace(id::text, '-', ''), 1, 8)),
    issued_at = created_at
WHERE certificate_code IS NULL;

ALTER TABLE certificates
    ALTER COLUMN certificate_code SET NOT NULL,
    ALTER COLUMN verification_url SET NOT NULL,
    ALTER COLUMN issued_at SET NOT NULL,
    ADD CONSTRAINT uq_certificates_certificate_code UNIQUE (certificate_code);

ALTER TABLE quizzes
    ADD COLUMN passing_score INTEGER NOT NULL DEFAULT 70,
    ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text VARCHAR(1000) NOT NULL,
    points INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id UUID NOT NULL REFERENCES quiz_options(id) ON DELETE CASCADE,
    correct BOOLEAN NOT NULL,
    points_awarded INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quiz_attempt_answers_question UNIQUE (attempt_id, question_id)
);

CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content VARCHAR(4000) NOT NULL,
    resource_url VARCHAR(2000),
    display_order INTEGER NOT NULL,
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX idx_quiz_attempts_quiz_student ON quiz_attempts(quiz_id, student_id);
CREATE INDEX idx_quiz_attempt_answers_attempt ON quiz_attempt_answers(attempt_id);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);

INSERT INTO course_modules (id, title, display_order, course_id, created_at, updated_at) VALUES
    ('11110000-0000-0000-0000-000000000001', 'Backend Foundations', 1, '10101010-1010-1010-1010-101010101010', now(), now()),
    ('11110000-0000-0000-0000-000000000002', 'REST API Delivery', 2, '10101010-1010-1010-1010-101010101010', now(), now()),
    ('22220000-0000-0000-0000-000000000001', 'Analytics Thinking', 1, '20202020-2020-2020-2020-202020202020', now(), now()),
    ('33330000-0000-0000-0000-000000000001', 'Relational Design', 1, '30303030-3030-3030-3030-303030303030', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, title, content, resource_url, display_order, module_id, created_at, updated_at) VALUES
    ('aaaa0000-0000-0000-0000-000000000001', 'Project Setup', 'Prepare a Spring Boot API project with validation, JPA, and PostgreSQL dependencies.', 'https://spring.io/guides', 1, '11110000-0000-0000-0000-000000000001', now(), now()),
    ('aaaa0000-0000-0000-0000-000000000002', 'Entity Modeling', 'Model users, organizations, courses, and enrollments with clean relationships.', null, 2, '11110000-0000-0000-0000-000000000001', now(), now()),
    ('aaaa0000-0000-0000-0000-000000000003', 'Secure Controllers', 'Expose authenticated REST endpoints with role-aware service checks.', 'https://restfulapi.net/', 1, '11110000-0000-0000-0000-000000000002', now(), now()),
    ('bbbb0000-0000-0000-0000-000000000001', 'Metric Selection', 'Choose activation and retention metrics that match the product workflow.', 'https://www.reforge.com/blog/product-metrics', 1, '22220000-0000-0000-0000-000000000001', now(), now()),
    ('cccc0000-0000-0000-0000-000000000001', 'Schema Constraints', 'Use primary keys, foreign keys, unique constraints, and indexes to protect data integrity.', 'https://www.postgresql.org/docs/', 1, '33330000-0000-0000-0000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO resources (id, title, type, url, course_id, created_at, updated_at) VALUES
    ('abcabcab-5555-5555-5555-abcabcabcabc', 'Spring Boot Checklist Document', 'DOCUMENT', 'https://docs.spring.io/spring-boot/reference/using/index.html', '10101010-1010-1010-1010-101010101010', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_questions (id, quiz_id, question_text, points, display_order, created_at, updated_at) VALUES
    ('10000000-0000-0000-0000-000000000001', 'f1f1f1f1-1111-1111-1111-f1f1f1f1f1f1', 'Which Spring component exposes HTTP endpoints?', 10, 1, now(), now()),
    ('10000000-0000-0000-0000-000000000002', 'f1f1f1f1-1111-1111-1111-f1f1f1f1f1f1', 'Which layer should enforce business rules?', 10, 2, now(), now()),
    ('30000000-0000-0000-0000-000000000001', 'f4f4f4f4-4444-4444-4444-f4f4f4f4f4f4', 'What protects relationships between tables?', 10, 1, now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_options (id, question_id, option_text, is_correct, display_order, created_at, updated_at) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Controller', true, 1, now(), now()),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Repository', false, 2, now(), now()),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Service', true, 1, now(), now()),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'DTO', false, 2, now(), now()),
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Foreign keys', true, 1, now(), now()),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Plain text descriptions', false, 2, now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_attempts (id, quiz_id, student_id, score, max_score, percentage, passed, submitted_at, created_at, updated_at) VALUES
    ('50000000-0000-0000-0000-000000000001', 'f1f1f1f1-1111-1111-1111-f1f1f1f1f1f1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 20, 20, 100.00, true, now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_attempt_answers (id, attempt_id, question_id, selected_option_id, correct, points_awarded, created_at, updated_at) VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', true, 10, now(), now()),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', true, 10, now(), now())
ON CONFLICT (id) DO NOTHING;
