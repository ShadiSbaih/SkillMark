# Skillmark Training, Assessment & Certification Platform

## Product Requirements Document (PRD) — Version 2.0

---

# 1\. Introduction

## 1.1 Purpose

This document defines the expanded product, functional, technical, user-role, permission, architectural, and infrastructure requirements for **Skillmark**.

Skillmark is an **API-first university training, assessment, and certification backend platform**.

Skillmark helps organizations manage training programs and workshops, enroll participants, publish resources, run quizzes, evaluate attempts, track results, and issue verifiable certificates.

The product is especially suitable for:

*   university departments
*   student clubs
*   technical communities
*   training workshops
*   internship programs
*   bootcamps
*   internal university training
*   independent instructors and trainers
*   companies running internal employee training

The current phase focuses mainly on the **backend API**.

A frontend dashboard or student portal may be built later, but the backend must be designed to support it.

---

## 1.2 Product Expansion Summary

The previous version of Skillmark focused mainly on:

```
Organization → Quiz → Attempt → Certificate
```

The expanded version supports a larger university training flow:

```
Organization
  → Program / Workshop
      → Participants / Enrollments
      → Invitation Links
      → Resources
      → Quizzes
      → Attempts
      → Results
      → Certificates
      → Public Verification
      → Statistics
```

This makes Skillmark more than a quiz system.

It becomes a lightweight training and certification platform.

---

## 1.3 Product Scope

Skillmark provides APIs for:

*   authentication and user identity through Clerk
*   user profile synchronization with the backend
*   organization creation and management
*   organization membership management
*   program/workshop creation and management
*   program enrollment
*   invitation links for joining programs
*   program learning resources
*   file/image/media storage integration
*   quiz creation and publishing
*   quiz questions and answer options
*   quiz attempts and automatic scoring
*   certificate issuing
*   certificate PDF metadata
*   certificate QR code metadata
*   public certificate verification
*   statistics APIs
*   audit logging

---

## 1.4 What Skillmark Is Not

Skillmark is **not a full LMS** in the current phase.

The following features are out of scope for the MVP:

*   full course system
*   lessons
*   attendance
*   assignments
*   payments
*   billing and subscriptions
*   discussion rooms
*   chat system
*   calendar scheduling
*   video lectures
*   AI recommendations
*   advanced analytics dashboard
*   marketplace/public discovery
*   mobile app

Some of these features may be added later.

---

## 1.5 Product Positioning

### One-line pitch

> Skillmark helps university clubs, trainers, and organizations manage workshops, assess participants, and issue trusted verifiable certificates.

### Longer pitch

> Skillmark is a backend platform for managing university training programs, workshops, participant enrollment, resources, quizzes, scoring, and verifiable certificates using secure organization-scoped permissions.

---

## 1.6 Target Users

The platform targets:

*   university students
*   instructors
*   trainers
*   student club leaders
*   university departments
*   internship supervisors
*   technical community organizers
*   training centers
*   companies running internal training

---

## 1.7 Example University Use Case

A student club runs a workshop called **Introduction to Git & GitHub**.

The flow:

1.  Club leader creates an organization.
2.  Club leader creates a program/workshop.
3.  Club leader creates an invitation link.
4.  Students join using the invitation link.
5.  Club leader adds workshop resources.
6.  Club leader creates a quiz.
7.  Students submit attempts.
8.  System calculates score.
9.  Students who pass receive certificates.
10.  Anyone can verify certificates publicly.

Example:

*   Organization: Computer Science Club
*   Program: Git & GitHub Workshop
*   Resource: Git slides PDF
*   Quiz: Git Basics Final Quiz
*   Certificate: Git & GitHub Workshop Completion Certificate
*   Verification: Public verification code and QR code

---

# 2\. Technology Stack

## 2.1 Backend

Recommended backend stack:

*   Java 17+
*   Spring Boot
*   Spring Web
*   Spring Security
*   Spring Data JPA
*   Hibernate
*   Jakarta Validation
*   Flyway
*   Swagger/OpenAPI
*   Testcontainers (for integration tests)

---

## 2.2 Authentication Provider

Skillmark shall use:

```
Clerk
```

Clerk will handle:

*   user sign up
*   login
*   logout
*   session management
*   email verification
*   password reset
*   social login if enabled later
*   JWT/session token issuing

The backend shall verify Clerk-issued tokens.

The backend shall not implement its own password hashing, refresh token storage, email verification tokens, or password reset tokens.

---

## 2.3 Database Provider

Skillmark shall use:

```
Neon DB
```

Neon DB is the managed PostgreSQL database provider.

Use:

*   PostgreSQL
*   Neon connection string
*   Flyway migrations
*   database indexes
*   relational constraints

---

## 2.4 File/Object Storage

Skillmark shall use:

```
Cloudflare R2
```

Cloudflare R2 will be used for object storage such as:

*   certificate PDFs
*   uploaded resource files
*   generated QR code images if stored as files
*   other private or downloadable files

The backend shall store only file metadata and URLs/keys in the database.

---

## 2.5 Image/Media Management

Skillmark shall use:

```
Cloudinary
```

Cloudinary may be used for image/media assets such as:

*   organization logos
*   program cover images
*   certificate visual assets
*   public image transformations
*   optimized media delivery

Recommended separation:

| Provider | Main Use |
| --- | --- |
| Clerk | Authentication and user identity |
| Neon DB | PostgreSQL relational data |
| Cloudflare R2 | Files, PDFs, private objects |
| Cloudinary | Images, logos, media transformations |

---

# 3\. System Overview

## 3.1 System Type

Skillmark is an:

*   API-first backend platform
*   multi-tenant SaaS backend
*   university training platform
*   assessment and certification backend
*   organization-scoped permission system

---

## 3.2 Architecture Style

The system shall follow:

*   modular monolith architecture
*   RESTful API architecture
*   multi-tenant architecture
*   organization-scoped authorization
*   program-scoped enrollment
*   layered backend architecture
*   database-backed persistence
*   Clerk-based authentication
*   cloud object storage abstraction

---

## 3.3 Core Product Concept

A **User** is an identity/account.

A user must not be treated as globally `OWNER` or globally `PARTICIPANT`.

Permissions are defined at the organization level through:

```
organization_memberships
```

not through:

```
users.role
```

A single user can:

*   own one or more organizations
*   be a participant in one or more organizations
*   be OWNER in one organization
*   be PARTICIPANT in another organization
*   be enrolled in multiple programs
*   have different permissions depending on the organization context

Example:

A user named Ahmad can be:

*   OWNER of "Computer Science Club"
*   PARTICIPANT in "AI Training Program"
*   PARTICIPANT in "Java Bootcamp"

All business permissions must be based on organization memberships and program enrollments.

---

# 4\. User Types and Permissions

## 4.1 User Type Summary

The system supports four main user states/types:

1.  Unauthenticated Visitor
2.  Authenticated User
3.  Organization Owner
4.  Organization Participant / Program Participant

Important note:

`Organization Owner` and `Organization Participant` are not global user roles.

They are organization-level roles stored in:

```
organization_memberships
```

Program access is controlled by:

```
program_enrollments
```

---

## 4.2 Unauthenticated Visitor

An unauthenticated visitor is not logged in.

Allowed actions:

*   access public certificate verification
*   view public verification result

Not allowed:

*   create organizations
*   view private organizations
*   join programs
*   view private resources
*   start quiz attempts
*   submit quiz answers
*   view private certificates
*   manage members
*   create programs
*   create quizzes
*   issue certificates

---

## 4.3 Authenticated User

An authenticated user is a user who has a valid Clerk session/token.

Allowed actions:

*   view own backend profile
*   create organization
*   become owner of created organization
*   view accessible organizations
*   join a program using a valid invitation link
*   view own enrollments
*   view own quiz attempts
*   view own certificates

Not allowed without permission:

*   manage unrelated organizations
*   access unrelated programs
*   view private resources without enrollment
*   manage quizzes without OWNER permission
*   issue certificates without OWNER permission

---

## 4.4 Organization Owner

An Organization Owner is a user who has OWNER permission in a specific organization.

Ownership is represented by:

*   `organizations.owner_id`
*   `organization_memberships.role = OWNER`

An owner can manage only owned organizations.

Owner responsibilities:

*   manage organization details
*   manage organization members
*   create programs/workshops
*   manage programs/workshops
*   create invitation links
*   manually enroll participants
*   manage program resources
*   create quizzes
*   add questions and options
*   publish quizzes
*   view attempts and results
*   view statistics
*   issue certificates
*   revoke certificates
*   manage organization files/media

---

## 4.5 Organization Participant / Program Participant

A participant is a user with PARTICIPANT membership in an organization and/or active enrollment in a program.

Participant responsibilities:

*   view organizations where they are a member
*   join programs through invitation links
*   view programs they are enrolled in
*   view program resources
*   view published quizzes in enrolled programs
*   start quiz attempts
*   submit quiz answers
*   view own results
*   view own certificates
*   use public certificate verification

Participants cannot:

*   update organization details
*   add/remove members
*   create programs
*   create resources
*   create quizzes
*   publish quizzes
*   view unpublished quizzes
*   submit attempts for another user
*   issue/revoke certificates

---

## 4.6 Permission Matrix

| Feature | Visitor | Authenticated User | Organization Owner | Program Participant |
| --- | --- | --- | --- | --- |
| Public certificate verification | Yes | Yes | Yes | Yes |
| View own profile | No | Yes | Yes | Yes |
| Create organization | No | Yes | Yes | Yes |
| Manage organization | No | No | Yes, owned only | No |
| Add/remove members | No | No | Yes, owned only | No |
| Create program/workshop | No | No | Yes, owned only | No |
| Publish/archive program | No | No | Yes, owned only | No |
| Create invitation link | No | No | Yes, owned only | No |
| Join program by invitation | No | Yes | Yes | Yes |
| View program resources | No | If enrolled | Yes, owned only | Yes, if enrolled |
| Create resources | No | No | Yes, owned only | No |
| Create quiz | No | No | Yes, owned only | No |
| Publish quiz | No | No | Yes, owned only | No |
| View published quiz | No | If enrolled | Yes | Yes, if enrolled |
| Start attempt | No | If enrolled | If also enrolled | Yes |
| Submit attempt | No | Own attempt only | Own attempt only if enrolled | Own attempt only |
| View own attempts | No | Yes | Yes | Yes |
| View all attempts | No | No | Yes, owned only | No |
| Issue certificate | No | No | Yes, owned only | No |
| Revoke certificate | No | No | Yes, owned only | No |
| View own certificates | No | Yes | Yes | Yes |
| View organization statistics | No | No | Yes, owned only | No |
| View audit logs | No | No | Yes, owned only | No |

---

# 5\. Functional Requirements

---

## 5.1 Authentication and User Account Management

### FR-1: Clerk Authentication

The system shall use Clerk for authentication.

Clerk handles:

*   sign up
*   login
*   logout
*   session management
*   password reset
*   email verification
*   OAuth/social login if enabled later

The backend shall verify Clerk tokens on protected endpoints.

---

### FR-2: Clerk Token Verification Mechanism

The backend shall verify Clerk-issued tokens using the following strategy:

```
1. Frontend sends Bearer token in Authorization header:
   Authorization: Bearer <clerk_token>

2. Backend extracts the token from the Authorization header.

3. Backend fetches the JSON Web Key Set (JWKS) from the Clerk JWKS endpoint
   configured via CLERK_JWKS_URL environment variable.

4. Backend validates the token signature using the fetched public keys.

5. Backend validates standard JWT claims:
   - exp (not expired)
   - iss (matches CLERK_ISSUER)
   - nbf (not before, if present)

6. Backend extracts clerkUserId from the token subject (sub) claim.

7. Backend looks up local user by clerkUserId:
   - If found: load user into SecurityContext
   - If not found: auto-create local user from token claims, then load into SecurityContext

8. Backend stores the resolved local user in the Spring SecurityContext
   for use by controllers and services.
```

Implementation notes:

*   Use a custom Spring Security `OncePerRequestFilter` to perform token verification.
*   Use a JWT library such as `nimbus-jose-jwt` or `jjwt` for verification.
*   Cache the JWKS response to avoid fetching on every request.
*   Do not store raw tokens in the database.

---

### FR-3: Clerk Webhook Integration

The backend shall expose a Clerk webhook endpoint to receive user lifecycle events.

Webhook endpoint:

```
POST /api/v1/webhooks/clerk
```

Supported Clerk webhook events:

| Event | Backend Action |
| --- | --- |
| `user.created` | Create local user record if not exists |
| `user.updated` | Update local user name, email, avatar |
| `user.deleted` | Soft delete or deactivate local user |

Webhook security:

*   Verify the Clerk webhook signature on every incoming request.
*   Use `CLERK_WEBHOOK_SECRET` environment variable.
*   Reject requests with invalid or missing signatures with HTTP 401.
*   Do not process webhook payloads without signature verification.

Webhook reliability:

*   Webhook processing must be idempotent.
*   Duplicate events must not create duplicate users.
*   Failed webhook processing must be logged.

---

### FR-4: Backend User Profile Sync

The backend shall maintain a local `users` table for domain data.

The local user record shall be linked to Clerk using:

```
clerk_user_id
```

User auto-creation strategy:

```
On first authenticated API request:
1. Extract clerkUserId from verified token
2. Look up local user by clerkUserId
3. If not found: create local user from token claims (name, email, avatarUrl)
4. If found: proceed normally
5. Optionally update name/email/avatar if changed in token claims
```

The webhook strategy (FR-3) and the auto-creation strategy (FR-4) complement each other:

*   Webhooks handle proactive sync for events like user deletion.
*   Auto-creation handles the case where a user first hits the API before a webhook fires.

---

### FR-5: Current User Profile

The system shall allow authenticated users to retrieve their own backend profile.

```
GET /api/v1/users/me
```

The response must not expose sensitive internal data or raw Clerk tokens.

---

### FR-6: Auth Security

Since Clerk handles password and session security, the backend shall not store:

*   password hashes
*   refresh token hashes
*   password reset tokens
*   email verification tokens

---

## 5.2 Organization Management

### FR-7: Create Organization

Any authenticated user can create an organization.

When a user creates an organization:

*   create organization record
*   set `owner_id` to current local user
*   create organization membership row with role OWNER and status ACTIVE

---

### FR-8: View Accessible Organizations

Users can view only organizations where they are active members or owners.

---

### FR-9: View Organization Details

Organization owners and active members can view organization details.

Unrelated users shall receive HTTP 404, not HTTP 403, to avoid leaking the existence of the organization.

---

### FR-10: Update Organization

Only organization owner can update organization details.

---

### FR-11: Disable or Delete Organization

Only organization owner can disable or soft delete organization.

Soft delete rules:

*   Set `deletedAt` timestamp.
*   Exclude soft deleted organizations from all list responses.
*   Preserve all historical programs, enrollments, attempts, and certificates.
*   Soft deleted organizations cannot be recovered in the MVP.

---

## 5.3 Organization Membership Management

### FR-12: Add Organization Member

Only organization owner can add users as PARTICIPANT members.

Required fields when adding a member:

*   `userId` (must exist in local backend users table)

Membership record must capture:

*   `invitedBy` (the owner who added this member)
*   `joinedAt` (timestamp of membership creation)

---

### FR-13: List Organization Members

Only organization owner can list organization members.

---

### FR-14: Remove Organization Member

Only organization owner can remove or disable a member.

Membership record must capture:

*   `removedBy` (the owner who removed this member)
*   `removedAt` (timestamp of removal)

Removed members lose access to protected organization data.

Historical attempts and certificates must remain preserved.

---

### FR-15: Membership Roles

Current roles:

*   OWNER
*   PARTICIPANT

Future roles (out of scope for MVP):

*   INSTRUCTOR
*   MANAGER
*   REVIEWER

---

## 5.4 Program / Workshop Management

### FR-16: Create Program

Only organization owner can create a program under an owned organization.

Program fields:

*   organizationId
*   title
*   description
*   coverImageUrl
*   startDate
*   endDate
*   status
*   isPublished

---

### FR-17: Update Program

Only organization owner can update a program.

---

### FR-18: Publish Program

Only organization owner can publish a program.

```
PATCH /api/v1/programs/{programId}/status
Body: { "status": "PUBLISHED" }
```

A published program is visible to enrolled participants.

---

### FR-19: Archive Program

Only organization owner can archive a program.

```
PATCH /api/v1/programs/{programId}/status
Body: { "status": "ARCHIVED" }
```

Archived program rules:

*   Preserve all enrollments, resources, quizzes, attempts, and certificates.
*   No new enrollments allowed on archived programs.
*   No new attempts allowed on quizzes in archived programs.

---

### FR-20: View Programs

Owners can view all programs in owned organizations.

Participants can view programs they are enrolled in.

---

## 5.5 Program Enrollment

### FR-21: Manual Enrollment

Organization owner can manually enroll a user into a program.

The user must exist in the backend users table.

Duplicate active enrollment must be prevented and return HTTP 409.

---

### FR-22: Join Program by Invitation

Authenticated users can join a program using a valid invitation code.

The system must check:

*   invitation exists
*   invitation status is ACTIVE
*   invitation is not expired
*   usage limit is not exceeded
*   program is joinable (not archived)
*   duplicate active enrollment does not exist

The join operation must be transactional.

On success:

*   increment invitation `usedCount`
*   create program enrollment record
*   add user as PARTICIPANT organization member if not already a member

---

### FR-23: View Own Enrollments

Participants can view their own enrolled programs.

---

### FR-24: Owner View Program Enrollments

Organization owners can view enrollments for owned programs.

---

## 5.6 Invitation Links

### FR-25: Create Invitation Link

Only organization owner can create invitation links for owned programs.

Invitation fields:

*   organizationId
*   programId
*   code
*   description (optional note about the invitation)
*   maxUses
*   usedCount
*   expiresAt
*   status
*   createdBy
*   createdAt
*   disabledAt

Invitation code format:

```
- 12-character random alphanumeric string
- Uppercase only
- Example: A3FX9KL2MN8P
- Generated using SecureRandom
- Uniqueness verified at generation time
- Case-insensitive comparison on lookup
```

---

### FR-26: Disable Invitation Link

Only organization owner can disable an invitation link.

```
PATCH /api/v1/invitations/{invitationId}/status
Body: { "status": "DISABLED" }
```

---

### FR-27: List Invitation Links

Only organization owner can list invitation links for owned programs.

---

## 5.7 Program Resources

### FR-28: Create Program Resource

Only organization owner can add resources to a program.

Supported resource types:

*   LINK
*   FILE
*   IMAGE
*   VIDEO\_LINK

Storage rules:

*   LINK resources store an external URL.
*   FILE resources may be uploaded to Cloudflare R2.
*   IMAGE resources may be uploaded to Cloudinary.
*   Public media URLs or object keys shall be stored in the database.

---

### FR-29: View Program Resources

Program resources can be viewed by:

*   organization owner
*   active enrolled participants

Unenrolled users shall receive HTTP 404.

---

### FR-30: Update Program Resource

Only organization owner can update resource details.

---

### FR-31: Archive/Delete Program Resource

Only organization owner can archive or delete resources.

Do not hard-delete storage files unless explicitly required.

---

### FR-32: File Upload Abstraction

The backend shall include a storage abstraction:

```
StorageService (interface)
  → R2StorageService (implementation)
  → CloudinaryMediaService (implementation)
```

Business logic and controllers shall not depend on vendor-specific SDKs directly.

---

## 5.8 Quiz Management

### FR-33: Create Quiz

Only organization owner can create quizzes under owned programs.

Quiz fields:

*   programId
*   title
*   description
*   passingScore
*   durationMinutes
*   maxAttempts
*   certificateEnabled
*   certificateIssueMode (AUTO or MANUAL)
*   isPublished
*   status

---

### FR-34: Add Quiz Questions

Only organization owner can add questions to quizzes.

Current MVP supports:

*   SINGLE\_CHOICE

Future (out of scope for MVP):

*   TRUE\_FALSE
*   MULTIPLE\_CHOICE
*   SHORT\_ANSWER
*   CODING\_QUESTION

---

### FR-35: Update Quiz Question

Only organization owner can update a quiz question.

---

### FR-36: Delete Quiz Question

Only organization owner can delete a quiz question.

---

### FR-37: Add Quiz Options

Only organization owner can add answer options to questions.

A SINGLE\_CHOICE question must have exactly one correct answer before publishing.

---

### FR-38: Update Quiz Option

Only organization owner can update a quiz option.

---

### FR-39: Delete Quiz Option

Only organization owner can delete a quiz option.

---

### FR-40: Publish Quiz

Only organization owner can publish a quiz.

```
PATCH /api/v1/quizzes/{quizId}/status
Body: { "status": "PUBLISHED" }
```

A quiz cannot be published unless:

*   it has at least one question
*   every question has at least two options
*   every SINGLE\_CHOICE question has exactly one correct option
*   passingScore is between 1 and 100
*   maxAttempts is at least 1
*   durationMinutes is at least 1

---

### FR-41: View Quizzes

Owners can view all quizzes in owned programs.

Participants can view published quizzes in enrolled programs only.

---

### FR-42: Archive or Delete Quiz

Only organization owner can archive or soft delete a quiz.

Historical attempts and certificates must remain consistent after archiving.

---

## 5.9 Quiz Attempt Management

### FR-43: Start Quiz Attempt

An enrolled participant can start an attempt for a published quiz.

The system must enforce:

*   user is enrolled in the quiz program
*   quiz is published and active
*   max attempts limit is not exceeded
*   no currently active (in-progress) attempt exists for this user and quiz

On attempt creation:

*   record `startedAt` as current timestamp
*   record `expiresAt` as `startedAt + quiz.durationMinutes`
*   record `attemptNumber` as the count of previous attempts + 1
*   set status to IN\_PROGRESS

---

### FR-44: Submit Quiz Attempt

The system shall allow users to submit answers for their own in-progress quiz attempts.

Submission rules:

*   Backend shall reject submissions if `current time > attempt.expiresAt`.
*   The client must never send or control the final score.

The backend shall calculate:

*   points awarded per question
*   total score
*   score percentage
*   pass/fail result based on `quiz.passingScore`
*   `submittedAt` timestamp

After calculation:

*   set attempt status to SUBMITTED
*   store score results on attempt record

---

### FR-45: AUTO Certificate Issuance Flow

When `quiz.certificateIssueMode = AUTO` and the attempt passes:

```
1. User submits attempt.
2. Backend calculates score.
3. Score >= passingScore AND certificateIssueMode = AUTO:
   a. Check for duplicate active certificate (same user + quiz + ACTIVE status).
   b. If no duplicate exists: issue certificate synchronously.
   c. Return attempt result response with certificate reference included.
4. If certificate issuance fails:
   a. Log the error.
   b. Return attempt result without certificate reference.
   c. Do NOT fail or roll back the attempt submission.
```

---

### FR-46: Prevent Invalid Submissions

The system shall reject:

*   submissions for another user's attempt (HTTP 403)
*   submissions for already submitted attempts (HTTP 409)
*   submissions received after `attempt.expiresAt` (HTTP 422)
*   answers using options from another quiz (HTTP 422)
*   answers using questions from another quiz (HTTP 422)
*   attempts for archived or unpublished quizzes (HTTP 422)
*   attempts exceeding `quiz.maxAttempts` (HTTP 422)

---

### FR-47: View Attempts

Participants can view their own attempts.

Owners can view all attempts for quizzes in their owned programs.

---

## 5.10 Certificate Management

### FR-48: Issue Certificate

Certificates may be issued:

*   automatically after a passing attempt if `certificateIssueMode = AUTO`
*   manually by organization owner if `certificateIssueMode = MANUAL`

---

### FR-49: Certificate Eligibility

A certificate can only be issued if:

*   target user exists
*   target user is actively enrolled in the program
*   target user has a submitted passing attempt
*   no duplicate active certificate exists for the same user and quiz

---

### FR-50: Certificate Number

The system shall generate a unique human-readable certificate number.

Format:

```
CERT-{YEAR}-{RANDOM_8_ALPHANUMERIC}
Example: CERT-2024-AX93KL2P
```

---

### FR-51: Verification Code

The system shall generate a unique verification code.

Format:

```
- 16-character random alphanumeric string
- Uppercase only
- Generated using SecureRandom
- Example: A3FX9KL2MN8PQR7Z
```

---

### FR-52: Certificate Verification URL

The QR code embedded in a certificate shall encode a public verification URL.

Format:

```
https://{APP_CERTIFICATE_VERIFY_BASE_URL}/verify/{verificationCode}

Example:
https://verify.skillmark.io/verify/A3FX9KL2MN8PQR7Z
```

The backend API verifies certificates via:

```
GET /api/v1/public/certificates/verify/{verificationCode}
```

This endpoint is public and requires no authentication.

---

### FR-53: Certificate Snapshots

The system shall store snapshot values at issuance time:

*   participantNameSnapshot
*   quizTitleSnapshot
*   programTitleSnapshot
*   organizationNameSnapshot

This preserves certificate accuracy even if names change after issuance.

---

### FR-54: Certificate PDF and QR Support

Certificates shall support:

*   pdfUrl
*   pdfObjectKey
*   qrCodeUrl
*   qrCodeObjectKey

Recommended storage:

*   certificate PDFs in Cloudflare R2
*   QR code images in Cloudflare R2 or Cloudinary

The first MVP may store metadata only and generate actual files in a later phase.

---

### FR-55: View Own Certificates

Users can view their own certificates.

---

### FR-56: View Organization Certificates

Organization owners can view all certificates issued under owned organizations.

---

### FR-57: Public Certificate Verification

The system shall provide a public endpoint to verify certificates by verification code.

```
GET /api/v1/public/certificates/verify/{verificationCode}
```

Public response must not expose sensitive user data.

Required public response fields:

*   certificateStatus
*   participantNameSnapshot
*   quizTitleSnapshot
*   programTitleSnapshot
*   organizationNameSnapshot
*   issuedAt
*   isRevoked
*   revokedAt (if revoked)
*   revokeReason (if revoked)

---

### FR-58: Revoke Certificate

Only organization owner can revoke certificates issued under owned organization.

Revoked certificates must remain historically visible and verifiable as REVOKED.

---

## 5.11 Statistics

### FR-59: Organization Statistics

Organization owner can view statistics:

*   total programs
*   total members
*   total enrolled participants
*   total quizzes
*   total attempts
*   total certificates issued
*   average score across all quizzes
*   overall pass rate

---

### FR-60: Program Statistics

Organization owner can view program statistics:

*   enrolled participants count
*   resources count
*   quizzes count
*   attempts count
*   passed participants count
*   certificates issued count
*   average score

---

### FR-61: Quiz Statistics

Organization owner can view quiz statistics:

*   total attempts count
*   submitted attempts count
*   average score
*   highest score
*   lowest score
*   pass count
*   fail count
*   pass rate percentage

---

## 5.12 Audit Logging

### FR-62: Audit Sensitive Actions

The system shall record audit logs for the following actions:

*   organization created
*   organization updated
*   organization deleted
*   member added
*   member removed
*   program created
*   program updated
*   program published
*   program archived
*   invitation created
*   invitation disabled
*   user joined program via invitation
*   user manually enrolled in program
*   resource created
*   resource deleted
*   quiz created
*   quiz updated
*   quiz published
*   quiz archived
*   attempt started
*   attempt submitted
*   certificate issued
*   certificate revoked

---

### FR-63: Audit Metadata

Audit log fields:

*   id
*   actorUserId
*   organizationId
*   action
*   entityType
*   entityId
*   ipAddress
*   userAgent
*   metadata (JSON, optional additional context)
*   createdAt

Audit logs must never be soft deleted.

Audit metadata must not include:

*   raw Clerk tokens
*   secrets
*   private API keys
*   sensitive authentication data

---

### FR-64: Audit Log Access

Organization owners can view audit logs for their own organizations.

```
GET /api/v1/organizations/{organizationId}/audit-logs
```

Audit log list endpoints must support pagination.

Unauthenticated users cannot access audit logs.

Non-owner members cannot access audit logs.

---

# 6\. Data Model

## 6.1 Primary Entities

*   User
*   Organization
*   OrganizationMembership
*   Program
*   ProgramEnrollment
*   InvitationLink
*   ProgramResource
*   Quiz
*   QuizQuestion
*   QuizOption
*   QuizAttempt
*   QuizAttemptAnswer
*   Certificate
*   AuditLog

Optional storage metadata entities (may be deferred):

*   StoredFile
*   MediaAsset

---

## 6.2 Removed/Deprecated Auth Entities

Because Skillmark uses Clerk, the backend MVP shall not implement:

*   RefreshToken
*   EmailVerificationToken
*   PasswordResetToken

---

## 6.3 User Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| clerkUserId | String | Unique, indexed |
| name | String |   |
| email | String | Unique, indexed |
| avatarUrl | String | Nullable |
| status | Enum | ACTIVE, INACTIVE, DELETED |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |

---

## 6.4 Organization Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| name | String |   |
| description | String | Nullable |
| ownerId | UUID | FK to users |
| logoUrl | String | Nullable |
| status | Enum | ACTIVE, DISABLED |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |
| deletedAt | Timestamp | Nullable, soft delete |

---

## 6.5 OrganizationMembership Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| organizationId | UUID | FK to organizations |
| userId | UUID | FK to users |
| role | Enum | OWNER, PARTICIPANT |
| status | Enum | ACTIVE, REMOVED |
| invitedBy | UUID | FK to users, nullable |
| joinedAt | Timestamp |   |
| removedBy | UUID | FK to users, nullable |
| removedAt | Timestamp | Nullable |

Unique constraint: `(organizationId, userId)` where status = ACTIVE.

---

## 6.6 Program Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| organizationId | UUID | FK to organizations |
| title | String |   |
| description | String | Nullable |
| coverImageUrl | String | Nullable |
| status | Enum | DRAFT, PUBLISHED, ARCHIVED |
| isPublished | Boolean |   |
| startDate | Date | Nullable |
| endDate | Date | Nullable |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |
| deletedAt | Timestamp | Nullable, soft delete |

---

## 6.7 ProgramEnrollment Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| programId | UUID | FK to programs |
| userId | UUID | FK to users |
| status | Enum | ACTIVE, COMPLETED, REMOVED |
| enrolledAt | Timestamp |   |
| completedAt | Timestamp | Nullable |
| removedAt | Timestamp | Nullable |

Unique constraint: `(programId, userId)` where status = ACTIVE.

---

## 6.8 InvitationLink Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| organizationId | UUID | FK to organizations |
| programId | UUID | FK to programs |
| code | String | Unique, indexed, 12-char uppercase alphanumeric |
| description | String | Nullable |
| maxUses | Integer | Nullable, null means unlimited |
| usedCount | Integer | Default 0 |
| expiresAt | Timestamp | Nullable |
| status | Enum | ACTIVE, DISABLED |
| createdBy | UUID | FK to users |
| createdAt | Timestamp |   |
| disabledAt | Timestamp | Nullable |

---

## 6.9 ProgramResource Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| programId | UUID | FK to programs |
| title | String |   |
| description | String | Nullable |
| type | Enum | LINK, FILE, IMAGE, VIDEO\_LINK |
| url | String | Nullable |
| storageProvider | Enum | R2, CLOUDINARY, EXTERNAL, Nullable |
| objectKey | String | Nullable |
| status | Enum | ACTIVE, ARCHIVED |
| position | Integer | Display order |
| createdBy | UUID | FK to users |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |

---

## 6.10 Quiz Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| programId | UUID | FK to programs |
| title | String |   |
| description | String | Nullable |
| passingScore | Integer | 1–100 |
| durationMinutes | Integer | Minimum 1 |
| maxAttempts | Integer | Minimum 1 |
| certificateEnabled | Boolean |   |
| certificateIssueMode | Enum | AUTO, MANUAL |
| isPublished | Boolean |   |
| status | Enum | DRAFT, PUBLISHED, ARCHIVED |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |
| deletedAt | Timestamp | Nullable, soft delete |

---

## 6.11 QuizQuestion Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| quizId | UUID | FK to quizzes |
| text | String |   |
| type | Enum | SINGLE\_CHOICE |
| points | Integer | Default 1 |
| position | Integer | Display order |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |

---

## 6.12 QuizOption Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| questionId | UUID | FK to quiz\_questions |
| text | String |   |
| isCorrect | Boolean |   |
| position | Integer | Display order |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |

---

## 6.13 QuizAttempt Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| quizId | UUID | FK to quizzes |
| userId | UUID | FK to users |
| attemptNumber | Integer | Which attempt this is (1, 2, 3...) |
| status | Enum | IN\_PROGRESS, SUBMITTED, EXPIRED |
| startedAt | Timestamp | When attempt was started |
| expiresAt | Timestamp | startedAt + quiz.durationMinutes |
| submittedAt | Timestamp | Nullable |
| totalPoints | Integer | Nullable, calculated on submit |
| earnedPoints | Integer | Nullable, calculated on submit |
| scorePercentage | Decimal | Nullable, calculated on submit |
| isPassed | Boolean | Nullable, calculated on submit |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |

---

## 6.14 QuizAttemptAnswer Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| attemptId | UUID | FK to quiz\_attempts |
| questionId | UUID | FK to quiz\_questions |
| selectedOptionId | UUID | FK to quiz\_options, nullable |
| isCorrect | Boolean | Nullable, set on submission |
| pointsAwarded | Integer | Nullable, set on submission |
| createdAt | Timestamp |   |

---

## 6.15 Certificate Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| certificateNumber | String | Unique, format: CERT-{YEAR}-{8\_CHARS} |
| verificationCode | String | Unique, indexed, 16-char uppercase alphanumeric |
| organizationId | UUID | FK to organizations |
| programId | UUID | FK to programs |
| quizId | UUID | FK to quizzes |
| userId | UUID | FK to users |
| attemptId | UUID | FK to quiz\_attempts |
| title | String |   |
| participantNameSnapshot | String |   |
| quizTitleSnapshot | String |   |
| programTitleSnapshot | String |   |
| organizationNameSnapshot | String |   |
| status | Enum | ACTIVE, REVOKED |
| issuedAt | Timestamp |   |
| revokedAt | Timestamp | Nullable |
| revokeReason | String | Nullable |
| pdfUrl | String | Nullable |
| pdfObjectKey | String | Nullable |
| qrCodeUrl | String | Nullable |
| qrCodeObjectKey | String | Nullable |
| createdAt | Timestamp |   |
| updatedAt | Timestamp |   |

---

## 6.16 AuditLog Entity

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| actorUserId | UUID | FK to users, nullable (system actions) |
| organizationId | UUID | FK to organizations, nullable |
| action | String | e.g. CERTIFICATE\_ISSUED |
| entityType | String | e.g. Certificate |
| entityId | UUID | Nullable |
| ipAddress | String | Nullable |
| userAgent | String | Nullable |
| metadata | JSONB | Nullable, additional context |
| createdAt | Timestamp | Never updated or deleted |

---

## 6.17 Database Indexes

The following indexes shall be created via Flyway migrations:

```
-- Users
CREATE UNIQUE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Organization Memberships
CREATE INDEX idx_org_memberships_user_id ON organization_memberships(user_id);
CREATE INDEX idx_org_memberships_org_id ON organization_memberships(organization_id);

-- Program Enrollments
CREATE INDEX idx_program_enrollments_user_id ON program_enrollments(user_id);
CREATE INDEX idx_program_enrollments_program_id ON program_enrollments(program_id);

-- Invitation Links
CREATE UNIQUE INDEX idx_invitation_links_code ON invitation_links(code);

-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- Certificates
CREATE UNIQUE INDEX idx_certificates_verification_code ON certificates(verification_code);
CREATE UNIQUE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_organization_id ON certificates(organization_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 6.18 Soft Delete Conventions

The following rules govern soft deletion across all entities:

```
1. Soft deleted records have deletedAt set to a non-null timestamp.
2. Soft deleted records are excluded from all list API responses by default.
3. Soft deleted records are excluded from all permission and authorization checks.
4. Soft deleting a parent record does NOT automatically soft delete children.
   Children are preserved for historical integrity.
5. Certificates are never hard deleted.
6. Audit logs are never soft deleted and never hard deleted.
7. Soft deleted organizations cannot be restored in the MVP.
8. Soft deleted programs cannot be restored in the MVP.
9. Soft deleted quizzes cannot be restored in the MVP.
```

---

# 7\. API Design

## 7.1 API Base Path

All versioned endpoints shall use:

```
/api/v1
```

---

## 7.2 Standard Response Wrapper

All API responses shall use a consistent response wrapper.

### Success response (single resource):

```
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Success response (list with pagination):

```
{
  "success": true,
  "message": "OK",
  "data": [ ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error response:

```
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/organizations"
}
```

---

## 7.3 HTTP Status Code Conventions

| Status Code | Meaning | When to Use |
| --- | --- | --- |
| 200 | OK | Successful GET, PUT, PATCH responses |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Request validation failure (missing fields, bad format) |
| 401 | Unauthorized | Missing or invalid Clerk token |
| 403 | Forbidden | Authenticated but no permission for the action |
| 404 | Not Found | Resource does not exist or is hidden for security |
| 409 | Conflict | Duplicate resource (already enrolled, duplicate certificate) |
| 422 | Unprocessable Entity | Business rule violation (expired attempt, max attempts exceeded) |
| 500 | Internal Server Error | Unexpected server-side failure |

Security note:

> Return HTTP 404 instead of HTTP 403 when the goal is to avoid revealing the existence of a resource to unauthorized users. For example, a user trying to access another organization's data should receive 404 not 403.

---

## 7.4 Pagination Conventions

All list endpoints shall support pagination using the following query parameters:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| page | Integer | 0 | Zero-based page number |
| size | Integer | 20 | Page size, maximum 100 |
| sort | String | createdAt | Field to sort by |
| direction | String | DESC | ASC or DESC |

Example request:

```
GET /api/v1/organizations/{organizationId}/members?page=0&size=20&sort=joinedAt&direction=DESC
```

---

## 7.5 Error Handling Conventions

### Validation errors (HTTP 400):

Triggered by Jakarta Validation failures (`@NotBlank`, `@NotNull`, `@Size`, etc.).

Response includes field-level error details.

### Business rule errors (HTTP 422):

Triggered by service-layer business rule violations.

Examples:

*   attempt submission after expiry
*   quiz publish with no questions
*   enrolling in an archived program

### Conflict errors (HTTP 409):

Triggered by duplicate data violations.

Examples:

*   user already enrolled in program
*   active certificate already exists for user and quiz

### Not found (HTTP 404):

Triggered when a resource does not exist or when hiding existence for security.

### Auth errors:

*   HTTP 401: token is missing, expired, or invalid
*   HTTP 403: token is valid but user lacks permission for the specific action

---

## 7.6 Authentication / User APIs

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/users/me` | Get current authenticated user profile |
| PATCH | `/api/v1/users/me` | Update current user profile (name, avatar) |
| POST | `/api/v1/webhooks/clerk` | Clerk webhook receiver (no auth required, signature verified) |

---

## 7.7 Organization APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/organizations` | Create organization |
| GET | `/api/v1/organizations` | List accessible organizations |
| GET | `/api/v1/organizations/{organizationId}` | Get organization details |
| PUT | `/api/v1/organizations/{organizationId}` | Update organization |
| DELETE | `/api/v1/organizations/{organizationId}` | Soft delete organization |
| GET | `/api/v1/organizations/{organizationId}/stats` | Get organization statistics |
| GET | `/api/v1/organizations/{organizationId}/audit-logs` | Get organization audit logs |

---

## 7.8 Organization Membership APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/organizations/{organizationId}/members` | Add member |
| GET | `/api/v1/organizations/{organizationId}/members` | List members |
| DELETE | `/api/v1/organizations/{organizationId}/members/{userId}` | Remove member |

---

## 7.9 Program APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/organizations/{organizationId}/programs` | Create program |
| GET | `/api/v1/organizations/{organizationId}/programs` | List programs in organization |
| GET | `/api/v1/programs/{programId}` | Get program details |
| PUT | `/api/v1/programs/{programId}` | Update program |
| PATCH | `/api/v1/programs/{programId}/status` | Publish or archive program |
| DELETE | `/api/v1/programs/{programId}` | Soft delete program |
| GET | `/api/v1/programs/{programId}/stats` | Get program statistics |

---

## 7.10 Program Enrollment APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/programs/{programId}/enrollments` | Manually enroll user (owner only) |
| GET | `/api/v1/programs/{programId}/enrollments` | List enrollments (owner only) |
| GET | `/api/v1/enrollments/me` | View own enrollments |
| DELETE | `/api/v1/programs/{programId}/enrollments/{userId}` | Remove enrollment (owner only) |

---

## 7.11 Invitation APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/programs/{programId}/invitations` | Create invitation link (owner only) |
| GET | `/api/v1/programs/{programId}/invitations` | List invitation links (owner only) |
| PATCH | `/api/v1/invitations/{invitationId}/status` | Disable invitation link (owner only) |
| POST | `/api/v1/invitations/{code}/join` | Join program using invitation code |

---

## 7.12 Resource APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/programs/{programId}/resources` | Create resource (owner only) |
| GET | `/api/v1/programs/{programId}/resources` | List program resources |
| GET | `/api/v1/resources/{resourceId}` | Get single resource |
| PUT | `/api/v1/resources/{resourceId}` | Update resource (owner only) |
| DELETE | `/api/v1/resources/{resourceId}` | Archive/delete resource (owner only) |

Optional file upload endpoints:

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/files/r2/upload-url` | Generate R2 presigned upload URL |
| POST | `/api/v1/media/cloudinary/signature` | Generate Cloudinary upload signature |

---

## 7.13 Quiz APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/programs/{programId}/quizzes` | Create quiz (owner only) |
| GET | `/api/v1/programs/{programId}/quizzes` | List quizzes in program |
| GET | `/api/v1/quizzes/{quizId}` | Get quiz details |
| PUT | `/api/v1/quizzes/{quizId}` | Update quiz (owner only) |
| PATCH | `/api/v1/quizzes/{quizId}/status` | Publish or archive quiz (owner only) |
| DELETE | `/api/v1/quizzes/{quizId}` | Soft delete quiz (owner only) |
| GET | `/api/v1/quizzes/{quizId}/stats` | Get quiz statistics (owner only) |

---

## 7.14 Quiz Question APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/quizzes/{quizId}/questions` | Add question (owner only) |
| PUT | `/api/v1/questions/{questionId}` | Update question (owner only) |
| DELETE | `/api/v1/questions/{questionId}` | Delete question (owner only) |

---

## 7.15 Quiz Option APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/questions/{questionId}/options` | Add option (owner only) |
| PUT | `/api/v1/options/{optionId}` | Update option (owner only) |
| DELETE | `/api/v1/options/{optionId}` | Delete option (owner only) |

---

## 7.16 Quiz Attempt APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/quizzes/{quizId}/attempts` | Start quiz attempt |
| POST | `/api/v1/quiz-attempts/{attemptId}/submit` | Submit quiz attempt |
| GET | `/api/v1/quiz-attempts/me` | View own attempts |
| GET | `/api/v1/quiz-attempts/{attemptId}` | Get single attempt |
| GET | `/api/v1/quizzes/{quizId}/attempts` | View all attempts for quiz (owner only) |

---

## 7.17 Certificate APIs

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/quiz-attempts/{attemptId}/certificate` | Issue certificate manually (owner only) |
| GET | `/api/v1/certificates/me` | View own certificates |
| GET | `/api/v1/certificates/organization/{organizationId}` | View organization certificates (owner only) |
| GET | `/api/v1/certificates/{certificateId}` | Get certificate details |
| POST | `/api/v1/certificates/{certificateId}/revoke` | Revoke certificate (owner only) |
| GET | `/api/v1/public/certificates/verify/{verificationCode}` | Public certificate verification (no auth) |

---

# 8\. Infrastructure and Integration Requirements

## 8.1 Clerk Integration Requirements

Environment variables:

```
CLERK_SECRET_KEY=
CLERK_ISSUER=
CLERK_JWKS_URL=
CLERK_WEBHOOK_SECRET=
```

The backend shall:

*   verify Clerk JWT tokens using JWKS
*   extract `clerkUserId` from token `sub` claim
*   map `clerkUserId` to local user record
*   auto-create local user if missing
*   protect private endpoints using a Spring Security filter
*   allow public endpoints without authentication
*   verify Clerk webhook signatures using `CLERK_WEBHOOK_SECRET`
*   cache JWKS response to avoid unnecessary external calls

---

## 8.2 Neon DB Requirements

Environment variables:

```
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
```

The backend shall:

*   connect to Neon PostgreSQL using the provided connection string
*   run Flyway migrations on startup
*   use connection pooling appropriate for serverless Neon DB
*   apply all required indexes defined in section 6.17
*   use relational constraints and foreign keys
*   use status-based soft deletion where defined

---

## 8.3 Cloudflare R2 Requirements

Environment variables:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
```

Use cases:

*   certificate PDFs
*   downloadable program resource files
*   QR code images if stored as files

Implementation notes:

*   Use the AWS S3-compatible SDK to interact with R2.
*   Generate presigned URLs for client-side uploads when needed.
*   Store only object keys and public URLs in the database.

---

## 8.4 Cloudinary Requirements

Environment variables:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use cases:

*   organization logos
*   program cover images
*   certificate design assets
*   optimized image delivery

---

## 8.5 Application Environment Variables

Complete consolidated list of environment variables:

```
# Application
APP_BASE_URL=
APP_CERTIFICATE_VERIFY_BASE_URL=

# Authentication (Clerk)
CLERK_SECRET_KEY=
CLERK_ISSUER=
CLERK_JWKS_URL=
CLERK_WEBHOOK_SECRET=

# Database (Neon)
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 8.6 File Storage Abstraction

The backend shall use a storage abstraction layer:

```
StorageService (interface)
  uploadFile(byte[] data, String key, String contentType): String
  deleteFile(String key): void
  getPublicUrl(String key): String

R2StorageService implements StorageService
CloudinaryMediaService implements StorageService
```

Controllers and business services shall not call vendor SDKs directly.

---

## 8.7 CORS Configuration

The backend shall configure CORS using environment-provided allowed origins.

```
Allowed origins:     configurable via APP_BASE_URL or dedicated CORS_ALLOWED_ORIGINS variable
Allowed methods:     GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed headers:     Authorization, Content-Type, Accept
Exposed headers:     none
Allow credentials:   true if session-based, false if JWT-only
```

---

## 8.8 Rate Limiting

The backend shall enforce rate limiting on sensitive endpoints.

| Endpoint | Limit |
| --- | --- |
| `POST /api/v1/invitations/{code}/join` | 10 requests/minute per user |
| `POST /api/v1/quizzes/{quizId}/attempts` | 5 requests/minute per user |
| `GET /api/v1/public/certificates/verify/{verificationCode}` | 30 requests/minute per IP |
| General authenticated API | 200 requests/minute per user |

Implementation: Spring-level filter or API gateway-level enforcement.

---

## 8.9 Health Check Endpoints

The backend shall expose Spring Boot Actuator health endpoints:

```
GET /actuator/health
  → Returns application health status
  → Used by deployment infrastructure for readiness checks
  → No authentication required

GET /actuator/info
  → Returns application version and build info
  → No authentication required
```

These endpoints shall be publicly accessible.

---

# 9\. Non-Functional Requirements

## 9.1 Security

The system must:

*   verify Clerk tokens on every protected request
*   protect all private APIs from unauthenticated access
*   enforce organization-scoped authorization on every organization action
*   enforce program enrollment access on every program content action
*   prevent cross-tenant data access
*   avoid exposing provider secrets in API responses
*   avoid logging raw tokens or secrets
*   return HTTP 404 instead of HTTP 403 where resource existence should be hidden
*   verify Clerk webhook signatures before processing

---

## 9.2 Performance

*   Common API responses shall not exceed 2 seconds under normal load.
*   All list endpoints shall use pagination.
*   All frequently queried fields shall have database indexes as defined in section 6.17.
*   JWKS responses from Clerk shall be cached to reduce external calls.

---

## 9.3 Availability

The backend shall:

*   support deployment to cloud environments
*   expose health check endpoints at `/actuator/health`
*   use connection pooling suitable for managed PostgreSQL

---

## 9.4 Maintainability

The system shall follow modular monolith architecture.

Recommended modules:

*   user
*   organization
*   membership
*   program
*   enrollment
*   invitation
*   resource
*   quiz
*   attempt
*   certificate
*   stats
*   audit
*   storage
*   media
*   security
*   common
*   config

Each module shall have its own:

*   controller
*   service
*   repository
*   DTOs
*   entity

---

## 9.5 API Usability

The API shall provide:

*   consistent response wrappers (section 7.2)
*   clear validation error messages
*   pagination on all list endpoints (section 7.4)
*   predictable naming conventions
*   Swagger/OpenAPI documentation at `/swagger-ui.html`

---

# 10\. System Architecture

## 10.1 High-Level Architecture

```
Client (Frontend / API Consumer)
        │
        ▼
Spring Security Filter (Clerk Token Verification)
        │
        ▼
Controller Layer (REST API)
        │
        ▼
Service Layer (Business Logic + Authorization)
        │
        ▼
Repository Layer (Spring Data JPA)
        │
        ▼
Neon PostgreSQL Database

Service Layer also calls:
  → StorageService → Cloudflare R2
  → MediaService   → Cloudinary

Clerk Webhooks:
  → POST /api/v1/webhooks/clerk → UserSyncService
```

---

## 10.2 Backend API Layer

Responsibilities:

*   expose REST endpoints
*   validate request DTOs using Jakarta Validation
*   return standardized response wrappers
*   delegate to service layer
*   handle exceptions via global exception handler (`@ControllerAdvice`)

---

## 10.3 Service Layer

Responsibilities:

*   enforce business rules
*   enforce organization-scoped authorization
*   enforce program enrollment access control
*   manage transactions (`@Transactional`)
*   coordinate repositories
*   call storage and media services when needed
*   emit audit log entries

---

## 10.4 Repository Layer

Responsibilities:

*   database access via Spring Data JPA
*   custom query methods where needed
*   pagination support via `Pageable`
*   soft delete filtering via `@Where` or query conditions

---

## 10.5 Security Layer

Responsibilities:

*   Clerk token verification via custom `OncePerRequestFilter`
*   current user resolution and injection into `SecurityContext`
*   public/private endpoint separation via `SecurityFilterChain`
*   Clerk webhook signature verification

---

## 10.6 Storage Layer

Responsibilities:

*   abstract file upload and retrieval
*   interact with Cloudflare R2 via S3-compatible SDK
*   interact with Cloudinary via Cloudinary SDK
*   hide provider-specific details from business services
*   store object keys and public URLs in database

---

# 11\. MVP Scope

## 11.1 Included in MVP

1.  Clerk authentication integration and token verification
2.  Clerk webhook integration for user sync
3.  Backend user profile management
4.  Organizations and organization membership
5.  Programs and workshops
6.  Program enrollments
7.  Invitation links
8.  Program resources
9.  Quizzes, questions, and options
10.  Quiz attempts with timing enforcement
11.  Automatic quiz scoring
12.  AUTO and MANUAL certificate issuance
13.  Certificate verification (public endpoint)
14.  Statistics APIs
15.  Audit logging
16.  R2 and Cloudinary storage abstraction
17.  Swagger/OpenAPI documentation
18.  Health check endpoints

---

## 11.2 Deferred to Later Phases

*   full LMS course system
*   lessons and assignments
*   attendance tracking
*   badges and leaderboards
*   payments and billing
*   multi-owner organizations
*   advanced question bank
*   question pools and randomization
*   advanced analytics dashboard
*   notifications
*   chat and messaging
*   mobile app
*   microservices migration

---

# 12\. Testing Requirements

## 12.1 Test Database Strategy

```
Integration tests:
  Use Testcontainers with a real PostgreSQL Docker image.
  Run Flyway migrations against the test container.
  Do not use H2 in-memory database.
  H2 does not support all PostgreSQL-specific features used by Flyway migrations.

Unit tests:
  Mock repository and external service dependencies.
  Do not require a running database.
```

---

## 12.2 Minimum Test Coverage Targets

| Layer | Minimum Coverage |
| --- | --- |
| Service layer | 80% line coverage |
| Controller layer | Covered by integration tests |
| Repository layer | Covered by integration tests |
| Security layer | Dedicated security test suite |
| Overall project | 70% minimum |

---

## 12.3 Unit Tests

Unit tests shall cover:

*   Clerk user sync logic
*   organization authorization checks
*   membership role rules
*   program enrollment validation
*   invitation code validation and expiry checks
*   quiz publishing validation rules
*   quiz scoring calculation
*   certificate eligibility rules
*   certificate number and verification code generation
*   statistics calculation logic

---

## 12.4 Integration Tests

Integration tests shall cover:

*   current user auto-creation on first request
*   organization creation and owner membership creation
*   program creation under organization
*   invitation join flow end-to-end
*   resource access control (enrolled vs unenrolled)
*   quiz creation and publishing flow
*   attempt start, submit, and scoring
*   AUTO certificate issuance after passing attempt
*   MANUAL certificate issuance by owner
*   public certificate verification endpoint
*   cross-organization access rejection
*   duplicate enrollment rejection (HTTP 409)
*   attempt submission after expiry rejection (HTTP 422)

---

## 12.5 Security Tests

Security tests shall verify:

*   protected endpoints return HTTP 401 without token
*   invalid or expired Clerk tokens return HTTP 401
*   valid token but wrong organization returns HTTP 404
*   participants cannot access owner-only endpoints (HTTP 403 or HTTP 404)
*   owners cannot manage other owners' organizations (HTTP 404)
*   unenrolled users cannot view program resources (HTTP 404)
*   unauthenticated users cannot access audit logs (HTTP 401)
*   participants cannot access audit logs (HTTP 403 or HTTP 404)
*   sensitive data (tokens, secrets) is never exposed in API responses
*   Clerk webhook endpoint rejects requests with invalid signatures (HTTP 401)

---

# 13\. Final Product Statement

Skillmark is a university-focused training, assessment, and certification backend platform that helps organizations manage workshops, enroll participants, publish resources, run quizzes, track results, and issue verifiable certificates.

The system is built on:

*   **Spring Boot** for the backend API
*   **Clerk** for authentication and user identity
*   **Neon DB** for PostgreSQL data storage
*   **Cloudflare R2** for file and object storage
*   **Cloudinary** for image and media management

Skillmark is designed around a clean multi-tenant model where permissions are based entirely on organization memberships and program enrollments. Users do not have global roles. Every permission check is organization-scoped or program-scoped.

The platform is designed to be API-first, maintainable, secure, and extensible for future features such as courses, lessons, payments, and advanced analytics.