# Skillmark ERD DB Design

## Simple Database Design Presentation

This file provides a simple ERD-style database design for the expanded **Skillmark** backend.

Skillmark uses:

- Clerk for authentication
- Neon DB as PostgreSQL database
- Cloudflare R2 for files and certificate PDFs
- Cloudinary for images/media

Because Clerk handles authentication, the backend does **not** need internal tables for:

- refresh tokens
- email verification tokens
- password reset tokens

The backend stores only the local user profile and links it to Clerk using `clerk_user_id`.

---

# 1. ERD Tables

```dbml
table users {
  id bigint [pk]
  clerk_user_id varchar [unique, not null]
  name varchar
  email varchar [unique, not null]
  avatar_url text
  status varchar
  created_at timestamp
  updated_at timestamp
}

table organizations {
  id bigint [pk]
  owner_id bigint [ref: > users.id]
  name varchar [not null]
  description text
  logo_url text
  status varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

table organization_memberships {
  id bigint [pk]
  organization_id bigint [ref: > organizations.id]
  user_id bigint [ref: > users.id]
  role varchar
  status varchar
  created_at timestamp
  updated_at timestamp
}

table programs {
  id bigint [pk]
  organization_id bigint [ref: > organizations.id]
  title varchar [not null]
  description text
  cover_image_url text
  status varchar
  is_published boolean
  start_date timestamp
  end_date timestamp
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

table program_enrollments {
  id bigint [pk]
  program_id bigint [ref: > programs.id]
  user_id bigint [ref: > users.id]
  status varchar
  enrolled_at timestamp
  completed_at timestamp
  removed_at timestamp
}

table invitation_links {
  id bigint [pk]
  organization_id bigint [ref: > organizations.id]
  program_id bigint [ref: > programs.id]
  code varchar [unique, not null]
  max_uses int
  used_count int
  expires_at timestamp
  status varchar
  created_by bigint [ref: > users.id]
  created_at timestamp
  updated_at timestamp
}

table program_resources {
  id bigint [pk]
  program_id bigint [ref: > programs.id]
  created_by bigint [ref: > users.id]
  title varchar [not null]
  description text
  type varchar
  url text
  storage_provider varchar
  object_key text
  status varchar
  position int
  created_at timestamp
  updated_at timestamp
}

table quizzes {
  id bigint [pk]
  program_id bigint [ref: > programs.id]
  title varchar [not null]
  description text
  passing_score decimal
  duration_minutes int
  max_attempts int
  certificate_enabled boolean
  certificate_issue_mode varchar
  is_published boolean
  status varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}

table quiz_questions {
  id bigint [pk]
  quiz_id bigint [ref: > quizzes.id]
  text text [not null]
  type varchar
  points decimal
  position int
  created_at timestamp
  updated_at timestamp
}

table quiz_options {
  id bigint [pk]
  question_id bigint [ref: > quiz_questions.id]
  text text [not null]
  is_correct boolean
  position int
  created_at timestamp
  updated_at timestamp
}

table quiz_attempts {
  id bigint [pk]
  quiz_id bigint [ref: > quizzes.id]
  user_id bigint [ref: > users.id]
  score decimal
  passed boolean
  status varchar
  started_at timestamp
  submitted_at timestamp
}

table quiz_attempt_answers {
  id bigint [pk]
  attempt_id bigint [ref: > quiz_attempts.id]
  question_id bigint [ref: > quiz_questions.id]
  selected_option_id bigint [ref: > quiz_options.id]
  is_correct boolean
  points_awarded decimal
  created_at timestamp
}

table certificates {
  id bigint [pk]
  certificate_number varchar [unique, not null]
  verification_code varchar [unique, not null]

  organization_id bigint [ref: > organizations.id]
  program_id bigint [ref: > programs.id]
  quiz_id bigint [ref: > quizzes.id]
  user_id bigint [ref: > users.id]
  attempt_id bigint [ref: > quiz_attempts.id]

  title varchar

  participant_name_snapshot varchar
  quiz_title_snapshot varchar
  program_title_snapshot varchar
  organization_name_snapshot varchar

  status varchar
  issued_at timestamp
  revoked_at timestamp
  revoke_reason text

  pdf_url text
  pdf_object_key text
  qr_code_url text
  qr_code_object_key text

  created_at timestamp
  updated_at timestamp
}

table audit_logs {
  id bigint [pk]
  actor_user_id bigint [ref: > users.id]
  organization_id bigint [ref: > organizations.id]
  action varchar
  entity_type varchar
  entity_id bigint
  ip_address varchar
  user_agent text
  metadata text
  created_at timestamp
}
```

---

# 2. Relationship Summary

```text
users 1--many organization_memberships
organizations 1--many organization_memberships

organizations 1--many programs
programs 1--many program_enrollments
users 1--many program_enrollments

programs 1--many invitation_links
programs 1--many program_resources

programs 1--many quizzes
quizzes 1--many quiz_questions
quiz_questions 1--many quiz_options

quizzes 1--many quiz_attempts
users 1--many quiz_attempts
quiz_attempts 1--many quiz_attempt_answers

users 1--many certificates
organizations 1--many certificates
programs 1--many certificates
quizzes 1--many certificates
quiz_attempts 1--1 certificates

users 1--many audit_logs
organizations 1--many audit_logs
```

---

# 3. Entity Groups

## 3.1 User and Organization

```text
users
organizations
organization_memberships
```

Purpose:

- store local user profiles
- connect users to Clerk
- manage organizations
- control organization-level permissions

---

## 3.2 Programs and Enrollment

```text
programs
program_enrollments
invitation_links
```

Purpose:

- create workshops/training programs
- enroll students
- allow joining through invitation links

---

## 3.3 Resources

```text
program_resources
```

Purpose:

- store program learning materials
- support links, files, images, and video links
- connect with Cloudflare R2 and Cloudinary through metadata

---

## 3.4 Quizzes and Attempts

```text
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_attempt_answers
```

Purpose:

- create quizzes
- add questions/options
- allow participants to submit attempts
- calculate score and pass/fail

---

## 3.5 Certificates

```text
certificates
```

Purpose:

- issue certificates after passing quizzes
- store verification code
- store PDF/QR metadata
- allow public verification

---

## 3.6 Audit Logs

```text
audit_logs
```

Purpose:

- track important security and business actions
- support traceability

---

# 4. Recommended Enums

## UserStatus

```text
ACTIVE
INACTIVE
SUSPENDED
DELETED
```

## OrganizationStatus

```text
ACTIVE
DISABLED
DELETED
```

## MembershipRole

```text
OWNER
PARTICIPANT
```

Future:

```text
INSTRUCTOR
MANAGER
REVIEWER
```

## MembershipStatus

```text
ACTIVE
INACTIVE
REMOVED
```

## ProgramStatus

```text
DRAFT
PUBLISHED
ARCHIVED
DELETED
```

## EnrollmentStatus

```text
ACTIVE
COMPLETED
REMOVED
```

## InvitationStatus

```text
ACTIVE
DISABLED
EXPIRED
```

## ResourceType

```text
LINK
FILE
IMAGE
VIDEO_LINK
```

## ResourceStatus

```text
ACTIVE
ARCHIVED
DELETED
```

## StorageProvider

```text
EXTERNAL
R2
CLOUDINARY
```

## QuizStatus

```text
DRAFT
PUBLISHED
ARCHIVED
DELETED
```

## QuestionType

```text
SINGLE_CHOICE
```

Future:

```text
TRUE_FALSE
MULTIPLE_CHOICE
SHORT_ANSWER
CODING_QUESTION
```

## CertificateIssueMode

```text
AUTO
MANUAL
NONE
```

## AttemptStatus

```text
IN_PROGRESS
SUBMITTED
EXPIRED
CANCELLED
```

## CertificateStatus

```text
ACTIVE
REVOKED
```

---

# 5. Important Notes

## 5.1 Clerk Authentication

Since Skillmark uses Clerk, the backend does not need these tables:

```text
refresh_tokens
email_verification_tokens
password_reset_tokens
```

Clerk is responsible for:

```text
register
login
logout
email verification
password reset
sessions
```

The backend stores:

```text
users.clerk_user_id
```

to connect the local user profile to Clerk.

---

## 5.2 Organization Permissions

Do not use a global user role.

Wrong:

```text
users.role = OWNER
users.role = PARTICIPANT
```

Correct:

```text
organization_memberships.role
```

A user can be:

- OWNER in one organization
- PARTICIPANT in another organization
- enrolled in many programs

---

## 5.3 Program Access

Program access depends on:

```text
program_enrollments
```

A participant can view resources and quizzes only if they are actively enrolled in the program.

---

## 5.4 Storage

Use:

```text
Cloudflare R2
```

for:

- certificate PDFs
- downloadable files
- private files
- generated QR code files if needed

Use:

```text
Cloudinary
```

for:

- organization logos
- program cover images
- public image/media assets
- image transformations

The database stores only:

```text
url
storage_provider
object_key
```

---

# 6. Recommended Indexes

```sql
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organization_memberships_org_id ON organization_memberships(organization_id);
CREATE INDEX idx_organization_memberships_user_id ON organization_memberships(user_id);

CREATE INDEX idx_programs_organization_id ON programs(organization_id);
CREATE INDEX idx_program_enrollments_program_id ON program_enrollments(program_id);
CREATE INDEX idx_program_enrollments_user_id ON program_enrollments(user_id);

CREATE INDEX idx_invitation_links_code ON invitation_links(code);
CREATE INDEX idx_invitation_links_program_id ON invitation_links(program_id);

CREATE INDEX idx_program_resources_program_id ON program_resources(program_id);

CREATE INDEX idx_quizzes_program_id ON quizzes(program_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);

CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);

CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_organization_id ON certificates(organization_id);
CREATE INDEX idx_certificates_program_id ON certificates(program_id);
CREATE INDEX idx_certificates_quiz_id ON certificates(quiz_id);
```

---

# 7. Recommended Unique Constraints

```sql
ALTER TABLE users
ADD CONSTRAINT uq_users_clerk_user_id UNIQUE (clerk_user_id);

ALTER TABLE users
ADD CONSTRAINT uq_users_email UNIQUE (email);

ALTER TABLE invitation_links
ADD CONSTRAINT uq_invitation_links_code UNIQUE (code);

ALTER TABLE certificates
ADD CONSTRAINT uq_certificates_certificate_number UNIQUE (certificate_number);

ALTER TABLE certificates
ADD CONSTRAINT uq_certificates_verification_code UNIQUE (verification_code);
```

Recommended partial unique indexes in PostgreSQL:

```sql
CREATE UNIQUE INDEX uq_active_organization_membership
ON organization_memberships(organization_id, user_id)
WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX uq_active_program_enrollment
ON program_enrollments(program_id, user_id)
WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX uq_active_certificate_user_quiz
ON certificates(user_id, quiz_id)
WHERE status = 'ACTIVE';
```

---

# 8. Core Design Rule

The most important backend rule:

```text
Organization permissions come from organization_memberships.
Program access comes from program_enrollments.
Authentication identity comes from Clerk.
Relational data is stored in Neon PostgreSQL.
Files are stored in Cloudflare R2.
Images/media are stored in Cloudinary.
```
