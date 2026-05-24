INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Olivia Carter', 'olivia.owner@cohive.test', crypt('password123', gen_salt('bf')), 'OWNER', now(), now()),
    ('22222222-2222-2222-2222-222222222222', 'Omar Haddad', 'omar.owner@cohive.test', crypt('password123', gen_salt('bf')), 'OWNER', now(), now()),
    ('33333333-3333-3333-3333-333333333333', 'Maya Saleh', 'maya.student@cohive.test', crypt('password123', gen_salt('bf')), 'STUDENT', now(), now()),
    ('44444444-4444-4444-4444-444444444444', 'Liam Turner', 'liam.student@cohive.test', crypt('password123', gen_salt('bf')), 'STUDENT', now(), now()),
    ('55555555-5555-5555-5555-555555555555', 'Sofia Nasser', 'sofia.student@cohive.test', crypt('password123', gen_salt('bf')), 'STUDENT', now(), now()),
    ('66666666-6666-6666-6666-666666666666', 'Noah Brooks', 'noah.student@cohive.test', crypt('password123', gen_salt('bf')), 'STUDENT', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, user_id, created_at, updated_at) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', now(), now()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', now(), now()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO organizations (id, name, owner_id, created_at, updated_at) VALUES
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Cohive Academy', '11111111-1111-1111-1111-111111111111', now(), now()),
    ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'DataCraft Institute', '22222222-2222-2222-2222-222222222222', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_students (organization_id, student_id, created_at) VALUES
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()),
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now()),
    ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now()),
    ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddddddddddd', now())
ON CONFLICT (organization_id, student_id) DO NOTHING;

INSERT INTO courses (id, title, description, organization_id, created_at, updated_at) VALUES
    ('10101010-1010-1010-1010-101010101010', 'Spring Boot Fundamentals', 'Build secure REST APIs with Spring Boot, JPA, validation, and PostgreSQL.', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', now(), now()),
    ('20202020-2020-2020-2020-202020202020', 'Product Analytics Essentials', 'Learn practical metrics, funnels, retention analysis, and dashboard thinking.', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', now(), now()),
    ('30303030-3030-3030-3030-303030303030', 'PostgreSQL Data Engineering', 'Design relational schemas, write reliable SQL, and prepare production migrations.', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_students (course_id, student_id, created_at) VALUES
    ('10101010-1010-1010-1010-101010101010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()),
    ('10101010-1010-1010-1010-101010101010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now()),
    ('20202020-2020-2020-2020-202020202020', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()),
    ('30303030-3030-3030-3030-303030303030', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now()),
    ('30303030-3030-3030-3030-303030303030', 'dddddddd-dddd-dddd-dddd-dddddddddddd', now())
ON CONFLICT (course_id, student_id) DO NOTHING;

INSERT INTO resources (id, title, type, url, course_id, created_at, updated_at) VALUES
    ('abcabcab-1111-1111-1111-abcabcabcabc', 'Spring Boot Official Guides', 'LINK', 'https://spring.io/guides', '10101010-1010-1010-1010-101010101010', now(), now()),
    ('abcabcab-2222-2222-2222-abcabcabcabc', 'REST API Design Notes', 'LINK', 'https://restfulapi.net/', '10101010-1010-1010-1010-101010101010', now(), now()),
    ('abcabcab-3333-3333-3333-abcabcabcabc', 'Product Metrics Guide', 'LINK', 'https://www.reforge.com/blog/product-metrics', '20202020-2020-2020-2020-202020202020', now(), now()),
    ('abcabcab-4444-4444-4444-abcabcabcabc', 'PostgreSQL Documentation', 'LINK', 'https://www.postgresql.org/docs/', '30303030-3030-3030-3030-303030303030', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO quizzes (id, title, course_id, created_at, updated_at) VALUES
    ('f1f1f1f1-1111-1111-1111-f1f1f1f1f1f1', 'Spring Boot Basics Checkpoint', '10101010-1010-1010-1010-101010101010', now(), now()),
    ('f2f2f2f2-2222-2222-2222-f2f2f2f2f2f2', 'API Security Review', '10101010-1010-1010-1010-101010101010', now(), now()),
    ('f3f3f3f3-3333-3333-3333-f3f3f3f3f3f3', 'Analytics Metrics Quiz', '20202020-2020-2020-2020-202020202020', now(), now()),
    ('f4f4f4f4-4444-4444-4444-f4f4f4f4f4f4', 'PostgreSQL Schema Design Quiz', '30303030-3030-3030-3030-303030303030', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO certificates (id, title, course_id, student_id, created_at, updated_at) VALUES
    ('ce111111-1111-1111-1111-ce1111111111', 'Spring Boot Fundamentals Completion', '10101010-1010-1010-1010-101010101010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now(), now()),
    ('ce222222-2222-2222-2222-ce2222222222', 'PostgreSQL Data Engineering Completion', '30303030-3030-3030-3030-303030303030', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now(), now())
ON CONFLICT (course_id, student_id) DO NOTHING;
