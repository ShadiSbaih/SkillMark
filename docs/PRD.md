# Skillmark Training, Assessment & Certification Platform

## Product Requirements Document (PRD)

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

The backend should verify Clerk-issued tokens.

The backend should not implement its own password hashing, refresh token storage, email verification tokens, or password reset tokens when Clerk is used.

---

## 2.3 Database Provider

Skillmark shall use:

```
Neon DB
```

Neon DB is the managed PostgreSQL database provider.

The backend database layer should still be designed as PostgreSQL-compatible.

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

The backend should store only file metadata and URLs/keys in the database.

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

Cloudinary should not replace Neon DB or R2.

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

*   OWNER of “Computer Science Club”
*   PARTICIPANT in “AI Training Program”
*   PARTICIPANT in “Java Bootcamp”

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
*   use Clerk-hosted authentication pages if frontend exists

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

---

# 5\. Functional Requirements

---

# 5.1 Authentication and User Account Management

## FR-1: Clerk Authentication

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

## FR-2: Backend User Profile Sync

The backend shall maintain a local `users` table for domain data.

The local user record should be linked to Clerk using:

```
clerk_user_id
```

When a Clerk user first accesses the backend, the system may:

*   create local user profile if missing
*   update email/name/avatar if changed
*   mark user status as ACTIVE

---

## FR-3: Current User Profile

The system shall allow authenticated users to retrieve their own backend profile.

The response must not expose sensitive internal data.

---

## FR-4: Auth Security

Since Clerk handles password and session security, the backend should not store:

*   password hashes
*   refresh token hashes
*   password reset tokens
*   email verification tokens

If Clerk is used fully, old auth-token entities are not part of the main MVP database.

---

# 5.2 Organization Management

## FR-5: Create Organization

Any authenticated user can create an organization.

When a user creates an organization:

*   create organization record
*   set `owner_id` to current local user
*   create organization membership row with role OWNER and status ACTIVE

---

## FR-6: View Accessible Organizations

Users can view only organizations where they are active members or owners.

---

## FR-7: View Organization Details

Organization owners and active members can view organization details.

Unrelated users must be rejected.

---

## FR-8: Update Organization

Only organization owner can update organization details.

---

## FR-9: Disable or Delete Organization

Only organization owner can disable or soft delete organization.

Preferred behavior:

*   soft delete
*   status-based disabling
*   preserve historical data

---

# 5.3 Organization Membership Management

## FR-10: Add Organization Member

Only organization owner can add users as PARTICIPANT members.

The target user must already exist in the local backend users table.

---

## FR-11: List Organization Members

Only organization owner can list organization members.

---

## FR-12: Remove Organization Member

Only organization owner can remove or disable a member.

Removed members lose access to protected organization data.

Historical attempts and certificates must remain preserved.

---

## FR-13: Membership Roles

Current roles:

*   OWNER
*   PARTICIPANT

Future roles:

*   INSTRUCTOR
*   MANAGER
*   REVIEWER

Future roles are out of scope for the MVP.

---

# 5.4 Program / Workshop Management

## FR-14: Create Program

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

## FR-15: Update Program

Only organization owner can update a program.

---

## FR-16: Publish Program

Only organization owner can publish a program.

A published program can be visible to enrolled participants.

---

## FR-17: Archive Program

Only organization owner can archive a program.

Archived programs should preserve:

*   enrollments
*   resources
*   quizzes
*   attempts
*   certificates

---

## FR-18: View Programs

Owners can view all programs in owned organizations.

Participants can view programs they are enrolled in.

---

# 5.5 Program Enrollment

## FR-19: Manual Enrollment

Organization owner can manually enroll a user into a program.

The user must exist in the backend users table.

Duplicate active enrollment must be prevented.

---

## FR-20: Join Program by Invitation

Authenticated users can join a program using a valid invitation code.

The system must check:

*   invitation exists
*   invitation status is ACTIVE
*   invitation is not expired
*   usage limit is not exceeded
*   program is joinable
*   duplicate active enrollment does not exist

The join operation should be transactional.

---

## FR-21: View Own Enrollments

Participants can view their own enrolled programs.

---

## FR-22: Owner View Program Enrollments

Organization owners can view enrollments for owned programs.

---

# 5.6 Invitation Links

## FR-23: Create Invitation Link

Only organization owner can create invitation links for owned programs.

Invitation fields:

*   organizationId
*   programId
*   code
*   maxUses
*   usedCount
*   expiresAt
*   status
*   createdBy

---

## FR-24: Disable Invitation Link

Only organization owner can disable an invitation link.

---

## FR-25: List Invitation Links

Only organization owner can list invitation links for owned programs.

---

# 5.7 Program Resources

## FR-26: Create Program Resource

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
*   Public media URLs or object keys should be stored in the database.

---

## FR-27: View Program Resources

Program resources can be viewed by:

*   organization owner
*   active enrolled participants

Unenrolled users cannot view private resources.

---

## FR-28: Archive/Delete Program Resource

Only organization owner can archive or delete resources.

Do not hard-delete storage files unless explicitly required.

---

## FR-29: File Upload Abstraction

The backend should include a storage abstraction, such as:

```
StorageService
```

Possible implementations:

*   R2StorageService
*   CloudinaryMediaService

The business logic should not directly depend on vendor-specific SDKs inside controllers.

---

# 5.8 Quiz Management

## FR-30: Create Quiz

Only organization owner can create quizzes under owned programs.

Quiz fields:

*   programId
*   title
*   description
*   passingScore
*   durationMinutes
*   maxAttempts
*   certificateEnabled
*   certificateIssueMode
*   isPublished
*   status

---

## FR-31: Add Quiz Questions

Only organization owner can add questions to quizzes.

Current MVP supports:

*   SINGLE\_CHOICE

Future:

*   TRUE\_FALSE
*   MULTIPLE\_CHOICE
*   SHORT\_ANSWER
*   CODING\_QUESTION

---

## FR-32: Add Quiz Options

Only organization owner can add answer options.

A SINGLE\_CHOICE question must have exactly one correct answer before publishing.

---

## FR-33: Publish Quiz

A quiz cannot be published unless:

*   it has at least one question
*   every question has valid options
*   every SINGLE\_CHOICE question has exactly one correct option
*   quiz settings are valid
*   passing score is valid
*   max attempts is valid

---

## FR-34: View Quizzes

Owners can view all quizzes in owned programs.

Participants can view published quizzes in enrolled programs.

---

## FR-35: Archive or Delete Quiz

Only organization owner can archive or soft delete a quiz.

Historical attempts and certificates must remain consistent.

---

# 5.9 Quiz Attempt Management

## FR-36: Start Quiz Attempt

An enrolled participant can start an attempt for a published quiz.

The system must enforce:

*   user is enrolled in the quiz program
*   quiz is published
*   quiz status allows attempts
*   max attempts limit is not exceeded

---

## FR-37: Submit Quiz Attempt

The system shall allow users to submit answers for their own quiz attempts.

The backend shall calculate:

*   points awarded
*   total score
*   score percentage
*   pass/fail result
*   submittedAt timestamp

The client must never send or control the final score.

---

## FR-38: Prevent Invalid Submissions

The system shall reject:

*   submissions for another user's attempt
*   submissions for already submitted attempts
*   answers using options from another quiz
*   answers using questions from another quiz
*   attempts for archived/unavailable quizzes
*   attempts exceeding maxAttempts

---

## FR-39: View Attempts

Participants can view their own attempts.

Owners can view attempts for quizzes in their owned programs.

---

# 5.10 Certificate Management

## FR-40: Issue Certificate

Certificates may be issued:

*   automatically after passing attempt if certificateIssueMode = AUTO
*   manually by organization owner if certificateIssueMode = MANUAL

---

## FR-41: Certificate Eligibility

A certificate can only be issued if:

*   target user exists
*   target user is actively enrolled in the program
*   target user has a submitted passing attempt
*   duplicate active certificate does not already exist for same quiz and user

---

## FR-42: Certificate Number

The system shall generate a unique certificate number.

---

## FR-43: Verification Code

The system shall generate a unique verification code.

---

## FR-44: Certificate Snapshots

The system shall store snapshot values at issuance time:

*   participantNameSnapshot
*   quizTitleSnapshot
*   programTitleSnapshot
*   organizationNameSnapshot

This preserves certificate history even if names change later.

---

## FR-45: Certificate PDF and QR Support

Certificates should support:

*   pdfUrl
*   pdfObjectKey
*   qrCodeUrl
*   qrCodeObjectKey

Recommended storage:

*   certificate PDFs in Cloudflare R2
*   QR code image in Cloudflare R2 or Cloudinary

The first MVP may store metadata only and generate actual files later.

---

## FR-46: View Own Certificates

Users can view their own certificates.

---

## FR-47: View Organization Certificates

Organization owners can view certificates issued under owned organizations.

---

## FR-48: Public Certificate Verification

The system shall provide a public endpoint to verify certificates by verification code.

Public response must not expose sensitive user data.

Recommended public response:

*   certificate status
*   participant name snapshot
*   quiz title snapshot
*   program title snapshot
*   organization name snapshot
*   issued date
*   revoked state if revoked

---

## FR-49: Revoke Certificate

Only organization owner can revoke certificates issued under owned organization.

Revoked certificates must remain historically visible and verifiable as revoked.

---

# 5.11 Statistics

## FR-50: Organization Statistics

Organization owner can view statistics such as:

*   total programs
*   total members
*   total enrolled participants
*   total quizzes
*   total attempts
*   total certificates
*   average score
*   pass rate

---

## FR-51: Program Statistics

Organization owner can view program statistics such as:

*   enrolled participants
*   resources count
*   quizzes count
*   attempts count
*   passed participants
*   certificates issued
*   average score

---

## FR-52: Quiz Statistics

Organization owner can view quiz statistics such as:

*   attempts count
*   submitted attempts
*   average score
*   highest score
*   lowest score
*   pass count
*   fail count
*   pass rate

---

# 5.12 Audit Logging

## FR-53: Audit Sensitive Actions

The system shall record audit logs for important actions:

*   organization created
*   organization updated
*   member added
*   member removed
*   program created
*   program published
*   invitation created
*   user joined program
*   resource created
*   quiz created
*   quiz published
*   attempt submitted
*   certificate issued
*   certificate revoked
*   login/auth failure if available from backend checks

---

## FR-54: Audit Metadata

Audit logs may include:

*   actorUserId
*   organizationId
*   action
*   entityType
*   entityId
*   ipAddress
*   userAgent
*   metadata
*   createdAt

Audit metadata must not include:

*   raw Clerk tokens
*   secrets
*   private API keys
*   sensitive authentication data

---

# 6\. Data Model Summary

## 6.1 Primary Entities

The expanded system contains the following primary entities:

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

Optional storage/media metadata entities:

*   StoredFile
*   MediaAsset

If using direct fields on resources/certificates, `StoredFile` and `MediaAsset` may be delayed.

---

## 6.2 Removed/Deprecated Auth Entities

Because Skillmark uses Clerk, the backend MVP should not implement these internal auth entities unless there is a special reason:

*   RefreshToken
*   EmailVerificationToken
*   PasswordResetToken

Clerk handles these flows.

---

## 6.3 User Entity

Important fields:

*   id
*   clerkUserId
*   name
*   email
*   avatarUrl
*   status
*   createdAt
*   updatedAt

---

## 6.4 Organization Entity

Important fields:

*   id
*   name
*   description
*   ownerId
*   logoUrl
*   status
*   createdAt
*   updatedAt
*   deletedAt

---

## 6.5 Program Entity

Important fields:

*   id
*   organizationId
*   title
*   description
*   coverImageUrl
*   status
*   isPublished
*   startDate
*   endDate
*   createdAt
*   updatedAt
*   deletedAt

---

## 6.6 ProgramEnrollment Entity

Important fields:

*   id
*   programId
*   userId
*   status
*   enrolledAt
*   completedAt
*   removedAt

---

## 6.7 ProgramResource Entity

Important fields:

*   id
*   programId
*   title
*   description
*   type
*   url
*   storageProvider
*   objectKey
*   status
*   position
*   createdBy
*   createdAt
*   updatedAt

---

## 6.8 Certificate Entity

Important fields:

*   id
*   certificateNumber
*   verificationCode
*   organizationId
*   programId
*   quizId
*   userId
*   attemptId
*   title
*   participantNameSnapshot
*   quizTitleSnapshot
*   programTitleSnapshot
*   organizationNameSnapshot
*   status
*   issuedAt
*   revokedAt
*   revokeReason
*   pdfUrl
*   pdfObjectKey
*   qrCodeUrl
*   qrCodeObjectKey
*   createdAt
*   updatedAt

---

# 7\. API Design Summary

## 7.1 API Base Path

All versioned endpoints shall use:

```
/api/v1
```

---

## 7.2 Authentication/User APIs

Since Clerk handles authentication, backend endpoints focus on profile sync and current user:

*   GET `/api/v1/users/me`
*   POST `/api/v1/users/sync`

Optional if needed:

*   PATCH `/api/v1/users/me`

---

## 7.3 Organization APIs

*   POST `/api/v1/organizations`
*   GET `/api/v1/organizations`
*   GET `/api/v1/organizations/{organizationId}`
*   PUT `/api/v1/organizations/{organizationId}`
*   DELETE `/api/v1/organizations/{organizationId}`

---

## 7.4 Organization Membership APIs

*   POST `/api/v1/organizations/{organizationId}/members`
*   GET `/api/v1/organizations/{organizationId}/members`
*   DELETE `/api/v1/organizations/{organizationId}/members/{userId}`

---

## 7.5 Program APIs

*   POST `/api/v1/organizations/{organizationId}/programs`
*   GET `/api/v1/organizations/{organizationId}/programs`
*   GET `/api/v1/programs/{programId}`
*   PUT `/api/v1/programs/{programId}`
*   POST `/api/v1/programs/{programId}/publish`
*   POST `/api/v1/programs/{programId}/archive`
*   DELETE `/api/v1/programs/{programId}`

---

## 7.6 Program Enrollment APIs

*   POST `/api/v1/programs/{programId}/enrollments`
*   GET `/api/v1/programs/{programId}/enrollments`
*   GET `/api/v1/enrollments/me`
*   DELETE `/api/v1/programs/{programId}/enrollments/{userId}`

---

## 7.7 Invitation APIs

*   POST `/api/v1/programs/{programId}/invitations`
*   GET `/api/v1/programs/{programId}/invitations`
*   POST `/api/v1/invitations/{code}/join`
*   POST `/api/v1/invitations/{invitationId}/disable`

---

## 7.8 Resource APIs

*   POST `/api/v1/programs/{programId}/resources`
*   GET `/api/v1/programs/{programId}/resources`
*   DELETE `/api/v1/resources/{resourceId}`

Optional upload endpoints:

*   POST `/api/v1/files/r2/upload-url`
*   POST `/api/v1/media/cloudinary/signature`

---

## 7.9 Quiz APIs

*   POST `/api/v1/programs/{programId}/quizzes`
*   GET `/api/v1/programs/{programId}/quizzes`
*   GET `/api/v1/quizzes/{quizId}`
*   PUT `/api/v1/quizzes/{quizId}`
*   DELETE `/api/v1/quizzes/{quizId}`
*   POST `/api/v1/quizzes/{quizId}/questions`
*   POST `/api/v1/quizzes/{quizId}/publish`

---

## 7.10 Quiz Attempt APIs

*   POST `/api/v1/quizzes/{quizId}/attempts`
*   POST `/api/v1/quiz-attempts/{attemptId}/submit`
*   GET `/api/v1/quiz-attempts/me`
*   GET `/api/v1/quiz-attempts/{attemptId}`
*   GET `/api/v1/quizzes/{quizId}/attempts`

---

## 7.11 Certificate APIs

*   POST `/api/v1/certificates`
*   GET `/api/v1/certificates/me`
*   GET `/api/v1/certificates/organization/{organizationId}`
*   GET `/api/v1/certificates/{certificateId}`
*   POST `/api/v1/certificates/{certificateId}/revoke`
*   GET `/api/v1/public/certificates/verify/{verificationCode}`

---

## 7.12 Statistics APIs

*   GET `/api/v1/organizations/{organizationId}/stats`
*   GET `/api/v1/programs/{programId}/stats`
*   GET `/api/v1/quizzes/{quizId}/stats`

---

# 8\. Infrastructure and Integration Requirements

## 8.1 Clerk Integration Requirements

The backend shall:

*   verify Clerk JWT/session tokens
*   extract Clerk user ID
*   map Clerk user ID to local user record
*   create local user if missing
*   protect private endpoints
*   allow public certificate verification without authentication

Environment variables:

```
CLERK_SECRET_KEY
CLERK_ISSUER
CLERK_JWKS_URL
```

Actual names may follow Clerk SDK requirements.

---

## 8.2 Neon DB Requirements

The backend shall connect to Neon PostgreSQL using environment variables.

Recommended variables:

```
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
```

The system shall use:

*   Flyway migrations
*   indexes
*   constraints
*   status-based soft deletion where needed

---

## 8.3 Cloudflare R2 Requirements

R2 shall be used for file/object storage.

Use cases:

*   certificate PDFs
*   downloadable program resource files
*   QR code images if stored as files

Recommended environment variables:

```
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_BASE_URL
```

The backend should avoid storing raw credentials in code.

---

## 8.4 Cloudinary Requirements

Cloudinary shall be used for images/media.

Use cases:

*   organization logos
*   program cover images
*   certificate design assets
*   optimized image delivery

Recommended environment variables:

```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## 8.5 File Storage Abstraction

The backend should use services such as:

```
StorageService
R2StorageService
CloudinaryMediaService
```

Controllers should not directly call vendor SDKs.

---

# 9\. Non-Functional Requirements

## 9.1 Security

The system must:

*   verify Clerk tokens
*   protect private APIs
*   enforce organization-scoped authorization
*   enforce program enrollment access
*   prevent cross-tenant access
*   avoid exposing sensitive provider secrets
*   avoid exposing raw tokens

---

## 9.2 Performance

Common API responses should not exceed 2 seconds under normal load.

List endpoints should use pagination.

Frequently queried fields should be indexed.

---

## 9.3 Availability

The backend should support deployment to a cloud environment.

It should expose health check endpoints.

---

## 9.4 Maintainability

The system should follow modular monolith architecture.

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

---

## 9.5 API Usability

The API shall provide:

*   consistent response wrappers
*   clear validation errors
*   pagination
*   predictable naming
*   Swagger/OpenAPI documentation

---

# 10\. System Architecture

## 10.1 High-Level Architecture

Skillmark consists of:

*   Backend API
*   Clerk Authentication Layer
*   Neon PostgreSQL Database
*   Cloudflare R2 Object Storage
*   Cloudinary Media Layer
*   Authorization Layer
*   API Documentation Layer

---

## 10.2 Backend API Layer

Responsibilities:

*   expose REST APIs
*   validate request DTOs
*   return standardized responses
*   verify request authentication
*   call service layer

---

## 10.3 Service Layer

Responsibilities:

*   enforce business rules
*   enforce organization authorization
*   enforce program enrollment access
*   manage transactions
*   coordinate repositories
*   call storage/media services when needed

---

## 10.4 Repository Layer

Responsibilities:

*   database access
*   query methods
*   pagination
*   persistence operations

---

## 10.5 Security Layer

Responsibilities:

*   Clerk token verification
*   current user resolution
*   authorization checks
*   public/private endpoint separation

---

## 10.6 Storage Layer

Responsibilities:

*   upload file metadata
*   generate upload URLs if needed
*   integrate with Cloudflare R2
*   integrate with Cloudinary
*   hide provider-specific details from business services

---

# 11\. MVP Recommendation

## 11.1 Expanded MVP Features

The expanded MVP should include:

1.  Clerk authentication integration
2.  Backend user profile sync
3.  Organizations
4.  Organization memberships
5.  Programs/workshops
6.  Program enrollments
7.  Invitation links
8.  Program resources
9.  Quizzes
10.  Questions/options
11.  Quiz attempts and scoring
12.  Certificates
13.  Certificate verification
14.  Statistics APIs
15.  Audit logs
16.  R2/Cloudinary storage abstraction

---

## 11.2 Features to Delay

Delay these unless explicitly needed:

*   full LMS courses
*   lessons
*   assignments
*   attendance
*   badges
*   leaderboard
*   payments
*   multi-owner organizations
*   advanced question bank
*   advanced analytics dashboard
*   chat
*   notifications
*   microservices
*   mobile app

---

# 12\. Testing Requirements

## 12.1 Unit Tests

Unit tests should cover:

*   Clerk user sync logic
*   organization authorization
*   membership rules
*   program enrollment rules
*   invitation validation
*   quiz publishing validation
*   quiz scoring
*   certificate issuing rules
*   statistics calculation

---

## 12.2 Integration Tests

Integration tests should cover:

*   current user sync
*   organization creation
*   owner membership creation
*   program creation
*   invitation join flow
*   resource access control
*   quiz creation
*   quiz publishing
*   attempt submission
*   certificate issuing
*   public certificate verification
*   cross-organization access rejection

---

## 12.3 Security Tests

Security tests should verify:

*   protected endpoints reject unauthenticated requests
*   invalid Clerk tokens are rejected
*   unrelated users cannot access organization data
*   unenrolled users cannot view program resources
*   participants cannot manage owner-only resources
*   owners cannot manage other owners' organizations
*   sensitive data is not exposed

---

# 13\. Final Product Statement

Skillmark is a university-focused training, assessment, and certification backend platform that helps organizations manage workshops, enroll participants, publish resources, run quizzes, track results, and issue verifiable certificates with secure organization-scoped permissions.

Skillmark uses Clerk for authentication, Neon DB for PostgreSQL storage, Cloudflare R2 for object storage, and Cloudinary for image/media management.

The system is designed around a clean multi-tenant model where users do not have global business roles. Instead, permissions are based on organization memberships and program enrollments.