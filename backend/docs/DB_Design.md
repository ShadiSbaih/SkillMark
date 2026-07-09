# Skillmark ERD DB Design

## Database Design Document — Version 2.0

This file provides the complete ERD-style database design for the expanded **Skillmark** backend.

Skillmark uses:

*   Auth for authentication
*   Neon DB as PostgreSQL database
*   Cloudflare R2 for files and certificate PDFs
*   Cloudinary for images and media

Because Auth handles authentication, the backend does **not** need internal tables for:

*   refresh tokens
*   email verification tokens
*   password reset tokens

The backend stores only the local user profile and links it to Auth using `auth_user_id`.

---

# 1\. ERD Tables

```
table users {
  id uuid [pk, default: `gen_random_uuid()`]
  auth_user_id varchar [unique, not null]
  name varchar [not null]
  email varchar [unique, not null]
  avatar_url text
  status varchar [not null, default: 'ACTIVE']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    auth_user_id [unique, name: 'uq_users_auth_user_id']
    email [unique, name: 'uq_users_email']
    status [name: 'idx_users_status']
  }
}

table organizations {
  id uuid [pk, default: `gen_random_uuid()`]
  owner_id uuid [ref: > users.id, not null]
  name varchar [not null]
  description text
  logo_url text
  status varchar [not null, default: 'ACTIVE']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
  deleted_at timestamp

  indexes {
    owner_id [name: 'idx_organizations_owner_id']
    status [name: 'idx_organizations_status']
    deleted_at [name: 'idx_organizations_deleted_at']
  }
}

table organization_memberships {
  id uuid [pk, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  user_id uuid [ref: > users.id, not null]
  role varchar [not null]
  status varchar [not null, default: 'ACTIVE']
  invited_by uuid [ref: > users.id]
  joined_at timestamp [not null, default: `now()`]
  removed_by uuid [ref: > users.id]
  removed_at timestamp
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    organization_id [name: 'idx_org_memberships_org_id']
    user_id [name: 'idx_org_memberships_user_id']
    (organization_id, user_id) [unique, name: 'uq_active_org_membership']
    // partial unique index handled in migration:
    // CREATE UNIQUE INDEX uq_active_org_membership
    // ON organization_memberships(organization_id, user_id)
    // WHERE status = 'ACTIVE';
  }
}

table programs {
  id uuid [pk, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  title varchar [not null]
  description text
  cover_image_url text
  status varchar [not null, default: 'DRAFT']
  is_published boolean [not null, default: false, note: 'compatibility mirror of status = PUBLISHED']
  start_date date
  end_date date
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
  deleted_at timestamp

  indexes {
    organization_id [name: 'idx_programs_organization_id']
    status [name: 'idx_programs_status']
    deleted_at [name: 'idx_programs_deleted_at']
  }
}

table program_enrollments {
  id uuid [pk, default: `gen_random_uuid()`]
  program_id uuid [ref: > programs.id, not null]
  user_id uuid [ref: > users.id, not null]
  status varchar [not null, default: 'ACTIVE']
  enrolled_at timestamp [not null, default: `now()`]
  completed_at timestamp
  removed_at timestamp

  indexes {
    program_id [name: 'idx_program_enrollments_program_id']
    user_id [name: 'idx_program_enrollments_user_id']
    (program_id, user_id) [name: 'idx_program_enrollments_program_user']
    // partial unique index handled in migration:
    // CREATE UNIQUE INDEX uq_active_program_enrollment
    // ON program_enrollments(program_id, user_id)
    // WHERE status = 'ACTIVE';
  }
}

table invitation_links {
  id uuid [pk, default: `gen_random_uuid()`]
  organization_id uuid [ref: > organizations.id, not null]
  program_id uuid [ref: > programs.id, not null]
  created_by uuid [ref: > users.id, not null]
  code varchar(12) [unique, not null]
  description text
  max_uses int
  used_count int [not null, default: 0]
  expires_at timestamp
  status varchar [not null, default: 'ACTIVE']
  created_at timestamp [not null, default: `now()`]
  disabled_at timestamp

  indexes {
    code [unique, name: 'uq_invitation_links_code']
    program_id [name: 'idx_invitation_links_program_id']
    organization_id [name: 'idx_invitation_links_org_id']
    status [name: 'idx_invitation_links_status']
  }
}

table program_resources {
  id uuid [pk, default: `gen_random_uuid()`]
  program_id uuid [ref: > programs.id, not null]
  created_by uuid [ref: > users.id, not null]
  title varchar [not null]
  description text
  type varchar [not null]
  url text
  storage_provider varchar
  object_key text
  status varchar [not null, default: 'ACTIVE']
  visible_to_participants boolean [not null, default: true]
  position int [not null, default: 0]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    program_id [name: 'idx_program_resources_program_id']
    type [name: 'idx_program_resources_type']
    status [name: 'idx_program_resources_status']
  }
}

table quizzes {
  id uuid [pk, default: `gen_random_uuid()`]
  program_id uuid [ref: > programs.id, not null]
  title varchar [not null]
  description text
  passing_score int [not null]
  duration_minutes int [not null]
  max_attempts int [not null, default: 1]
  certificate_enabled boolean [not null, default: false]
  certificate_issue_mode varchar [not null, default: 'NONE']
  is_published boolean [not null, default: false, note: 'compatibility mirror of status = PUBLISHED']
  status varchar [not null, default: 'DRAFT']
  visible_to_participants boolean [not null, default: true]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
  deleted_at timestamp

  indexes {
    program_id [name: 'idx_quizzes_program_id']
    status [name: 'idx_quizzes_status']
    deleted_at [name: 'idx_quizzes_deleted_at']
  }
}

table quiz_questions {
  id uuid [pk, default: `gen_random_uuid()`]
  quiz_id uuid [ref: > quizzes.id, not null]
  text text [not null]
  type varchar [not null, default: 'SINGLE_CHOICE']
  points int [not null, default: 1]
  position int [not null, default: 0]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    quiz_id [name: 'idx_quiz_questions_quiz_id']
    (quiz_id, position) [name: 'idx_quiz_questions_quiz_position']
  }
}

table quiz_options {
  id uuid [pk, default: `gen_random_uuid()`]
  question_id uuid [ref: > quiz_questions.id, not null]
  text text [not null]
  is_correct boolean [not null, default: false]
  position int [not null, default: 0]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    question_id [name: 'idx_quiz_options_question_id']
    (question_id, position) [name: 'idx_quiz_options_question_position']
  }
}

table quiz_attempts {
  id uuid [pk, default: `gen_random_uuid()`]
  quiz_id uuid [ref: > quizzes.id, not null]
  user_id uuid [ref: > users.id, not null]
  attempt_number int [not null, default: 1]
  status varchar [not null, default: 'IN_PROGRESS']
  started_at timestamp [not null, default: `now()`]
  expires_at timestamp [not null]
  submitted_at timestamp
  total_points int
  earned_points int
  score_percentage decimal(5,2)
  is_passed boolean
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    quiz_id [name: 'idx_quiz_attempts_quiz_id']
    user_id [name: 'idx_quiz_attempts_user_id']
    (quiz_id, user_id) [name: 'idx_quiz_attempts_quiz_user']
    status [name: 'idx_quiz_attempts_status']
  }
}

table quiz_attempt_answers {
  id uuid [pk, default: `gen_random_uuid()`]
  attempt_id uuid [ref: > quiz_attempts.id, not null]
  question_id uuid [ref: > quiz_questions.id, not null]
  selected_option_id uuid [ref: > quiz_options.id]
  is_correct boolean
  points_awarded int
  created_at timestamp [not null, default: `now()`]

  indexes {
    attempt_id [name: 'idx_attempt_answers_attempt_id']
    question_id [name: 'idx_attempt_answers_question_id']
    (attempt_id, question_id) [unique, name: 'uq_attempt_answer_per_question']
  }
}

table certificates {
  id uuid [pk, default: `gen_random_uuid()`]
  certificate_number varchar [unique, not null]
  verification_code varchar(16) [unique, not null]

  organization_id uuid [ref: > organizations.id, not null]
  program_id uuid [ref: > programs.id, not null]
  quiz_id uuid [ref: > quizzes.id, not null]
  user_id uuid [ref: > users.id, not null]
  attempt_id uuid [ref: > quiz_attempts.id, not null]

  title varchar [not null]

  participant_name_snapshot varchar [not null]
  quiz_title_snapshot varchar [not null]
  program_title_snapshot varchar [not null]
  organization_name_snapshot varchar [not null]

  status varchar [not null, default: 'ACTIVE']
  issued_at timestamp [not null, default: `now()`]
  revoked_at timestamp
  revoke_reason text

  pdf_url text
  pdf_object_key text
  qr_code_url text
  qr_code_object_key text

  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    verification_code [unique, name: 'uq_certificates_verification_code']
    certificate_number [unique, name: 'uq_certificates_certificate_number']
    user_id [name: 'idx_certificates_user_id']
    organization_id [name: 'idx_certificates_organization_id']
    program_id [name: 'idx_certificates_program_id']
    quiz_id [name: 'idx_certificates_quiz_id']
    status [name: 'idx_certificates_status']
    // partial unique index handled in migration:
    // CREATE UNIQUE INDEX uq_active_certificate_user_quiz
    // ON certificates(user_id, quiz_id)
    // WHERE status = 'ACTIVE';
  }
}

table audit_logs {
  id uuid [pk, default: `gen_random_uuid()`]
  actor_user_id uuid [ref: > users.id]
  organization_id uuid [ref: > organizations.id]
  action varchar [not null]
  entity_type varchar
  entity_id uuid
  ip_address varchar
  user_agent text
  metadata jsonb
  created_at timestamp [not null, default: `now()`]

  indexes {
    actor_user_id [name: 'idx_audit_logs_actor_user_id']
    organization_id [name: 'idx_audit_logs_organization_id']
    action [name: 'idx_audit_logs_action']
    entity_type [name: 'idx_audit_logs_entity_type']
    created_at [name: 'idx_audit_logs_created_at']
  }
}
```

---

# 2\. Relationship Summary

```
users 1 --< organization_memberships
organizations 1 --< organization_memberships

organizations 1 --< programs
programs 1 --< program_enrollments
users 1 --< program_enrollments

programs 1 --< invitation_links
users 1 --< invitation_links (created_by)

programs 1 --< program_resources
users 1 --< program_resources (created_by)

programs 1 --< quizzes
quizzes 1 --< quiz_questions
quiz_questions 1 --< quiz_options

quizzes 1 --< quiz_attempts
users 1 --< quiz_attempts
quiz_attempts 1 --< quiz_attempt_answers
quiz_questions 1 --< quiz_attempt_answers
quiz_options 1 --< quiz_attempt_answers (selected_option_id, nullable)

users 1 --< certificates
organizations 1 --< certificates
programs 1 --< certificates
quizzes 1 --< certificates
quiz_attempts 1 --1 certificates

users 1 --< audit_logs (actor_user_id, nullable)
organizations 1 --< audit_logs (organization_id, nullable)
```

---

# 3\. Entity Groups

## 3.1 User and Organization

```
users
organizations
organization_memberships
```

Purpose:

*   store local user profiles linked to Auth via `auth_user_id`
*   manage organizations owned by users
*   control organization-level permissions through membership roles
*   track who invited and who removed members

---

## 3.2 Programs and Enrollment

```
programs
program_enrollments
invitation_links
```

Purpose:

*   create workshops and training programs under an organization
*   enroll participants manually or through invitation links
*   track enrollment lifecycle (active, completed, removed)
*   support invitation code-based self-enrollment with expiry and usage limits
*   enforce invitation usage limits atomically so concurrent joins cannot make `used_count` exceed `max_uses`

---

## 3.3 Resources

```
program_resources
```

Purpose:

*   store program learning materials (links, files, images, video links)
*   support ordered display through `position` field
*   connect with Cloudflare R2 and Cloudinary through metadata fields
*   restrict access to enrolled participants only

---

## 3.4 Quizzes and Attempts

```
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_attempt_answers
```

Purpose:

*   create quizzes with configurable passing score, duration, and attempt limits
*   add ordered questions with typed answer options
*   track attempt lifecycle (in-progress, submitted, expired)
*   enforce time limits via `started_at` and `expires_at`
*   calculate and store scores automatically on submission
*   track which attempt number each submission represents

---

## 3.5 Certificates

```
certificates
```

Purpose:

*   issue certificates automatically or manually after passing a quiz
*   store snapshot values to preserve certificate accuracy over time
*   generate unique certificate numbers and verification codes
*   support public verification via `verification_code`
*   store PDF and QR code file references for download
*   support revocation with reason and timestamp

---

## 3.6 Audit Logs

```
audit_logs
```

Purpose:

*   track important security and business actions across the platform
*   record actor, organization, action type, target entity, IP, and user agent
*   store additional context in flexible JSONB metadata field
*   support audit log queries by organization owners
*   never soft delete or hard delete audit records

---

# 4\. Enums

## UserStatus

```
ACTIVE       - normal active user
INACTIVE     - account deactivated
SUSPENDED    - account suspended by admin
DELETED      - soft deleted via Auth webhook user.deleted event
```

---

## OrganizationStatus

```
ACTIVE       - organization is active and operational
DISABLED     - organization is temporarily disabled by owner
DELETED      - soft deleted by owner
```

---

## MembershipRole

```
OWNER        - full management access to the organization
PARTICIPANT  - limited access, can view and interact with programs
```

Future roles (out of scope for MVP):

```
INSTRUCTOR
MANAGER
REVIEWER
```

---

## MembershipStatus

```
ACTIVE       - membership is active
REMOVED      - member was removed by the organization owner
```

---

## ProgramStatus

```
DRAFT        - program is not yet published, not visible to participants
PUBLISHED    - program is active and visible to enrolled participants
ARCHIVED     - program is closed, preserved for historical reference
```

`programs.status` is the single source of truth for publication state. `programs.is_published` is a backward-compatible mirror and must equal `(status = 'PUBLISHED')`. Soft deletion is represented by `deleted_at`, not a `DELETED` status.

---

## EnrollmentStatus

```
ACTIVE       - participant is actively enrolled
COMPLETED    - participant has completed the program
REMOVED      - enrollment was removed by the owner
```

---

## InvitationStatus

```
ACTIVE       - invitation is valid and can be used
DISABLED     - invitation was manually disabled by the owner
EXPIRED      - invitation passed its expiry date (enforced in code)
```

---

## ResourceType

```
LINK         - external URL resource
FILE         - downloadable file stored in Cloudflare R2
IMAGE        - image asset stored in Cloudinary
VIDEO_LINK   - external video URL (YouTube, Vimeo, etc.)
```

---

## ResourceStatus

```
ACTIVE       - resource is visible to enrolled participants
ARCHIVED     - resource is hidden but preserved
DELETED      - soft deleted by owner
```

---

## StorageProvider

```
EXTERNAL     - resource URL is an external link, no backend storage
R2           - resource file is stored in Cloudflare R2
CLOUDINARY   - resource image is stored in Cloudinary
```

---

## QuizStatus

```
DRAFT        - quiz is not published, not visible to participants
PUBLISHED    - quiz is active and available to enrolled participants
ARCHIVED     - quiz is closed, no new attempts allowed
```

`quizzes.status` is the single source of truth for publication state. `quizzes.is_published` is a backward-compatible mirror and must equal `(status = 'PUBLISHED')`. Soft deletion is represented by `deleted_at`, not a `DELETED` status.

---

## QuestionType

```
SINGLE_CHOICE  - participant selects exactly one correct option
```

Future (out of scope for MVP):

```
TRUE_FALSE
MULTIPLE_CHOICE
SHORT_ANSWER
CODING_QUESTION
```

---

## CertificateIssueMode

```
AUTO         - certificate is issued automatically when attempt passes
MANUAL       - certificate must be issued manually by the organization owner
NONE         - certificate issuance is disabled for this quiz
```

---

## AttemptStatus

```
IN_PROGRESS  - attempt has been started but not yet submitted
SUBMITTED    - attempt was submitted and scored
EXPIRED      - attempt time limit passed without submission
CANCELLED    - attempt was cancelled (reserved for future use)
```

---

## CertificateStatus

```
ACTIVE       - certificate is valid and verifiable
REVOKED      - certificate was revoked by the organization owner
```

---

# 5\. Key Design Decisions

## 5.1 UUID Primary Keys

All tables use `UUID` as the primary key type.

Reasons:

*   UUIDs are safe to expose in public APIs without leaking sequential IDs
*   UUIDs prevent enumeration attacks on certificate and verification endpoints
*   UUIDs work well in distributed or multi-region environments
*   PostgreSQL `gen_random_uuid()` generates UUIDs natively

---

## 5.2 Auth Authentication

Since Skillmark uses Auth, the backend does not need these tables:

```
refresh_tokens
email_verification_tokens
password_reset_tokens
```

Auth is responsible for:

```
user registration
login and logout
email verification
password reset
session management
OAuth/social login
```

The backend stores:

```
users.auth_user_id
```

to link the local user profile to Auth identity.

User records are created or updated via:

*   auto-creation on first authenticated API request
*   Auth webhook events (`user.created`, `user.updated`, `user.deleted`)

---

## 5.3 Organization-Scoped Permissions

Do not use a global user role on the users table.

Wrong approach:

```
users.role = 'OWNER'
users.role = 'PARTICIPANT'
```

Correct approach:

```
organization_memberships.role = 'OWNER'
organization_memberships.role = 'PARTICIPANT'
```

A single user can hold different roles in different organizations:

```
Ahmad → OWNER in "Computer Science Club"
Ahmad → PARTICIPANT in "AI Training Program"
Ahmad → PARTICIPANT in "Java Bootcamp"
```

---

## 5.4 Program Access via Enrollments

Program-level access (resources, quizzes, attempts) is controlled by:

```
program_enrollments
```

A participant can view resources and take quizzes only if they have an ACTIVE enrollment in the program.

---

## 5.5 Quiz Attempt Timing

Each quiz attempt records:

```
started_at   - timestamp when the attempt was created
expires_at   - started_at + quiz.duration_minutes
```

The backend enforces the time limit:

*   Submissions received after `expires_at` are rejected with HTTP 422.
*   The MVP does not auto-submit expired attempts.
*   Expired non-submitted attempts still count toward `quiz.max_attempts`.

---

## 5.6 Attempt Number Tracking

The `attempt_number` field on `quiz_attempts` records which attempt this is for the user on a given quiz:

```
attempt_number = COUNT of previous attempts by this user on this quiz + 1
```

This allows ordering and display without recounting.

---

## 5.7 Historical Quiz Structure Protection

Questions and options are part of historical attempt evidence once submitted attempts exist.

Rules:

* If a quiz has no submitted attempts, owners may update or delete questions/options according to validation rules.
* If a quiz has submitted attempts, destructive question/option updates and deletes must be rejected unless a future versioning or archival strategy is implemented.
* Options or questions referenced by attempt answers must not be physically deleted.

---

## 5.8 Score Fields on Attempts

Scoring fields are null until the attempt is submitted:

```
total_points      - sum of all question points in the quiz
earned_points     - sum of points awarded for correct answers
score_percentage  - (earned_points / total_points) * 100
is_passed         - score_percentage >= quiz.passing_score
```

The client never sends score values. The backend calculates all scoring on submission.

---

## 5.8 Certificate Snapshots

At the time of certificate issuance, the backend captures snapshot values:

```
participant_name_snapshot     - user.name at time of issuance
quiz_title_snapshot           - quiz.title at time of issuance
program_title_snapshot        - program.title at time of issuance
organization_name_snapshot    - organization.name at time of issuance
```

These snapshots preserve certificate accuracy even if the original records are later renamed or deleted.

---

## 5.9 Partial Unique Indexes

Three partial unique indexes must be created via Flyway migration scripts.

These cannot be expressed as standard UNIQUE constraints because they apply only to records with a specific status value.

```
-- Only one ACTIVE membership per user per organization
CREATE UNIQUE INDEX uq_active_org_membership
ON organization_memberships(organization_id, user_id)
WHERE status = 'ACTIVE';

-- Only one ACTIVE enrollment per user per program
CREATE UNIQUE INDEX uq_active_program_enrollment
ON program_enrollments(program_id, user_id)
WHERE status = 'ACTIVE';

-- Only one ACTIVE certificate per user per quiz
CREATE UNIQUE INDEX uq_active_certificate_user_quiz
ON certificates(user_id, quiz_id)
WHERE status = 'ACTIVE';
```

---

## 5.10 Soft Delete Strategy

The following entities support soft deletion via `deleted_at` timestamp:

```
organizations
programs
quizzes
```

Soft delete rules:

```
1. Soft deleted records have deleted_at set to a non-null timestamp.
2. Soft deleted records are excluded from all list API responses.
3. Soft deleted records are excluded from permission checks.
4. Soft deleting a parent does NOT cascade to children.
   Children are preserved for historical integrity.
5. Certificates are never hard deleted.
6. Audit logs are never soft deleted and never hard deleted.
7. Soft deleted records cannot be restored in the MVP.
```

---

## 5.11 Storage Strategy

Use Cloudflare R2 for:

```
- certificate PDFs
- downloadable resource files
- QR code image files if stored as files
- private binary objects
```

Use Cloudinary for:

```
- organization logos
- program cover images
- public image assets
- image transformation and optimization
```

The database stores only metadata references:

```
url              - public access URL
storage_provider - R2, CLOUDINARY, or EXTERNAL
object_key       - internal storage key for R2 objects
```

---

# 6\. Unique Constraints

## Standard Unique Constraints

```
ALTER TABLE users
  ADD CONSTRAINT uq_users_auth_user_id UNIQUE (auth_user_id);

ALTER TABLE users
  ADD CONSTRAINT uq_users_email UNIQUE (email);

ALTER TABLE invitation_links
  ADD CONSTRAINT uq_invitation_links_code UNIQUE (code);

ALTER TABLE certificates
  ADD CONSTRAINT uq_certificates_certificate_number UNIQUE (certificate_number);

ALTER TABLE certificates
  ADD CONSTRAINT uq_certificates_verification_code UNIQUE (verification_code);

ALTER TABLE quiz_attempt_answers
  ADD CONSTRAINT uq_attempt_answer_per_question UNIQUE (attempt_id, question_id);
```

## Partial Unique Indexes

```
CREATE UNIQUE INDEX uq_active_org_membership
  ON organization_memberships(organization_id, user_id)
  WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX uq_active_program_enrollment
  ON program_enrollments(program_id, user_id)
  WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX uq_active_certificate_user_quiz
  ON certificates(user_id, quiz_id)
  WHERE status = 'ACTIVE';
```

## Publication State Constraints

```
ALTER TABLE programs
  ADD CONSTRAINT chk_program_status_values
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  ADD CONSTRAINT chk_program_is_published_matches_status
    CHECK (is_published = (status = 'PUBLISHED'));

ALTER TABLE quizzes
  ADD CONSTRAINT chk_quiz_status_values
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  ADD CONSTRAINT chk_quiz_is_published_matches_status
    CHECK (is_published = (status = 'PUBLISHED'));
```

---

# 7\. Full Index Reference

```
-- Users
CREATE UNIQUE INDEX uq_users_auth_user_id ON users(auth_user_id);
CREATE UNIQUE INDEX uq_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Organizations
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);

-- Organization Memberships
CREATE INDEX idx_org_memberships_org_id ON organization_memberships(organization_id);
CREATE INDEX idx_org_memberships_user_id ON organization_memberships(user_id);
CREATE UNIQUE INDEX uq_active_org_membership
  ON organization_memberships(organization_id, user_id)
  WHERE status = 'ACTIVE';

-- Programs
CREATE INDEX idx_programs_organization_id ON programs(organization_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_deleted_at ON programs(deleted_at);

-- Program Enrollments
CREATE INDEX idx_program_enrollments_program_id ON program_enrollments(program_id);
CREATE INDEX idx_program_enrollments_user_id ON program_enrollments(user_id);
CREATE INDEX idx_program_enrollments_program_user ON program_enrollments(program_id, user_id);
CREATE UNIQUE INDEX uq_active_program_enrollment
  ON program_enrollments(program_id, user_id)
  WHERE status = 'ACTIVE';

-- Invitation Links
CREATE UNIQUE INDEX uq_invitation_links_code ON invitation_links(code);
CREATE INDEX idx_invitation_links_program_id ON invitation_links(program_id);
CREATE INDEX idx_invitation_links_org_id ON invitation_links(organization_id);
CREATE INDEX idx_invitation_links_status ON invitation_links(status);

-- Program Resources
CREATE INDEX idx_program_resources_program_id ON program_resources(program_id);
CREATE INDEX idx_program_resources_type ON program_resources(type);
CREATE INDEX idx_program_resources_status ON program_resources(status);

-- Quizzes
CREATE INDEX idx_quizzes_program_id ON quizzes(program_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quizzes_deleted_at ON quizzes(deleted_at);

-- Quiz Questions
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_quiz_position ON quiz_questions(quiz_id, position);

-- Quiz Options
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX idx_quiz_options_question_position ON quiz_options(question_id, position);

-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_user ON quiz_attempts(quiz_id, user_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

-- Quiz Attempt Answers
CREATE INDEX idx_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX idx_attempt_answers_question_id ON quiz_attempt_answers(question_id);
CREATE UNIQUE INDEX uq_attempt_answer_per_question
  ON quiz_attempt_answers(attempt_id, question_id);

-- Certificates
CREATE UNIQUE INDEX uq_certificates_verification_code ON certificates(verification_code);
CREATE UNIQUE INDEX uq_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_organization_id ON certificates(organization_id);
CREATE INDEX idx_certificates_program_id ON certificates(program_id);
CREATE INDEX idx_certificates_quiz_id ON certificates(quiz_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE UNIQUE INDEX uq_active_certificate_user_quiz
  ON certificates(user_id, quiz_id)
  WHERE status = 'ACTIVE';

-- Audit Logs
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

# 8\. Core Design Rules

```
1. Authentication identity comes from Auth.
   The backend stores auth_user_id to link local users to Auth accounts.

2. Organization permissions come from organization_memberships.role.
   There are no global user roles on the users table.

3. Program content access comes from program_enrollments.
   A user must have an ACTIVE enrollment to access resources, quizzes, and attempts.

4. All primary keys are UUIDs.
   This prevents enumeration attacks and is safe for public APIs.

5. Soft deletion uses deleted_at timestamps.
   Soft deleted records are excluded from API responses and permission checks.
   Children of soft deleted parents are preserved for historical integrity.

6. Quiz scoring is calculated entirely by the backend on submission.
   Clients never send or control score values.

7. Certificate snapshots capture names at issuance time.
   This preserves accuracy even if records are later renamed.

8. Partial unique indexes enforce business uniqueness rules
   that depend on status values (active membership, active enrollment,
   active certificate per user per quiz).

9. Audit logs are append-only.
   They are never updated, soft deleted, or hard deleted.

10. Files are stored in Cloudflare R2 or Cloudinary.
    The database stores only metadata: url, storage_provider, object_key.
```
