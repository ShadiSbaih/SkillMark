CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_membership_org_user UNIQUE (organization_id, user_id)
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    is_published BOOLEAN NOT NULL DEFAULT false,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE program_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_active_program_enrollment
    ON program_enrollments (program_id, user_id)
    WHERE status = 'ACTIVE';

CREATE TABLE invitation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    code VARCHAR(120) NOT NULL UNIQUE,
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE program_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id),
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    url TEXT,
    storage_provider VARCHAR(30) NOT NULL DEFAULT 'EXTERNAL',
    object_key TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score DECIMAL(5,2) NOT NULL,
    duration_minutes INT,
    max_attempts INT NOT NULL DEFAULT 1,
    certificate_enabled BOOLEAN NOT NULL DEFAULT false,
    certificate_issue_mode VARCHAR(30) NOT NULL DEFAULT 'NONE',
    is_published BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    text TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE',
    points DECIMAL(8,2) NOT NULL DEFAULT 1,
    position INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_question_position_per_quiz UNIQUE (quiz_id, position)
);

CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id),
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    position INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_option_position_per_question UNIQUE (question_id, position)
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    score DECIMAL(8,2),
    score_percentage DECIMAL(5,2),
    passed BOOLEAN,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id),
    question_id UUID NOT NULL REFERENCES quiz_questions(id),
    selected_option_id UUID NOT NULL REFERENCES quiz_options(id),
    is_correct BOOLEAN NOT NULL,
    points_awarded DECIMAL(8,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_answer_per_question_per_attempt UNIQUE (attempt_id, question_id)
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    verification_code VARCHAR(150) NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id),
    title VARCHAR(255) NOT NULL,
    participant_name_snapshot VARCHAR(150) NOT NULL,
    quiz_title_snapshot VARCHAR(255) NOT NULL,
    program_title_snapshot VARCHAR(255) NOT NULL,
    organization_name_snapshot VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT,
    pdf_url TEXT,
    pdf_object_key TEXT,
    qr_code_url TEXT,
    qr_code_object_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_active_certificate_per_user_quiz
    ON certificates (quiz_id, user_id)
    WHERE status = 'ACTIVE';

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    ip_address VARCHAR(100),
    user_agent TEXT,
    metadata TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_memberships_user_id ON organization_memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON organization_memberships(organization_id);
CREATE INDEX idx_programs_organization_id ON programs(organization_id);
CREATE INDEX idx_program_enrollments_program_id ON program_enrollments(program_id);
CREATE INDEX idx_program_enrollments_user_id ON program_enrollments(user_id);
CREATE INDEX idx_invitation_links_code ON invitation_links(code);
CREATE INDEX idx_invitation_links_program_id ON invitation_links(program_id);
CREATE INDEX idx_program_resources_program_id ON program_resources(program_id);
CREATE INDEX idx_quizzes_program_id ON quizzes(program_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX idx_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_organization_id ON certificates(organization_id);
CREATE INDEX idx_certificates_program_id ON certificates(program_id);
CREATE INDEX idx_certificates_quiz_id ON certificates(quiz_id);
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);
