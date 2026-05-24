# AGENTS.md

## Project: Skillmark Quiz & Certification Backend

This file guides any AI coding agent working on this repository.

The project is **Skillmark**, an API-first backend platform for organizations, university groups, trainers, and student clubs to create quizzes, manage participants, evaluate quiz attempts, and issue verifiable certificates.

The current phase is focused on the **backend API only**.

Frontend implementation is out of scope.

---

# 1. Read These Files First

Before generating, modifying, or refactoring code, the AI agent must read the project documentation in this order:

1. `PRD.md`
2. `DB_Design.md`
3. `Architecture.md`
4. `API_Design.md`
5. `Backend_Business_Scenarios.md`

If the repository uses different names, map them as follows:

| Expected File | Purpose |
|---|---|
| `PRD.md` | Product scope, users, roles, permissions, and requirements |
| `DB_Design.md` | Database tables, relationships, enums, indexes, and constraints |
| `Architecture.md` | Backend architecture, layers, modules, and code organization |
| `API_Design.md` | REST endpoints, request/response style, auth rules, and API behavior |
| `Backend_Business_Scenarios.md` | Real backend flows and business rules |

Do not start implementing code before understanding these files.

---

# 2. Core Product Understanding

Skillmark is not a full LMS.

It is a backend system for:

- organizations
- quizzes
- quiz attempts
- scoring
- certificates
- public certificate verification

The MVP should support:

1. User registration and login
2. Organization creation
3. Organization membership management
4. Quiz creation
5. Question and option creation
6. Quiz publishing
7. Quiz attempts
8. Attempt submission and scoring
9. Certificate issuing
10. Public certificate verification

---

# 3. Very Important Authorization Rule

The system must **not** use a global user role for business permissions.

Do not design the system like this:

```text
users.role = OWNER
users.role = PARTICIPANT
```

This is wrong for Skillmark.

The correct model is:

```text
organization_memberships.role
```

A user can be:

- OWNER in one organization
- PARTICIPANT in another organization
- member of multiple organizations
- owner of multiple organizations

All business permissions must be checked using organization-scoped membership.

---

# 4. Main User Types

The system has these user states/types:

## 4.1 Unauthenticated Visitor

Can:

- register
- login
- request password reset
- reset password with valid token
- verify email
- verify public certificate

Cannot:

- create organizations
- view private organizations
- take quizzes
- view private certificates
- manage anything

---

## 4.2 Authenticated User

Can:

- view own profile
- create organization
- view accessible organizations
- logout
- refresh token
- view own attempts
- view own certificates

Cannot:

- manage unrelated organizations
- access quizzes from organizations where they are not members
- issue certificates without organization ownership

---

## 4.3 Organization Owner

A user with `organization_memberships.role = OWNER` inside a specific organization.

Can:

- manage owned organization
- add/remove members
- create quizzes
- update quizzes
- add questions/options
- publish quizzes
- view attempts for owned quizzes
- issue certificates
- revoke certificates
- view organization certificates

Cannot:

- manage organizations owned by other users
- issue certificates for failed attempts
- issue duplicate active certificates
- access unrelated organization data

---

## 4.4 Organization Participant

A user with `organization_memberships.role = PARTICIPANT` inside a specific organization.

Can:

- view member organizations
- view published quizzes
- start quiz attempts
- submit own attempt
- view own results
- view own certificates

Cannot:

- create quizzes
- publish quizzes
- manage members
- view unpublished quizzes
- submit attempts for other users
- issue certificates

---

# 5. Architecture Rules

Follow a modular monolith architecture.

Recommended modules:

```text
auth
user
organization
membership
quiz
attempt
certificate
audit
common
security
config
```

Use a layered backend structure:

```text
controller
service
repository
dto
entity
mapper
exception
security
```

Business rules must be implemented in services, not controllers.

Controllers should be thin.

Repositories should only handle data access.

Authorization checks should be centralized.

---

# 6. Suggested Technology Stack

The preferred backend stack is:

- Java 17+
- Spring Boot
- Spring Web
- Spring Security
- JWT
- BCrypt
- Spring Data JPA
- Hibernate
- PostgreSQL
- Flyway
- Jakarta Validation
- Swagger/OpenAPI

If the existing repository already uses a specific stack, follow the existing stack unless instructed otherwise.

---

# 7. Authentication Rules

Use JWT-based authentication.

The access token is sent using:

```http
Authorization: Bearer <token>
```

The system should support:

- access token generation
- refresh token generation
- refresh token hashing
- refresh token expiration
- refresh token revocation
- logout
- logout from all sessions if implemented

Never store raw refresh tokens in the database.

Store only token hashes.

---

# 8. Password and Token Security

Never expose these fields in API responses:

- password hash
- refresh token hash
- password reset token hash
- email verification token hash
- internal secrets
- raw tokens after initial creation where not needed

Password reset tokens and email verification tokens must be stored as hashes.

Forgot password responses must not reveal whether the email exists.

---

# 9. Authorization Service

Create or use an `AuthorizationService` for repeated authorization logic.

Recommended checks:

```text
ensureOrganizationOwner(organizationId)
ensureOrganizationMember(organizationId)
ensureActiveParticipantMember(organizationId, userId)
ensureQuizOwner(quizId)
ensureQuizAccessible(quizId)
ensureAttemptOwner(attemptId)
ensureCertificateAccessible(certificateId)
```

Do not duplicate complex authorization logic across controllers.

---

# 10. Database Rules

Follow `DB_Design.md`.

Main entities:

- User
- Organization
- OrganizationMembership
- Quiz
- QuizQuestion
- QuizOption
- QuizAttempt
- QuizAttemptAnswer
- Certificate
- RefreshToken
- EmailVerificationToken
- PasswordResetToken
- AuditLog

Optional:

- QuizResource

Do not introduce old or conflicting models such as:

- Student
- OrganizationStudent
- CourseStudent

Users are generic accounts.

Students are represented as users with PARTICIPANT membership inside organizations.

---

# 11. Organization Rules

When a user creates an organization:

1. Create an organization row
2. Set `owner_id` to the current user
3. Create an organization membership row:
   - userId = current user
   - organizationId = new organization
   - role = OWNER
   - status = ACTIVE

A user must only see organizations where they are:

- owner
- active member

Unrelated organizations must not be visible.

---

# 12. Membership Rules

Only organization owners can add or remove members.

The current MVP supports:

```text
OWNER
PARTICIPANT
```

Future roles may include:

```text
INSTRUCTOR
MANAGER
REVIEWER
```

Do not implement future roles unless explicitly requested.

Prevent duplicate active memberships for the same user and organization.

Removing a member should preferably disable membership instead of deleting historical data.

---

# 13. Quiz Rules

A quiz belongs directly to an organization.

Courses are out of scope.

A quiz should include:

- title
- description
- organizationId
- passingScore
- durationMinutes
- maxAttempts
- certificateEnabled
- certificateIssueMode
- isPublished
- status

Supported question type in MVP:

```text
SINGLE_CHOICE
```

A `SINGLE_CHOICE` question must have exactly one correct option.

Only organization owners can:

- create quizzes
- update quizzes
- add questions
- add options
- publish quizzes
- archive/delete quizzes

Participants can only view published quizzes in organizations where they are active members.

---

# 14. Quiz Publishing Rules

A quiz should not be publishable unless:

- it has at least one question
- every question has valid options
- every SINGLE_CHOICE question has exactly one correct option
- quiz settings are valid
- passing score is valid
- max attempts is valid

---

# 15. Attempt Rules

Only active participants can start attempts for published quizzes.

Before starting an attempt, enforce:

- user is active participant in quiz organization
- quiz is published
- quiz status allows attempts
- max attempts has not been exceeded

When submitting an attempt:

- user can submit only their own attempt
- attempt must not already be submitted
- selected options must belong to the correct questions
- questions must belong to the same quiz
- score must be calculated by the backend
- pass/fail must be calculated by the backend

Never trust score sent from client.

---

# 16. Certificate Rules

Certificates are issued only after passing quizzes.

Certificate issue modes:

```text
AUTO
MANUAL
NONE
```

## AUTO

Issue certificate automatically when a participant passes the quiz.

## MANUAL

Organization owner reviews the attempt and issues certificate manually.

## NONE

No certificate is issued.

A certificate can only be issued if:

- target user exists
- user is an ACTIVE PARTICIPANT in the quiz organization
- user has a submitted passing attempt
- no duplicate active certificate exists for the same quiz and user

Certificate must store snapshots:

- participantNameSnapshot
- quizTitleSnapshot
- organizationNameSnapshot

These snapshots preserve certificate history if names change later.

---

# 17. Public Certificate Verification

Public certificate verification must not require login.

Endpoint should verify by `verificationCode`.

Public response should include safe data only:

- certificate status
- participant name snapshot
- quiz title snapshot
- organization name snapshot
- issued date
- revoked state if revoked

Do not expose:

- user email
- internal user id if not needed
- private attempt details
- sensitive metadata

---

# 18. API Response Rules

Use consistent response wrappers.

Success example:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

Paginated responses should include:

```json
{
  "items": [],
  "page": 0,
  "size": 10,
  "totalElements": 0,
  "totalPages": 0
}
```

---

# 19. API Base Path

All versioned endpoints should use:

```text
/api/v1
```

Follow `API_Design.md` for endpoint details.

Do not invent new endpoint naming styles if an endpoint already exists in the API design.

---

# 20. Audit Logging

Audit important business and security actions:

- organization created
- organization updated
- organization disabled/deleted
- member added
- member removed
- quiz created
- quiz updated
- quiz published
- quiz archived
- attempt submitted
- certificate issued
- certificate revoked
- login failure
- password reset completed

Audit logs must not contain:

- plaintext passwords
- raw tokens
- secrets

---

# 21. Error Handling

Use clear domain exceptions.

Recommended error types:

- `NotFoundException`
- `UnauthorizedException`
- `ForbiddenException`
- `ValidationException`
- `ConflictException`
- `BusinessRuleException`

Do not return raw stack traces to API clients.

Use global exception handling.

---

# 22. Validation Rules

Use DTO validation.

Validate:

- required fields
- email format
- password length
- quiz passing score range
- duration
- max attempts
- question text
- option text
- exactly one correct option for SINGLE_CHOICE
- enum values
- pagination parameters

---

# 23. Testing Guidance

When implementing features, add tests where possible.

Prioritize tests for:

- registration without role
- login
- refresh token flow
- organization creation
- owner membership creation
- participant membership creation
- quiz creation
- quiz publishing validation
- attempt submission
- scoring
- certificate issuing
- public certificate verification
- cross-organization access rejection

Security tests are important.

Always test that users cannot access unrelated organization data.

---

# 24. Do Not Implement Yet Unless Asked

Do not implement these features unless explicitly requested:

- frontend
- web dashboard
- mobile app
- full LMS courses
- lessons
- assignments
- attendance
- payments
- subscriptions
- chat
- notifications
- analytics dashboard
- leaderboard
- badges
- advanced question bank
- video calls
- calendar scheduling
- microservices
- multiple owners
- ownership transfer
- marketplace
- social login
- OAuth login
- MFA

---

# 25. Development Style Rules

When generating code:

- keep code clean and readable
- follow existing project structure
- do not over-engineer
- prefer simple MVP implementation
- use meaningful class and method names
- keep controllers thin
- keep business logic in services
- centralize authorization logic
- use transactions for multi-step business operations
- avoid leaking entities directly if DTOs are expected
- follow consistent response format

---

# 26. AI Agent Workflow

For each task:

1. Read the relevant documentation file.
2. Identify the affected module.
3. Check business rules in `Backend_Business_Scenarios.md`.
4. Check database constraints in `DB_Design.md`.
5. Check endpoint contract in `API_Design.md`.
6. Implement the smallest correct change.
7. Add validation.
8. Add authorization checks.
9. Add tests if possible.
10. Avoid changing unrelated files.

---

# 27. Implementation Priority

Recommended backend implementation order:

1. Project setup
2. Common response and exception handling
3. User entity
4. Authentication
5. Refresh tokens
6. Organizations
7. Organization memberships
8. AuthorizationService
9. Quizzes
10. Questions and options
11. Quiz publishing
12. Quiz attempts
13. Attempt answers and scoring
14. Certificates
15. Public certificate verification
16. Audit logging
17. Swagger documentation
18. Tests

---

# 28. Final Reminder

Skillmark is a multi-tenant quiz and certification backend.

The most important rule is:

```text
Business permissions are organization-scoped.
```

Do not use global user roles for OWNER or PARTICIPANT behavior.

Always check permissions through organization membership and ownership.
