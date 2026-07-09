INSERT INTO users (id, name, email, avatar_url, status, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000101', 'Maya Carter', 'maya.owner@skillmark.local', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'ACTIVE', now(), now()),
    ('00000000-0000-0000-0000-000000000102', 'Omar Haddad', 'omar.learner@skillmark.local', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'ACTIVE', now(), now()),
    ('00000000-0000-0000-0000-000000000103', 'Lina Mansour', 'lina.learner@skillmark.local', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 'ACTIVE', now(), now())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO organizations (id, name, description, logo_url, owner_id, status, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000201',
    'Skillmark Demo Academy',
    'Demo organization for validating programs, quizzes, enrollments, and certificates.',
    'https://images.unsplash.com/photo-1562774053-701939374585',
    '00000000-0000-0000-0000-000000000101',
    'ACTIVE',
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    logo_url = EXCLUDED.logo_url,
    owner_id = EXCLUDED.owner_id,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO organization_memberships (
    id, organization_id, user_id, role, status, invited_by, joined_at, created_at, updated_at
)
VALUES
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'OWNER', 'ACTIVE', NULL, now(), now(), now()),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', 'PARTICIPANT', 'ACTIVE', '00000000-0000-0000-0000-000000000101', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000103', 'PARTICIPANT', 'ACTIVE', '00000000-0000-0000-0000-000000000101', now(), now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO programs (
    id, organization_id, title, description, cover_image_url, status, is_published, start_date, end_date, created_at, updated_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000000401',
        '00000000-0000-0000-0000-000000000201',
        'Neon PostgreSQL Fundamentals',
        'A practical introduction to serverless PostgreSQL, schemas, migrations, and production readiness.',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
        'PUBLISHED',
        true,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000402',
        '00000000-0000-0000-0000-000000000201',
        'Secure API Foundations',
        'Draft program for API authentication, authorization, and auditability.',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
        'DRAFT',
        false,
        CURRENT_DATE + INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '45 days',
        now(),
        now()
    )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    cover_image_url = EXCLUDED.cover_image_url,
    status = EXCLUDED.status,
    is_published = EXCLUDED.is_published,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = now();

INSERT INTO program_resources (
    id, program_id, created_by, title, description, type, url, storage_provider, status, position, created_at, updated_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000000501',
        '00000000-0000-0000-0000-000000000401',
        '00000000-0000-0000-0000-000000000101',
        'Neon Connection Guide',
        'Reference material for configuring a PostgreSQL connection string with SSL.',
        'LINK',
        'https://neon.com/docs/connect/connect-from-any-app',
        'EXTERNAL',
        'ACTIVE',
        1,
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000502',
        '00000000-0000-0000-0000-000000000401',
        '00000000-0000-0000-0000-000000000101',
        'Migration Workflow Walkthrough',
        'Short video lesson about schema migrations and seeded demo data.',
        'VIDEO_LINK',
        'https://example.com/skillmark/neon-migrations',
        'EXTERNAL',
        'ACTIVE',
        2,
        now(),
        now()
    )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    url = EXCLUDED.url,
    storage_provider = EXCLUDED.storage_provider,
    status = EXCLUDED.status,
    position = EXCLUDED.position,
    updated_at = now();

INSERT INTO quizzes (
    id, program_id, title, description, passing_score, duration_minutes, max_attempts,
    certificate_enabled, certificate_issue_mode, is_published, status, created_at, updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000401',
    'Neon Fundamentals Check',
    'Validate baseline knowledge of Neon connection strings, migrations, and operational setup.',
    70,
    30,
    3,
    true,
    'AUTO',
    true,
    'PUBLISHED',
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    passing_score = EXCLUDED.passing_score,
    duration_minutes = EXCLUDED.duration_minutes,
    max_attempts = EXCLUDED.max_attempts,
    certificate_enabled = EXCLUDED.certificate_enabled,
    certificate_issue_mode = EXCLUDED.certificate_issue_mode,
    is_published = EXCLUDED.is_published,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO quiz_questions (id, quiz_id, text, type, points, position, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000601', 'Which setting is required for a Neon PostgreSQL production connection?', 'SINGLE_CHOICE', 1, 1, now(), now()),
    ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000601', 'What should own schema changes in this backend?', 'SINGLE_CHOICE', 1, 2, now(), now())
ON CONFLICT (id) DO UPDATE
SET text = EXCLUDED.text,
    type = EXCLUDED.type,
    points = EXCLUDED.points,
    position = EXCLUDED.position,
    updated_at = now();

INSERT INTO quiz_options (id, question_id, text, is_correct, position, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000701', 'sslmode=require or stronger SSL verification', true, 1, now(), now()),
    ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000701', 'Disabling TLS for lower latency', false, 2, now(), now()),
    ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000701', 'Using an embedded H2 database in production', false, 3, now(), now()),
    ('00000000-0000-0000-0000-000000000804', '00000000-0000-0000-0000-000000000702', 'Flyway migrations committed with the backend', true, 1, now(), now()),
    ('00000000-0000-0000-0000-000000000805', '00000000-0000-0000-0000-000000000702', 'Manual edits in the Neon console only', false, 2, now(), now()),
    ('00000000-0000-0000-0000-000000000806', '00000000-0000-0000-0000-000000000702', 'Hibernate create-drop in production', false, 3, now(), now())
ON CONFLICT (id) DO UPDATE
SET text = EXCLUDED.text,
    is_correct = EXCLUDED.is_correct,
    position = EXCLUDED.position,
    updated_at = now();

INSERT INTO program_enrollments (id, program_id, user_id, status, enrolled_at, completed_at, removed_at)
VALUES
    ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000102', 'ACTIVE', now() - INTERVAL '2 days', NULL, NULL),
    ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000103', 'COMPLETED', now() - INTERVAL '5 days', now() - INTERVAL '1 day', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO invitation_links (
    id, organization_id, program_id, code, description, max_uses, used_count, expires_at,
    status, created_by, created_at, updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000401',
    'SKILLMARK-DEMO-2026',
    'Seeded invite link for validating enrollment flows.',
    25,
    2,
    now() + INTERVAL '30 days',
    'ACTIVE',
    '00000000-0000-0000-0000-000000000101',
    now(),
    now()
)
ON CONFLICT (code) DO UPDATE
SET description = EXCLUDED.description,
    max_uses = EXCLUDED.max_uses,
    used_count = EXCLUDED.used_count,
    expires_at = EXCLUDED.expires_at,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO quiz_attempts (
    id, quiz_id, user_id, score, score_percentage, passed, status, started_at, submitted_at,
    created_at, updated_at, attempt_number, expires_at, total_points, earned_points, is_passed
)
VALUES (
    '00000000-0000-0000-0000-000000001101',
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000103',
    3,
    100.00,
    true,
    'SUBMITTED',
    now() - INTERVAL '1 day 1 hour',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day 1 hour',
    now() - INTERVAL '1 day',
    1,
    now() - INTERVAL '1 day 30 minutes',
    3,
    3,
    true
)
ON CONFLICT (id) DO UPDATE
SET score = EXCLUDED.score,
    score_percentage = EXCLUDED.score_percentage,
    passed = EXCLUDED.passed,
    status = EXCLUDED.status,
    submitted_at = EXCLUDED.submitted_at,
    updated_at = now(),
    total_points = EXCLUDED.total_points,
    earned_points = EXCLUDED.earned_points,
    is_passed = EXCLUDED.is_passed;

INSERT INTO quiz_attempt_answers (
    id, attempt_id, question_id, selected_option_id, is_correct, points_awarded, created_at
)
VALUES
    ('00000000-0000-0000-0000-000000001201', '00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000801', true, 1, now() - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000001202', '00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000804', true, 1, now() - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000001203', '00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000807', true, 1, now() - INTERVAL '1 day')
ON CONFLICT (attempt_id, question_id) DO UPDATE
SET selected_option_id = EXCLUDED.selected_option_id,
    is_correct = EXCLUDED.is_correct,
    points_awarded = EXCLUDED.points_awarded;

INSERT INTO certificates (
    id, certificate_number, verification_code, organization_id, program_id, quiz_id, user_id, attempt_id,
    title, participant_name_snapshot, quiz_title_snapshot, program_title_snapshot,
    organization_name_snapshot, status, issued_at, pdf_url, qr_code_url, created_at, updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000001301',
    'SKILLMARK-DEMO-CERT-001',
    'skillmark-demo-verification-001',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000001101',
    'Certificate of Completion',
    'Lina Mansour',
    'Neon Fundamentals Check',
    'Neon PostgreSQL Fundamentals',
    'Skillmark Demo Academy',
    'ACTIVE',
    now() - INTERVAL '1 day',
    'https://example.com/certificates/skillmark-demo-cert-001.pdf',
    'https://example.com/certificates/skillmark-demo-cert-001-qr.png',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
)
ON CONFLICT (certificate_number) DO UPDATE
SET verification_code = EXCLUDED.verification_code,
    status = EXCLUDED.status,
    issued_at = EXCLUDED.issued_at,
    pdf_url = EXCLUDED.pdf_url,
    qr_code_url = EXCLUDED.qr_code_url,
    updated_at = now();

INSERT INTO audit_logs (
    id, actor_user_id, organization_id, action, entity_type, entity_id, ip_address, user_agent, metadata, created_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000001401',
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000201',
        'PROGRAM_PUBLISHED',
        'Program',
        '00000000-0000-0000-0000-000000000401',
        '127.0.0.1',
        'Skillmark Seed Migration',
        '{"source":"flyway","seed":"demo-data"}'::jsonb,
        now()
    ),
    (
        '00000000-0000-0000-0000-000000001402',
        '00000000-0000-0000-0000-000000000103',
        '00000000-0000-0000-0000-000000000201',
        'CERTIFICATE_ISSUED',
        'Certificate',
        '00000000-0000-0000-0000-000000001301',
        '127.0.0.1',
        'Skillmark Seed Migration',
        '{"source":"flyway","seed":"demo-data"}'::jsonb,
        now()
    )
ON CONFLICT (id) DO UPDATE
SET metadata = EXCLUDED.metadata,
    created_at = EXCLUDED.created_at;
