# Skillmark Training & Certification Platform

## Product Requirements Document (PRD) — Version 3.0

---

# 1. Executive Summary

## 1.1 Product Vision

**Skillmark** is a modern, API-first platform that helps universities, student clubs, and training organizations create programs, assess participants, and issue verifiable digital certificates.

### One-line pitch
> Create programs, assess skills, issue certificates—all through a simple API.

### Core value proposition
Skillmark eliminates the complexity of managing training programs by providing a clean, secure backend that handles enrollment, quizzes, and certificate verification out of the box.

---

## 1.2 What Makes This Version Better

This redesigned version focuses on:

✅ **Simplicity first** — Fewer entities, clearer relationships  
✅ **Better API design** — RESTful, predictable, intuitive  
✅ **Cleaner permissions** — Role-based access that makes sense  
✅ **Single source of truth** — No duplicate state management  
✅ **Modern auth** — Clerk integration without the complexity  
✅ **Unified storage** — One provider, consistent approach  
✅ **Production ready** — Built for real-world deployment  

---

## 1.3 Target Users

| User Type | Example | Primary Use Case |
|-----------|---------|-----------------|
| **Program Organizers** | Student club leaders | Run training programs |
| **Training Coordinators** | University departments | Manage certification programs |
| **Owners** | Technical trainers | Create quizzes and programs |
| **Participants** | Students, trainees | Complete courses, earn certificates |

---

## 1.4 Core User Journey

```
1. Organizer creates an organization
2. Organizer creates a program
3. Participants join using invitation code
4. Organizer adds learning materials
5. Organizer creates a quiz
6. Participants take the quiz
7. System auto-grades and scores
8. Qualified participants receive certificates
9. Anyone can verify certificates publicly
```

---

# 2. Product Scope

## 2.1 In Scope (MVP)

Core Features:
- ✅ User authentication (Clerk)
- ✅ Organization management
- ✅ Program creation & management
- ✅ Participant enrollment via invitation codes
- ✅ Learning resources (links, files, videos)
- ✅ Quizzes (multiple choice quizzes)
- ✅ Auto-grading & scoring
- ✅ Certificate generation
- ✅ Public certificate verification
- ✅ Analytics & reports
- ✅ Activity audit logs

## 2.2 Out of Scope (Future)

- ❌ Payment processing
- ❌ Video hosting/streaming
- ❌ Live classes/webinars
- ❌ Discussion forums
- ❌ Mobile apps
- ❌ Marketplace/public discovery
- ❌ AI-powered features
- ❌ Advanced analytics dashboard

---

# 3. Technology Stack

## 3.1 Backend

```
Runtime:       Java 17+
Framework:     Spring Boot 3.x
Web:           Spring Web MVC
Security:      Spring Security
Data:          Spring Data JPA + Hibernate
Validation:    Jakarta Validation
Migration:     Flyway
Documentation: OpenAPI 3 / Springdoc
Testing:       JUnit 5, Testcontainers
```

## 3.2 Infrastructure

```
Authentication:  Clerk
Database:        Neon (PostgreSQL 15+)
Storage:         Cloudflare R2 (S3-compatible)
Deployment:      Any cloud platform (AWS, GCP, Railway, Render)
```

### Why These Choices?

| Service | Reason |
|---------|--------|
| **Clerk** | Best-in-class auth, no custom password management |
| **Neon** | Serverless Postgres, generous free tier, branching |
| **Cloudflare R2** | Zero egress fees, S3-compatible, global CDN |

---

# 4. Core Concepts & Terminology

## 4.1 Entity Model (Simplified)

```
User (managed by Clerk, synced locally)
  └── Organization (organization/institution)
       └── Member (organization membership with role)
       └── Program (training program)
            └── Enrollment (participant registration)
            └── Resource (learning materials)
            └── Quiz (quiz/test)
                 └── Question
                      └── Answer Option
                 └── Attempt (student attempt)
                      └── Response (answers)
                 └── Certificate
```

**Total entities: 11** (vs 15+ in original)

---

## 4.2 Simplified Terminology

| Old Term | New Term | Why? |
|----------|----------|------|
| Organization | Organization | Existing domain model |
| Program | Program | Existing domain model |
| Quiz | Quiz | Existing domain model |
| Attempt | Attempt | Existing domain model |
| InvitationLink | InvitationLink | Existing domain model |

---

# 5. User Roles & Permissions

## 5.1 Role Model (Simplified)

Instead of complex organization + program permissions, we use **organization-level roles**:

### Roles

| Role | Description |
|------|-------------|
| **OWNER** | Organization owner, full control |
| **PARTICIPANT** | Can enroll in programs and take quizzes |

### Permission Matrix

| Action | OWNER | PARTICIPANT |
|--------|-------|-------------|
| Manage organization | ✅ | ❌ |
| Manage members | ✅ | ❌ |
| Create programs | ✅ | ❌ |
| Create quizzes | ✅ | ❌ |
| Issue certificates | ✅ | ❌ |
| Enroll in programs | ✅ | ✅ |
| Take quizzes | ✅ | ✅ |
| View own certificates | ✅ | ✅ |

---

## 5.2 Access Control Rules

### Organization-level
- Users can only access organizations where they are members
- Users can be members of multiple organizations with different roles

### Program-level
- Only enrolled members can access program content
- Owners have automatic access to their organization's programs

### Resource-level
- Resources inherit program access control
- Owners can hide resources from participants

### Quiz-level
- Only published quizzes are visible to members
- Members can only submit their own quiz attempts

---

# 6. Data Model

## 6.1 User

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
```

**Notes:**
- `clerk_id` links to Clerk user identity
- Local copy maintained via webhook sync
- No password/auth fields (handled by Clerk)

---

## 6.2 Organization

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workspaces_slug ON organizations(slug);
CREATE INDEX idx_workspaces_created_by ON organizations(created_by);
```

**Notes:**
- `slug` is URL-friendly identifier (e.g., "cs-club")
- Creator automatically becomes OWNER

---

## 6.3 Member

```sql
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_memberships_organization ON organization_memberships(organization_id);
CREATE INDEX idx_memberships_user ON organization_memberships(user_id);
```

**Notes:**
- One membership per user per organization
- Cascade delete when organization or user is deleted

---

## 6.4 Program

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_programs_organization ON programs(organization_id);
CREATE INDEX idx_workshops_status ON programs(status);
```

**Notes:**
- Single `status` field (no duplicate isPublished)
- Optional scheduling with starts_at/ends_at

---

## 6.5 Enrollment

```sql
CREATE TABLE program_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    UNIQUE(program_id, user_id)
);

CREATE INDEX idx_enrollments_program ON enrollments(program_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
```

**Notes:**
- Simple enrollment tracking
- `completed_at` set when certificate issued

---

## 6.6 InvitationLink

```sql
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    code VARCHAR(12) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT',
    max_uses INT,
    uses_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_invites_code ON invitations(code);
CREATE INDEX idx_invitations_organization ON invitations(organization_id);
```

**Notes:**
- If `program_id` is NULL, invitation is for organization membership
- If `program_id` is set, invitation enrolls user in specific program
- Code format: 12 chars, uppercase alphanumeric (e.g., `A3FX9KL2MN8P`)

---

## 6.7 Resource

```sql
CREATE TABLE program_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('LINK', 'FILE', 'VIDEO', 'DOCUMENT')),
    url TEXT NOT NULL,
    storage_key TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    position INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_program ON resources(program_id);
CREATE INDEX idx_resources_position ON resources(program_id, position);
```

**Notes:**
- `url` is either external URL or generated R2 URL
- `storage_key` is R2 object key for uploaded files
- `position` for ordering

---

## 6.8 Quiz

```sql
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    passing_score INT NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    auto_issue_certificate BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_program ON quizzes(program_id);
CREATE INDEX idx_assessments_status ON quizzes(status);
```

**Notes:**
- `auto_issue_certificate` replaces complex certificateIssueMode
- Single status field

---

## 6.9 Question

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    explanation TEXT,
    points INT NOT NULL DEFAULT 1 CHECK (points > 0),
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_assessment ON questions(assessment_id);
CREATE INDEX idx_questions_position ON questions(assessment_id, position);
```

**Notes:**
- MVP supports multiple-choice only
- Future: add `type` field for other question types

---

## 6.10 Answer

```sql
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_answers_question ON answers(question_id);
```

**Notes:**
- Each question must have exactly one `is_correct = TRUE` answer
- Minimum 2 answers per question

---

## 6.11 Attempt

```sql
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' 
        CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED')),
    score INT,
    max_score INT,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    UNIQUE(assessment_id, user_id, attempt_number)
);

CREATE INDEX idx_submissions_assessment ON attempts(assessment_id);
CREATE INDEX idx_submissions_user ON attempts(user_id);
CREATE INDEX idx_submissions_status ON attempts(status);
```

**Notes:**
- `attempt_number` auto-increments per user per quiz
- `expires_at = started_at + quiz.duration_minutes`
- Score calculated on attempt

---

## 6.12 Response

```sql
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    points_earned INT DEFAULT 0,
    
    UNIQUE(submission_id, question_id)
);

CREATE INDEX idx_responses_submission ON responses(submission_id);
```

**Notes:**
- One response per question per attempt
- `is_correct` and `points_earned` calculated on grading

---

## 6.13 Certificate

```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    verification_code VARCHAR(32) UNIQUE NOT NULL,
    
    -- Snapshots (immutable data)
    recipient_name VARCHAR(255) NOT NULL,
    workshop_title VARCHAR(255) NOT NULL,
    workspace_name VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    
    -- Files
    pdf_url TEXT,
    pdf_storage_key TEXT,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'REVOKED')),
    revoked_at TIMESTAMP,
    revoke_reason TEXT,
    
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issued_by UUID NOT NULL REFERENCES users(id),
    
    UNIQUE(assessment_id, user_id)
);

CREATE UNIQUE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE UNIQUE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_organization ON certificates(organization_id);
```

**Notes:**
- One certificate per user per quiz
- Certificate number format: `CERT-2024-A3FX9KL2` 
- Verification code: 32-char alphanumeric
- Snapshots preserve data even if program/organization changes

---

## 6.14 Activity Log

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_organization ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
```

**Notes:**
- Immutable audit trail
- Never deleted
- JSONB metadata for flexible context

---

# 7. API Design

## 7.1 Design Principles

1. **RESTful** — Use proper HTTP verbs and status codes
2. **Resource-oriented** — URLs represent resources, not actions
3. **Nested where logical** — Reflect entity relationships
4. **Consistent responses** — Uniform success/error format
5. **Versioned** — `/api/v1` prefix
6. **Pagination** — All lists support `page`, `size`, `sort`

---

## 7.2 Response Format

### Success Response (Single Resource)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Computer Science Club"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Success Response (List)

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/organizations"
}
```

---

## 7.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| `200` | Successful GET, PUT, PATCH |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no content) |
| `400` | Bad request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (no permission) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `422` | Unprocessable (business rule violation) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## 7.4 Authentication

All endpoints except public ones require:

```
Authorization: Bearer <clerk_jwt_token>
```

Backend validates token using Clerk JWKS, extracts `clerk_id`, looks up local user.

---

## 7.5 Endpoint Catalog

### Authentication & User

```http
GET    /api/v1/auth/me                    # Current user profile
PATCH  /api/v1/auth/me                    # Update profile
POST   /api/v1/webhooks/clerk             # Clerk user sync (no auth)
```

---

### Organizations

```http
POST   /api/v1/organizations                 # Create organization
GET    /api/v1/organizations                 # List my organizations
GET    /api/v1/organizations/:id             # Get organization details
PATCH  /api/v1/organizations/:id             # Update organization
DELETE /api/v1/organizations/:id             # Delete organization

GET    /api/v1/organizations/:id/stats       # Organization statistics
```

---

### Members

```http
GET    /api/v1/organizations/:id/members     # List organization members
POST   /api/v1/organizations/:id/members     # Add member (via email)
PATCH  /api/v1/organizations/:id/members/:userId/role  # Update member role
DELETE /api/v1/organizations/:id/members/:userId       # Remove member
```

---

### InvitationLinks

```http
POST   /api/v1/organizations/:id/invitations     # Create invitation
GET    /api/v1/organizations/:id/invitations     # List invitations
DELETE /api/v1/invitations/:id                # Delete/disable invitation

POST   /api/v1/invitations/accept             # Accept invitation by code (public)
GET    /api/v1/invitations/:code/preview      # Preview invitation details (public)
```

**Accept InvitationLink Request:**
```json
POST /api/v1/invitations/accept
{
  "code": "A3FX9KL2MN8P"
}
```

---

### Programs

```http
POST   /api/v1/organizations/:id/programs   # Create program
GET    /api/v1/organizations/:id/programs   # List programs
GET    /api/v1/programs/:id              # Get program details
PATCH  /api/v1/programs/:id              # Update program
DELETE /api/v1/programs/:id              # Delete program

PATCH  /api/v1/programs/:id/publish      # Publish program
PATCH  /api/v1/programs/:id/archive      # Archive program

GET    /api/v1/programs/:id/stats        # Program statistics
```

---

### Enrollments

```http
GET    /api/v1/programs/:id/enrollments  # List enrollments (owner)
POST   /api/v1/programs/:id/enrollments  # Manual enrollment
DELETE /api/v1/programs/:id/enrollments/:userId  # Remove enrollment

GET    /api/v1/enrollments                # My enrollments
```

---

### Resources

```http
POST   /api/v1/programs/:id/resources    # Add resource
GET    /api/v1/programs/:id/resources    # List resources
GET    /api/v1/resources/:id              # Get resource
PATCH  /api/v1/resources/:id              # Update resource
DELETE /api/v1/resources/:id              # Delete resource

POST   /api/v1/resources/upload-url       # Get upload URL for R2
```

**Upload Flow:**
1. Client requests upload URL: `POST /api/v1/resources/upload-url`
2. Backend returns presigned R2 URL
3. Client uploads file directly to R2
4. Client creates resource with returned URL

---

### Quizzes

```http
POST   /api/v1/programs/:id/quizzes  # Create quiz
GET    /api/v1/programs/:id/quizzes  # List quizzes
GET    /api/v1/quizzes/:id            # Get quiz details
PATCH  /api/v1/quizzes/:id            # Update quiz
DELETE /api/v1/quizzes/:id            # Delete quiz

PATCH  /api/v1/quizzes/:id/publish    # Publish quiz
PATCH  /api/v1/quizzes/:id/archive    # Archive quiz

GET    /api/v1/quizzes/:id/stats      # Quiz statistics
```

---

### Questions & Answers

```http
POST   /api/v1/quizzes/:id/questions  # Add question
PATCH  /api/v1/questions/:id              # Update question
DELETE /api/v1/questions/:id              # Delete question

POST   /api/v1/questions/:id/answers      # Add answer
PATCH  /api/v1/answers/:id                # Update answer
DELETE /api/v1/answers/:id                # Delete answer
```

**Batch Question Creation:**
```json
POST /api/v1/quizzes/:id/questions/batch
{
  "questions": [
    {
      "text": "What is REST?",
      "points": 1,
      "answers": [
        {"text": "Representational State Transfer", "isCorrect": true},
        {"text": "Remote Execution State Transfer", "isCorrect": false},
        {"text": "Resource Exchange State Transfer", "isCorrect": false}
      ]
    }
  ]
}
```

---

### Attempts

```http
POST   /api/v1/quizzes/:id/attempts        # Start new attempt
GET    /api/v1/quizzes/:id/attempts        # List all attempts (owner)
GET    /api/v1/attempts                        # My attempts
GET    /api/v1/attempts/:id                    # Get attempt details
POST   /api/v1/attempts/:id/submit             # Submit for grading

GET    /api/v1/attempts/:id/result             # Get graded result
```

**Start Attempt:**
```json
POST /api/v1/quizzes/:id/attempts
{}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "attemptNumber": 1,
    "status": "IN_PROGRESS",
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

**Submit Answers:**
```json
POST /api/v1/attempts/:id/submit
{
  "responses": [
    {"questionId": "...", "answerId": "..."},
    {"questionId": "...", "answerId": "..."}
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "status": "SUBMITTED",
    "score": 8,
    "maxScore": 10,
    "percentage": 80.00,
    "passed": true,
    "certificate": {
      "id": "...",
      "certificateNumber": "CERT-2024-A3FX9KL2"
    }
  }
}
```

---

### Certificates

```http
GET    /api/v1/certificates                       # My certificates
GET    /api/v1/organizations/:id/certificates        # Organization certificates (owner)
GET    /api/v1/certificates/:id                   # Get certificate
POST   /api/v1/certificates/:id/revoke            # Revoke certificate
GET    /api/v1/certificates/:id/download          # Download PDF

GET    /api/v1/public/verify/:code                # Public verification (no auth)
```

**Public Verification Response:**
```json
GET /api/v1/public/verify/VX8K2MN9PQR7Z

{
  "success": true,
  "data": {
    "valid": true,
    "certificateNumber": "CERT-2024-A3FX9KL2",
    "recipientName": "Ahmad Hassan",
    "workshopTitle": "Introduction to REST APIs",
    "workspaceName": "Computer Science Club",
    "issuedAt": "2024-01-15T10:30:00Z",
    "score": 85,
    "status": "ACTIVE"
  }
}
```

---

### Activity Logs

```http
GET    /api/v1/organizations/:id/activities  # Organization activity log
```

---

## 7.6 Query Parameters

### Pagination

```
?page=0              # Page number (0-indexed)
?size=20             # Items per page (max 100)
?sort=createdAt      # Sort field
?direction=desc      # Sort direction (asc/desc)
```

### Filtering

```
?status=PUBLISHED    # Filter by status
?role=OWNER     # Filter by role
?search=python       # Text search
```

### Examples

```http
GET /api/v1/organizations/123/programs?status=PUBLISHED&page=0&size=10
GET /api/v1/organizations/123/members?role=OWNER
GET /api/v1/certificates?search=python
```

---

# 8. Business Logic & Validation

## 8.1 Organization Rules

**Creation:**
- ✅ Any authenticated user can create an organization
- ✅ Creator automatically becomes OWNER
- ✅ `slug` must be unique, URL-safe, 3-50 characters

**Access:**
- ✅ Users can only access organizations where they are members
- ✅ Non-members get 404, not 403

**Deletion:**
- ✅ Only OWNER can delete organization
- ✅ Cascades to all programs, quizzes, certificates
- ⚠️ Warning: irreversible action

---

## 8.2 Member Rules

**Adding:**
- ✅ OWNER can invite members
- ✅ InvitationLinks can be for organization or specific program
- ✅ Duplicate membership returns 409

**Roles:**
- ✅ Only OWNER can assign OWNER or OWNER roles
- ✅ Cannot remove last OWNER from organization

**Removing:**
- ✅ OWNER can remove any member
- ✅ Members can leave organization (except last OWNER)

---

## 8.3 Program Rules

**Publishing:**
- ✅ Must have title and description
- ✅ Can only publish if at least one resource or quiz exists

**Archiving:**
- ✅ Archived programs cannot accept new enrollments
- ✅ Existing enrollments remain valid
- ✅ Quizzes become read-only

**Deletion:**
- ⚠️ Only allowed if no certificates have been issued
- ✅ Otherwise, must archive instead

---

## 8.4 Quiz Rules

**Publishing:**
Must pass all validations:
- ✅ At least 3 questions
- ✅ Each question has 2-6 answers
- ✅ Each question has exactly one correct answer
- ✅ `passingScore` is 1-100
- ✅ `durationMinutes` is at least 5
- ✅ `maxAttempts` is at least 1

**Editing:**
- ✅ Can edit freely in DRAFT status
- ⚠️ Cannot edit questions/answers if attempts exist
- ✅ Can edit metadata (title, passing score, etc.) anytime

**Deletion:**
- ✅ Can delete if no attempts exist
- ⚠️ Cannot delete if attempts exist (must archive)

---

## 8.5 Attempt Rules

**Starting:**
- ✅ Must be enrolled in program
- ✅ Quiz must be PUBLISHED
- ✅ Cannot exceed `maxAttempts`
- ✅ Cannot have active IN_PROGRESS attempt
- ✅ System records `startedAt` and calculates `expiresAt`

**Submitting:**
- ✅ Must answer all questions
- ✅ Cannot submit after `expiresAt`
- ✅ Cannot submit already-submitted attempt
- ✅ System auto-grades immediately

**Auto-grading:**
```
1. For each response:
   - Check if selected answer is correct
   - Award question.points if correct, else 0
   
2. Calculate totals:
   - score = sum of points earned
   - maxScore = sum of all question points
   - percentage = (score / maxScore) × 100
   - passed = percentage >= quiz.passingScore

3. Update attempt status to SUBMITTED

4. If passed AND quiz.autoIssueCertificate:
   - Auto-generate certificate
   - Return certificate in response
```

---

## 8.6 Certificate Rules

**Issuance:**
- ✅ Auto-issued when attempt passes (if enabled)
- ✅ Can be manually issued by OWNER
- ✅ One certificate per user per quiz
- ✅ Duplicate issuance returns existing certificate (409)

**Number Generation:**
```
Format: CERT-{YEAR}-{8_RANDOM}
Example: CERT-2024-A3FX9KL2

Algorithm:
- YEAR = current year
- RANDOM = 8 uppercase alphanumeric chars (SecureRandom)
- Verify uniqueness before inserting
```

**Verification Code:**
```
Format: 32 uppercase alphanumeric
Example: VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0

- Generated using SecureRandom
- Must be unique
```

**Revocation:**
- ✅ Only OWNER can revoke
- ✅ Revoked certificates remain visible but marked as REVOKED
- ✅ Public verification shows revocation status
- ⚠️ Revocation is permanent

---

## 8.7 InvitationLink Rules

**Creation:**
- ✅ Organization invitations grant membership with specified role
- ✅ Program invitations enroll user + grant organization PARTICIPANT role if needed
- ✅ `maxUses = null` means unlimited
- ✅ `expiresAt = null` means never expires

**Acceptance:**
```
1. Validate invitation code exists and is not disabled
2. Check expiration: current_time < expiresAt
3. Check usage: usesCount < maxUses (if maxUses not null)
4. Check duplicate membership/enrollment (return 409 if exists)
5. Atomic increment usesCount
6. Create membership/enrollment
7. Return success
```

**Concurrent Access:**
- Use optimistic locking or database transaction to prevent `usesCount` exceeding `maxUses`

---

# 9. Security

## 9.1 Authentication Flow

```
1. Frontend authenticates with Clerk
2. Frontend receives JWT token
3. Frontend sends token in Authorization header:
   Authorization: Bearer <token>
   
4. Backend filter intercepts request:
   a. Extract token from header
   b. Fetch JWKS from Clerk (cached)
   c. Validate token signature
   d. Validate claims (exp, iss, nbf)
   e. Extract clerk_id from sub claim
   f. Look up user by clerk_id
   g. If not found: auto-create from token claims
   h. Load user into SecurityContext
   
5. Controller accesses current user via @AuthenticationPrincipal
```

---

## 9.2 Webhook Security

```
POST /api/v1/webhooks/clerk

Verification:
1. Extract Svix-Signature header
2. Verify signature using CLERK_WEBHOOK_SECRET
3. If invalid: return 401
4. If valid: process event

Supported Events:
- user.created  → Create local user
- user.updated  → Update name, email, avatar
- user.deleted  → Mark user as deleted (soft delete)
```

**Implementation:**
```java
@PostMapping("/webhooks/clerk")
public ResponseEntity<?> handleClerkWebhook(
    @RequestHeader("Svix-Signature") String signature,
    @RequestBody String payload
) {
    if (!webhookService.verifySignature(payload, signature)) {
        return ResponseEntity.status(401).build();
    }
    
    webhookService.processEvent(payload);
    return ResponseEntity.ok().build();
}
```

---

## 9.3 Authorization Checks

### Organization-Level

```java
public void checkOrganizationAccess(UUID organizationId, User user, Role... allowedRoles) {
    Member member = memberRepository.findByOrganizationAndUser(organizationId, user.getId())
        .orElseThrow(() -> new NotFoundException("Organization not found"));
    
    if (!Arrays.asList(allowedRoles).contains(member.getRole())) {
        throw new ForbiddenException("Insufficient permissions");
    }
}
```

**Usage:**
```java
// Only OWNER can update organization
checkOrganizationAccess(organizationId, currentUser, Role.OWNER);

// OWNER can create programs
checkOrganizationAccess(organizationId, currentUser, Role.OWNER);
```

### Program-Level

```java
public void checkProgramAccess(UUID programId, User user) {
    Program program = programRepository.findById(programId)
        .orElseThrow(() -> new NotFoundException("Program not found"));
    
    // Check if user is enrolled OR has organization owner role
    boolean isEnrolled = enrollmentRepository
        .existsByProgramAndUser(programId, user.getId());
    
    boolean isOrganizationStaff = memberRepository
        .findByOrganizationAndUser(program.getOrganizationId(), user.getId())
        .map(m -> m.getRole() == Role.OWNER)
        .orElse(false);
    
    if (!isEnrolled && !isOrganizationStaff) {
        throw new NotFoundException("Program not found");
    }
}
```

---

## 9.4 Rate Limiting

| Endpoint Pattern | Limit |
|-----------------|-------|
| `POST /api/v1/invitations/accept` | 10/min per IP |
| `POST /api/v1/quizzes/*/attempts` | 5/min per user |
| `POST /api/v1/attempts/*/submit` | 3/min per user |
| `GET /api/v1/public/verify/*` | 60/min per IP |
| All other authenticated endpoints | 300/min per user |

**Implementation:** Use Spring filter with Redis or in-memory cache

---

## 9.5 Data Security

**Sensitive Data Protection:**
- ❌ Never log JWT tokens
- ❌ Never expose Clerk secrets in responses
- ❌ Never expose other users' emails unless OWNER
- ✅ Redact IP addresses in exported logs
- ✅ Use HTTPS only in production
- ✅ Validate all user input
- ✅ Parameterize all SQL queries (JPA does this)

**CORS Configuration:**
```yaml
cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}
  allowed-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
  allowed-headers: Authorization,Content-Type
  allow-credentials: true
  max-age: 3600
```

---

# 10. File Storage (Cloudflare R2)

## 10.1 Upload Flow

**Presigned URL Strategy:**

```
1. Client requests upload URL:
   POST /api/v1/resources/upload-url
   {
     "fileName": "program-slides.pdf",
     "contentType": "application/pdf",
     "fileSize": 1048576
   }

2. Backend generates presigned R2 URL:
   - Creates unique object key: "programs/{programId}/resources/{uuid}-{fileName}"
   - Generates presigned PUT URL (valid 15 minutes)
   - Returns URL to client

3. Client uploads file directly to R2 using presigned URL:
   PUT https://skillmark-files.r2.cloudflarestorage.com/...
   
4. Client creates resource with returned public URL:
   POST /api/v1/programs/{id}/resources
   {
     "title": "Program Slides",
     "type": "DOCUMENT",
     "url": "https://files.skillmark.io/programs/.../slides.pdf",
     "storageKey": "programs/.../slides.pdf"
   }
```

**Benefits:**
- ✅ Backend doesn't handle large files
- ✅ Faster uploads (direct to R2)
- ✅ Reduced server bandwidth
- ✅ Secure (presigned URLs expire)

---

## 10.2 Storage Structure

```
Bucket: skillmark-files

Structure:
/organizations/{organizationId}/logo.{ext}
/programs/{programId}/cover.{ext}
/programs/{programId}/resources/{uuid}-{filename}
/certificates/{certificateId}/certificate.pdf
/certificates/{certificateId}/qr.png
```

---

## 10.3 R2 Configuration

```yaml
r2:
  account-id: ${R2_ACCOUNT_ID}
  access-key-id: ${R2_ACCESS_KEY_ID}
  secret-access-key: ${R2_SECRET_ACCESS_KEY}
  bucket-name: ${R2_BUCKET_NAME:skillmark-files}
  endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
  public-url: ${R2_PUBLIC_URL:https://files.skillmark.io}
```

---

## 10.4 Storage Service Interface

```java
public interface StorageService {
    /**
     * Generate presigned upload URL
     */
    PresignedUploadResponse generateUploadUrl(
        String objectKey,
        String contentType,
        long contentLength,
        int expirationMinutes
    );
    
    /**
     * Get public URL for object
     */
    String getPublicUrl(String objectKey);
    
    /**
     * Delete object
     */
    void deleteObject(String objectKey);
    
    /**
     * Upload bytes directly (for system-generated files like PDFs)
     */
    String uploadBytes(
        String objectKey,
        byte[] data,
        String contentType
    );
}
```

---

# 11. Certificate Generation

## 11.1 Generation Flow

```
Trigger: Attempt passes AND quiz.autoIssueCertificate = true

1. Check duplicate certificate:
   - Query: SELECT * FROM certificates 
     WHERE assessment_id = ? AND user_id = ? AND status = 'ACTIVE'
   - If exists: return existing certificate (or 409 if strict)

2. Generate certificate number and verification code

3. Snapshot data:
   - recipientName = user.fullName
   - workshopTitle = program.title
   - workspaceName = organization.name
   - score = attempt.percentage

4. Create database record

5. Generate PDF (async job or inline):
   a. Render certificate template with data
   b. Generate QR code with verification URL
   c. Embed QR in PDF
   d. Upload PDF to R2
   e. Update certificate.pdfUrl and pdfStorageKey

6. Return certificate to user
```

---

## 11.2 PDF Template

**Option 1: HTML to PDF (Recommended)**

Use library like Flying Saucer or OpenPDF:

```java
String html = templateEngine.process("certificate", context);
byte[] pdf = PdfGenerator.fromHtml(html);
String pdfUrl = storageService.uploadBytes(
    "certificates/" + certId + "/certificate.pdf",
    pdf,
    "application/pdf"
);
```

**Template Variables:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { size: A4 landscape; margin: 0; }
        body { font-family: Arial; text-align: center; padding: 100px; }
        .title { font-size: 48px; font-weight: bold; }
        .recipient { font-size: 36px; margin: 50px 0; }
    </style>
</head>
<body>
    <div class="title">Certificate of Completion</div>
    <div class="recipient">${recipientName}</div>
    <p>Successfully completed</p>
    <div class="program">${workshopTitle}</div>
    <div class="score">Score: ${score}%</div>
    <div class="qr"><img src="${qrCodeDataUrl}" /></div>
    <div class="number">${certificateNumber}</div>
</body>
</html>
```

---

## 11.3 QR Code Generation

```java
String verificationUrl = String.format(
    "%s/verify/%s",
    baseUrl,
    certificate.getVerificationCode()
);

QRCodeWriter qrCodeWriter = new QRCodeWriter();
BitMatrix bitMatrix = qrCodeWriter.encode(
    verificationUrl,
    BarcodeFormat.QR_CODE,
    300,
    300
);

ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
byte[] qrImageBytes = pngOutputStream.toByteArray();

// Convert to data URL for embedding in PDF
String qrDataUrl = "data:image/png;base64," + 
    Base64.getEncoder().encodeToString(qrImageBytes);
```

---

# 12. Analytics & Statistics

## 12.1 Organization Stats

```http
GET /api/v1/organizations/:id/stats

Response:
{
  "success": true,
  "data": {
    "membersCount": 45,
    "workshopsCount": 8,
    "activeProgramsCount": 5,
    "assessmentsCount": 12,
    "certificatesIssued": 127,
    "totalEnrollments": 234,
    "recentActivity": [...]
  }
}
```

**Queries:**
```sql
SELECT COUNT(*) FROM organization_memberships WHERE organization_id = ?;
SELECT COUNT(*) FROM programs WHERE organization_id = ?;
SELECT COUNT(*) FROM programs WHERE organization_id = ? AND status = 'PUBLISHED';
SELECT COUNT(*) FROM certificates WHERE organization_id = ?;
```

---

## 12.2 Program Stats

```http
GET /api/v1/programs/:id/stats

Response:
{
  "success": true,
  "data": {
    "enrolledCount": 56,
    "completedCount": 42,
    "resourcesCount": 8,
    "assessmentsCount": 3,
    "averageScore": 78.5,
    "passRate": 75.0,
    "certificatesIssued": 42
  }
}
```

**Queries:**
```sql
SELECT COUNT(*) FROM enrollments WHERE program_id = ?;

SELECT COUNT(*) FROM enrollments 
WHERE program_id = ? AND completed_at IS NOT NULL;

SELECT AVG(percentage), COUNT(*), 
       SUM(CASE WHEN passed = TRUE THEN 1 ELSE 0 END) as passed_count
FROM attempts s
JOIN quizzes a ON s.assessment_id = a.id
WHERE a.program_id = ? AND s.status = 'SUBMITTED';
```

---

## 12.3 Quiz Stats

```http
GET /api/v1/quizzes/:id/stats

Response:
{
  "success": true,
  "data": {
    "totalAttempts": 56,
    "averageScore": 82.3,
    "highestScore": 100,
    "lowestScore": 45,
    "passedCount": 42,
    "failedCount": 14,
    "passRate": 75.0,
    "averageAttempts": 1.2
  }
}
```

---

# 13. Environment Configuration

## 13.1 Required Environment Variables

```bash
# Application
APP_ENV=production
APP_BASE_URL=https://api.skillmark.io
APP_VERIFY_BASE_URL=https://verify.skillmark.io

# Database (Neon)
DATABASE_URL=postgresql://user:pass@host/dbname
DATABASE_POOL_SIZE=10

# Authentication (Clerk)
CLERK_ISSUER=https://clerk.yourapp.com
CLERK_JWKS_URL=https://clerk.yourapp.com/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=yyyyyyyyyyyyyyyy
R2_BUCKET_NAME=skillmark-files
R2_PUBLIC_URL=https://files.skillmark.io

# CORS
CORS_ALLOWED_ORIGINS=https://app.skillmark.io,http://localhost:3000

# Optional
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=INFO
```

---

## 13.2 application.yml

```yaml
spring:
  application:
    name: skillmark-api
    
  datasource:
    url: ${DATABASE_URL}
    hikari:
      maximum-pool-size: ${DATABASE_POOL_SIZE:10}
      minimum-idle: 2
      
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        
  flyway:
    enabled: true
    baseline-on-migrate: true
    
server:
  port: 8080
  error:
    include-message: always
    include-stacktrace: never
    
springdoc:
  api-docs:
    path: /api/v1/docs
  swagger-ui:
    path: /swagger-ui.html
    
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

# 14. Testing Strategy

## 14.1 Test Pyramid

```
                    /\
                   /  \
                  / E2E \          ← 10% (Critical flows)
                 /--------\
                /          \
               /Integration \      ← 30% (API + DB)
              /--------------\
             /                \
            /   Unit Tests     \   ← 60% (Business logic)
           /____________________\
```

---

## 14.2 Unit Tests

**Focus:**
- Business logic validation
- Permission checks
- Calculation algorithms (scoring, stats)
- Code generation (certificate numbers, invitation codes)

**Example:**
```java
@Test
void calculateScore_shouldReturnCorrectPercentage() {
    var questions = List.of(
        new Question(1, 10),  // 10 points
        new Question(2, 5)    // 5 points
    );
    
    var responses = List.of(
        new Response(1, true, 10),   // correct
        new Response(2, false, 0)    // incorrect
    );
    
    var result = scoringService.calculate(questions, responses);
    
    assertEquals(10, result.getScore());
    assertEquals(15, result.getMaxScore());
    assertEquals(66.67, result.getPercentage(), 0.01);
}
```

**Coverage Target:** 80% line coverage for service layer

---

## 14.3 Integration Tests

**Setup:**
```java
@SpringBootTest
@Testcontainers
class ProgramIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("skillmark_test");
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void createProgram_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/organizations/{id}/programs", organizationId)
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Python Basics",
                      "description": "Learn Python fundamentals"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.id").exists());
    }
}
```

**Coverage:**
- All API endpoints
- Auth/permission flows
- Database constraints
- Concurrent operations (invitation acceptance, etc.)

---

## 14.4 Security Tests

```java
@Test
void accessOrganization_withoutToken_shouldReturn401() {
    mockMvc.perform(get("/api/v1/organizations/{id}", organizationId))
        .andExpect(status().isUnauthorized());
}

@Test
void updateOrganization_asParticipant_shouldReturn403() {
    // Given: user is PARTICIPANT, not OWNER
    mockMvc.perform(patch("/api/v1/organizations/{id}", organizationId)
            .header("Authorization", "Bearer " + memberToken)
            .content("{}"))
        .andExpect(status().isForbidden());
}

@Test
void accessOtherOrganization_shouldReturn404() {
    // User not a member: should return 404, not 403
    mockMvc.perform(get("/api/v1/organizations/{id}", otherOrganizationId)
            .header("Authorization", "Bearer " + validToken))
        .andExpect(status().isNotFound());
}
```

---

# 15. Deployment

## 15.1 Docker Support

**Dockerfile:**
```dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/skillmark-api.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml (local dev):**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: skillmark
      POSTGRES_USER: skillmark
      POSTGRES_PASSWORD: skillmark
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/skillmark
      CLERK_ISSUER: ${CLERK_ISSUER}
      CLERK_JWKS_URL: ${CLERK_JWKS_URL}
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 15.2 Platform Deployment

**Railway:**
```yaml
# railway.json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "healthcheckPath": "/actuator/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Render:**
```yaml
# render.yaml
services:
  - type: web
    name: skillmark-api
    env: java
    buildCommand: ./mvnw clean package -DskipTests
    startCommand: java -jar target/skillmark-api.jar
    healthCheckPath: /actuator/health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: skillmark-db
          property: connectionString
```

---

# 16. Project Structure

```
skillmark-api/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── io/skillmark/
│   │   │       ├── SkillmarkApplication.java
│   │   │       │
│   │   │       ├── auth/
│   │   │       │   ├── ClerkTokenFilter.java
│   │   │       │   ├── CurrentUser.java
│   │   │       │   └── SecurityConfig.java
│   │   │       │
│   │   │       ├── user/
│   │   │       │   ├── User.java
│   │   │       │   ├── UserRepository.java
│   │   │       │   ├── UserService.java
│   │   │       │   └── UserController.java
│   │   │       │
│   │   │       ├── organization/
│   │   │       │   ├── Organization.java
│   │   │       │   ├── OrganizationRepository.java
│   │   │       │   ├── OrganizationService.java
│   │   │       │   ├── OrganizationController.java
│   │   │       │   ├── Member.java
│   │   │       │   ├── MemberRepository.java
│   │   │       │   └── Role.java
│   │   │       │
│   │   │       ├── program/
│   │   │       │   ├── Program.java
│   │   │       │   ├── ProgramRepository.java
│   │   │       │   ├── ProgramService.java
│   │   │       │   ├── ProgramController.java
│   │   │       │   ├── Enrollment.java
│   │   │       │   └── EnrollmentRepository.java
│   │   │       │
│   │   │       ├── invitation/
│   │   │       │   ├── InvitationLink.java
│   │   │       │   ├── InviteRepository.java
│   │   │       │   ├── InviteService.java
│   │   │       │   └── InviteController.java
│   │   │       │
│   │   │       ├── resource/
│   │   │       │   ├── Resource.java
│   │   │       │   ├── ResourceRepository.java
│   │   │       │   ├── ResourceService.java
│   │   │       │   ├── ResourceController.java
│   │   │       │   └── ResourceType.java
│   │   │       │
│   │   │       ├── quiz/
│   │   │       │   ├── Quiz.java
│   │   │       │   ├── QuizRepository.java
│   │   │       │   ├── QuizService.java
│   │   │       │   ├── QuizController.java
│   │   │       │   ├── Question.java
│   │   │       │   ├── QuestionRepository.java
│   │   │       │   ├── Answer.java
│   │   │       │   └── AnswerRepository.java
│   │   │       │
│   │   │       ├── attempt/
│   │   │       │   ├── Attempt.java
│   │   │       │   ├── AttemptRepository.java
│   │   │       │   ├── AttemptService.java
│   │   │       │   ├── AttemptController.java
│   │   │       │   ├── Response.java
│   │   │       │   ├── ResponseRepository.java
│   │   │       │   └── ScoringService.java
│   │   │       │
│   │   │       ├── certificate/
│   │   │       │   ├── Certificate.java
│   │   │       │   ├── CertificateRepository.java
│   │   │       │   ├── CertificateService.java
│   │   │       │   ├── CertificateController.java
│   │   │       │   ├── PdfGenerator.java
│   │   │       │   └── QrCodeGenerator.java
│   │   │       │
│   │   │       ├── storage/
│   │   │       │   ├── StorageService.java
│   │   │       │   ├── R2StorageService.java
│   │   │       │   └── StorageController.java
│   │   │       │
│   │   │       ├── activity/
│   │   │       │   ├── ActivityLog.java
│   │   │       │   ├── ActivityLogRepository.java
│   │   │       │   ├── ActivityLogService.java
│   │   │       │   └── ActivityLogger.java (AOP aspect)
│   │   │       │
│   │   │       ├── common/
│   │   │       │   ├── dto/
│   │   │       │   │   ├── ApiResponse.java
│   │   │       │   │   ├── ErrorResponse.java
│   │   │       │   │   └── PageResponse.java
│   │   │       │   ├── exception/
│   │   │       │   │   ├── GlobalExceptionHandler.java
│   │   │       │   │   ├── NotFoundException.java
│   │   │       │   │   ├── ForbiddenException.java
│   │   │       │   │   └── ValidationException.java
│   │   │       │   └── util/
│   │   │       │       ├── CodeGenerator.java
│   │   │       │       └── SlugGenerator.java
│   │   │       │
│   │   │       └── webhook/
│   │   │           ├── ClerkWebhookController.java
│   │   │           └── WebhookService.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-prod.yml
│   │       ├── db/migration/
│   │       │   ├── V1__create_users.sql
│   │       │   ├── V2__create_workspaces.sql
│   │       │   ├── V3__create_organization_memberships.sql
│   │       │   ├── V4__create_workshops.sql
│   │       │   ├── V5__create_enrollments.sql
│   │       │   ├── V6__create_invites.sql
│   │       │   ├── V7__create_resources.sql
│   │       │   ├── V8__create_assessments.sql
│   │       │   ├── V9__create_questions.sql
│   │       │   ├── V10__create_answers.sql
│   │       │   ├── V11__create_submissions.sql
│   │       │   ├── V12__create_responses.sql
│   │       │   ├── V13__create_certificates.sql
│   │       │   └── V14__create_activity_logs.sql
│   │       └── templates/
│   │           └── certificate.html
│   │
│   └── test/
│       └── java/
│           └── io/skillmark/
│               ├── organization/
│               │   └── OrganizationServiceTest.java
│               ├── quiz/
│               │   └── ScoringServiceTest.java
│               └── integration/
│                   ├── ProgramApiTest.java
│                   └── AttemptApiTest.java
│
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 17. Migration Guide from V2

If implementing from scratch, you can ignore this section. If migrating from the previous complex design:

## Changes Summary

| V2 Concept | V3 Concept | Reason |
|------------|------------|---------|
| Organization | Organization | Modern terminology |
| OrganizationMembership | Member | Simplified |
| Program | Program | Clearer purpose |
| ProgramEnrollment | Enrollment | Simplified |
| InvitationLink | InvitationLink | Shorter |
| ProgramResource | Resource | Less verbose |
| Quiz | Quiz | Professional term |
| QuizAttempt | Attempt | Clearer noun |
| QuizAttemptAnswer | Response | Simpler |
| AuditLog | ActivityLog | Less scary term |

## Data Model Changes

1. **Removed duplicate status fields**: `isPublished` removed, use `status` only
2. **Simplified roles**: 3 roles instead of complex permission matrix
3. **Flatter hierarchy**: Removed unnecessary nesting
4. **Cleaner invitation system**: Program invitations are optional, organization invitations are primary

## API Changes

Old → New:

```
POST /api/v1/organizations → POST /api/v1/organizations
POST /api/v1/programs → POST /api/v1/organizations/:id/programs
POST /api/v1/quizzes/:id/attempts → POST /api/v1/quizzes/:id/attempts
PATCH /api/v1/programs/:id/publish → PATCH /api/v1/programs/:id/publish
GET /api/v1/public/certificates/verify/:code → GET /api/v1/public/verify/:code
```

---

# 18. Future Enhancements

## Phase 2 (Post-MVP)

- 🎯 **Question Bank**: Reusable question library
- 🎲 **Question Randomization**: Shuffle questions per student
- 🏆 **Badges & Achievements**: Gamification
- 📧 **Email Notifications**: Enrollment, certificate issuance
- 📊 **Advanced Analytics**: Completion rates, time tracking
- 🎨 **Custom Certificate Templates**: Upload custom designs
- 💬 **Discussion Boards**: Program Q&A

## Phase 3 (Future)

- 💰 **Payments**: Paid programs via Stripe
- 📱 **Mobile Apps**: iOS/Android
- 🤖 **AI Features**: Auto-question generation
- 🎥 **Video Hosting**: Built-in video platform
- 🌐 **Multi-language**: i18n support
- 📈 **Reporting Dashboard**: Visual analytics
- 🔌 **Zapier Integration**: Automation workflows

---

# 19. Success Metrics

## Technical Metrics

- ✅ 80%+ test coverage
- ✅ <100ms median API response time
- ✅ 99.9% uptime
- ✅ Zero SQL injection vulnerabilities
- ✅ Zero authentication bypasses

## Product Metrics

- 📊 Number of organizations created
- 📊 Number of programs published
- 📊 Number of certificates issued
- 📊 Average program completion rate
- 📊 API adoption rate (requests/day)

---

# 20. Getting Started (Developer)

## Prerequisites

```bash
- Java 17+
- Maven 3.6+
- Docker & Docker Compose
- Clerk account (free tier)
- Cloudflare account (free tier)
```

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourorg/skillmark-api.git
cd skillmark-api

# 2. Copy environment template
cp .env.example .env

# 3. Start local database
docker-compose up -d postgres

# 4. Run migrations
./mvnw flyway:migrate

# 5. Start application
./mvnw spring-boot:run

# 6. Visit Swagger docs
open http://localhost:8080/swagger-ui.html
```

## Environment Setup

Edit `.env`:
```bash
CLERK_ISSUER=https://your-clerk-domain.clerk.accounts.dev
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_xxxxxxx

R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=xxxxxx
R2_SECRET_ACCESS_KEY=yyyyyy
R2_BUCKET_NAME=skillmark-dev
```

---

# 21. Summary

This redesigned **Skillmark V3** PRD delivers:

✅ **Simpler architecture** — 11 entities vs 15+  
✅ **Better API design** — RESTful, intuitive, consistent  
✅ **Clearer permissions** — 3 roles instead of complex matrix  
✅ **Modern stack** — Clerk + Neon + R2  
✅ **Production ready** — Security, testing, deployment  
✅ **Developer friendly** — Clear structure, good DX  

**Core flows work out of the box:**
1. Create organization → auto-become owner
2. Create program → publish
3. Generate invitation → share code
4. Users join → get enrolled
5. Add resources → students access
6. Create quiz → students take
7. Auto-grade → issue certificate
8. Public verification → trust & verify

**Next step**: Start implementation with `User` + `Organization` + `Member` modules, then expand from there.

---

**Document Version:** 3.0  
**Last Updated:** 2024  
**Status:** ✅ Ready for Implementation