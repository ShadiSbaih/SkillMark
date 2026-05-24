# Skillmark Quiz & Certification Backend

## Updated Product Requirements Document (PRD)

---

# 1. Introduction

## 1.1 Purpose

This document defines the updated product, functional, technical, user-role, permission, and architectural requirements for **Skillmark**.

Skillmark is an **API-first quiz and certification backend platform** that helps organizations create quizzes, evaluate participants, and issue verifiable certificates.

The system is especially suitable for university environments such as:

* university departments
* student clubs
* technical communities
* training workshops
* internship programs
* bootcamps
* internal university training
* independent instructors and trainers

The current phase focuses on the **backend API only**.

Frontend implementation is out of scope for the current backend MVP, but the backend should be designed in a way that supports a future web dashboard and student-facing interface.

---

## 1.2 Product Scope

Skillmark provides APIs for:

* user registration and authentication
* email verification
* password reset
* refresh token session management
* organization creation and management
* organization membership management
* quiz creation and publishing
* quiz questions and answer options
* quiz attempts and automatic scoring
* certificate issuing
* certificate revocation
* public certificate verification
* audit logging

Skillmark is **not a full LMS** in the current phase.

The following LMS features are out of scope for the MVP:

* courses
* lessons
* assignments
* attendance
* payments
* dashboards
* learning paths
* discussion rooms
* chat system
* calendar scheduling
* video lectures

---

## 1.3 Product Positioning

Skillmark is an API-first quiz and certification backend.

### One-line pitch

> Skillmark helps organizations create assessments, evaluate participants, and issue verifiable certificates through a secure backend API.

### University-focused pitch

> Skillmark helps universities, student clubs, trainers, and technical communities run online quizzes, evaluate students, and issue verifiable certificates for workshops, trainings, and academic activities.

---

## 1.4 Target Users

The platform targets:

* university students
* instructors
* trainers
* student club leaders
* university departments
* internship supervisors
* technical community organizers
* training centers
* companies running internal training

---

## 1.5 Main Use Case for University Students

A student club, instructor, or university training group creates an organization inside Skillmark.

The owner adds students as participants, creates a quiz, publishes it, and allows participants to submit attempts.

After passing the quiz, students can receive certificates automatically or manually depending on the quiz settings.

Anyone can verify a certificate publicly using a verification code.

Example:

* Organization: Computer Science Club
* Owner: Club leader or instructor
* Participants: Students
* Quiz: Git & GitHub Workshop Quiz
* Certificate: Git & GitHub Workshop Completion Certificate
* Verification: Public verification code or QR code in the future

---

# 2. System Overview

## 2.1 System Type

Skillmark is an:

* API-only SaaS backend
* multi-tenant backend system
* quiz and certification platform
* organization-scoped assessment system

---

## 2.2 Architecture Style

The system shall follow:

* modular monolith architecture
* RESTful API architecture
* multi-tenant architecture
* organization-scoped authorization
* layered backend architecture
* database-backed persistence
* JWT-based authentication

---

## 2.3 Core Product Concept

A **User** is an identity/account.

A user must not be treated as globally `OWNER` or globally `PARTICIPANT`.

Permissions are defined at the organization level through:

```text
organization_memberships
```

not through:

```text
users.role
```

A single user can:

* own one or more organizations
* be a participant in one or more organizations
* be OWNER in one organization
* be PARTICIPANT in another organization
* have different permissions depending on the organization context

Example:

A user named Ahmad can be:

* OWNER of “Computer Science Club”
* PARTICIPANT in “AI Training Program”
* PARTICIPANT in “Java Bootcamp”

Therefore, all business permissions must be based on organization memberships.

---

# 3. User Types and Permissions

## 3.1 User Type Summary

The system supports four main user states/types:

1. Unauthenticated Visitor
2. Authenticated User
3. Organization Owner
4. Organization Participant

Important note:

`Organization Owner` and `Organization Participant` are not global roles.

They are organization-level roles stored in `organization_memberships`.

---

# 3.2 Unauthenticated Visitor

## Description

An unauthenticated visitor is a user who is not logged in.

This user can only access public and authentication-related APIs.

## Allowed Actions

An unauthenticated visitor can:

* register a new account
* login
* request password reset
* reset password using a valid token
* verify email using a valid token
* verify a public certificate using a verification code

## Not Allowed Actions

An unauthenticated visitor cannot:

* create organizations
* view private organizations
* join quizzes
* start quiz attempts
* submit quiz answers
* view private certificates
* manage members
* create quizzes
* issue certificates

## Visitor Permission Table

| Feature                   | Allowed |
| ------------------------- | ------: |
| Register                  |     Yes |
| Login                     |     Yes |
| Forgot password           |     Yes |
| Reset password            |     Yes |
| Verify email              |     Yes |
| Verify public certificate |     Yes |
| Create organization       |      No |
| View quizzes              |      No |
| Start quiz attempt        |      No |
| Submit quiz attempt       |      No |
| View own certificates     |      No |

---

# 3.3 Authenticated User

## Description

An authenticated user is any user who has successfully logged into the system.

This user does not have a global business role.

The user can perform general account actions and create organizations.

After creating an organization, the user automatically becomes the OWNER of that organization.

## Allowed Actions

An authenticated user can:

* view their own profile
* update basic account information if supported
* create a new organization
* become owner of the organization they create
* view organizations they own or belong to
* logout
* refresh access token using refresh token
* view their own attempts if they have quiz attempts
* view their own certificates if certificates were issued to them

## Not Allowed Actions Without Organization Permission

An authenticated user cannot:

* manage an organization they do not own
* view private data of unrelated organizations
* access quizzes in organizations where they are not a member
* manage quizzes without OWNER role in that organization
* view attempts of other users without being organization owner
* issue certificates without being organization owner

## Authenticated User Permission Table

| Feature                              | Allowed |
| ------------------------------------ | ------: |
| View own profile                     |     Yes |
| Create organization                  |     Yes |
| View accessible organizations        |     Yes |
| Logout                               |     Yes |
| Refresh token                        |     Yes |
| Manage unrelated organization        |      No |
| View unrelated organization quizzes  |      No |
| Issue certificates without ownership |      No |

---

# 3.4 Organization Owner

## Description

An Organization Owner is a user who has OWNER permission inside a specific organization.

Ownership is represented by:

* `organizations.owner_id`
* `organization_memberships.role = OWNER`

The owner can manage only the organizations they own.

An owner in one organization is not automatically an owner in another organization.

---

## Organization Owner Responsibilities

An organization owner can:

* manage organization details
* manage organization members
* create quizzes
* manage quizzes
* add questions and options
* publish quizzes
* view quiz attempts
* issue certificates
* revoke certificates
* view certificates issued under their organization

---

## 3.4.1 Organization Management Permissions

An organization owner can:

* view organization details
* update organization information
* disable or soft delete the organization
* list organization members
* add participants
* remove or disable participants

An organization owner cannot:

* manage organizations owned by other users
* access private data from unrelated organizations
* transfer ownership in the current MVP
* create multiple owners in the current MVP

---

## 3.4.2 Quiz Management Permissions

An organization owner can:

* create quizzes inside owned organizations
* update quiz settings
* add quiz questions
* add quiz options
* publish quizzes
* archive quizzes
* delete quizzes using safe deletion policy
* view all quizzes in their organization, whether published or unpublished

Published quiz modification should follow a safe policy to avoid corrupting historical attempts.

Recommended policy:

* allow editing basic fields such as title and description
* prevent editing submitted questions/options directly after attempts exist
* use archive/versioning later if advanced quiz editing is needed

---

## 3.4.3 Attempt and Result Permissions

An organization owner can:

* view attempts for quizzes inside owned organizations
* view participant results
* review attempts if certificate issue mode is MANUAL
* use attempt data to decide whether to issue certificates manually

An organization owner cannot:

* submit attempts on behalf of participants in the MVP
* edit participant submitted answers
* change score results manually unless a future review feature is added

---

## 3.4.4 Certificate Permissions

An organization owner can:

* issue certificates manually when quiz certificate mode is MANUAL
* view certificates issued under their organization
* revoke certificates issued under their organization
* verify certificates publicly like any other user

An organization owner cannot:

* issue certificates for users who are not active participants
* issue duplicate active certificates for the same quiz and user
* issue certificates for failed attempts
* issue certificates for quizzes outside their organization

---

# 3.5 Organization Participant

## Description

An Organization Participant is a user who has PARTICIPANT membership inside a specific organization.

A participant can access published quizzes and submit attempts inside organizations where they are active members.

A participant in one organization does not automatically have access to another organization.

---

## Participant Responsibilities

A participant can:

* view organizations where they are a member
* view published quizzes inside those organizations
* start quiz attempts
* submit quiz answers
* view their own attempt results
* view their own certificates
* verify certificates publicly

---

## 3.5.1 Organization Access Permissions

A participant can:

* view basic details of organizations where they are active members
* view their membership-related access

A participant cannot:

* update organization details
* delete organizations
* add members
* remove members
* view full member lists unless allowed later

---

## 3.5.2 Quiz Permissions

A participant can:

* view published quizzes in organizations where they are active members
* start a quiz attempt if the quiz is available
* submit answers for their own attempt
* view their own quiz results

A participant cannot:

* view unpublished quizzes
* create quizzes
* update quizzes
* delete quizzes
* add questions or options
* publish quizzes
* submit another user's attempt
* exceed max attempt limits

---

## 3.5.3 Certificate Permissions

A participant can:

* receive a certificate automatically if they pass a quiz with certificate mode AUTO
* receive a certificate manually if the owner issues it under MANUAL mode
* view their own certificates
* use public verification for certificates

A participant cannot:

* issue certificates
* revoke certificates
* view certificates of unrelated users unless through public verification

---

# 3.6 Permission Matrix

| Feature                         | Visitor |    Authenticated User |              Organization Owner | Organization Participant |
| ------------------------------- | ------: | --------------------: | ------------------------------: | -----------------------: |
| Register                        |     Yes |                   Yes |                             Yes |                      Yes |
| Login                           |     Yes |                   Yes |                             Yes |                      Yes |
| Verify email                    |     Yes |                   Yes |                             Yes |                      Yes |
| Forgot/reset password           |     Yes |                   Yes |                             Yes |                      Yes |
| View own profile                |      No |                   Yes |                             Yes |                      Yes |
| Create organization             |      No |                   Yes |                             Yes |                      Yes |
| View accessible organizations   |      No |                   Yes |                             Yes |                      Yes |
| View unrelated organizations    |      No |                    No |                              No |                       No |
| Update organization             |      No |                    No |                 Yes, owned only |                       No |
| Delete/disable organization     |      No |                    No |                 Yes, owned only |                       No |
| Add organization members        |      No |                    No |                 Yes, owned only |                       No |
| Remove organization members     |      No |                    No |                 Yes, owned only |                       No |
| Create quiz                     |      No |                    No |                 Yes, owned only |                       No |
| Update quiz                     |      No |                    No |                 Yes, owned only |                       No |
| Add questions/options           |      No |                    No |                 Yes, owned only |                       No |
| Publish quiz                    |      No |                    No |                 Yes, owned only |                       No |
| Archive/delete quiz             |      No |                    No |                 Yes, owned only |                       No |
| View published quizzes          |      No |             If member |                             Yes |           Yes, if member |
| View unpublished quizzes        |      No |                    No |                 Yes, owned only |                       No |
| Start quiz attempt              |      No | If active participant |             If also participant |                      Yes |
| Submit quiz attempt             |      No |      Own attempt only | Own attempt only if participant |         Own attempt only |
| View own attempts               |      No |                   Yes |                             Yes |                      Yes |
| View all quiz attempts          |      No |                    No |                 Yes, owned only |                       No |
| Issue certificate               |      No |                    No |                 Yes, owned only |                       No |
| Revoke certificate              |      No |                    No |                 Yes, owned only |                       No |
| View own certificates           |      No |                   Yes |                             Yes |                      Yes |
| View organization certificates  |      No |                    No |                 Yes, owned only |                       No |
| Public certificate verification |     Yes |                   Yes |                             Yes |                      Yes |

---

# 4. Functional Requirements

---

# 4.1 Authentication and User Account Management

## Description

The system shall provide secure authentication and account management.

---

## FR-1: User Registration

The system shall allow users to register accounts using:

* name
* email
* password

Registration must not accept a business role such as OWNER or PARTICIPANT.

The user should be created as a normal account identity.

---

## FR-2: User Login

The system shall allow users to log in using:

* email
* password

After successful login, the system shall return:

* access token
* refresh token
* basic user profile

---

## FR-3: Access Token

The system shall issue an access token for authenticated API access.

The access token shall be used with:

```text
Authorization: Bearer <token>
```

---

## FR-4: Refresh Token

The system shall support refresh tokens for renewing access tokens.

Refresh tokens must be stored securely in the database as hashes.

The system shall support:

* refresh token expiration
* refresh token revocation
* refresh token rotation where possible

---

## FR-5: Logout

The system shall allow users to log out by revoking their active refresh token.

The system may also support logout from all sessions.

---

## FR-6: Email Verification

The system shall support email verification.

Email verification tokens must be stored as hashes.

The user record shall include an email verification state.

---

## FR-7: Forgot Password

The system shall support a password reset request flow.

The response must not reveal whether the email exists.

Password reset tokens must be stored as hashes.

---

## FR-8: Reset Password

The system shall allow password reset using a valid, unused, non-expired reset token.

After successful password reset, existing refresh tokens may be revoked.

---

## FR-9: Current User Profile

The system shall allow authenticated users to retrieve their own account profile.

The response must not include:

* password hash
* refresh token hash
* reset token hash
* verification token hash
* internal secrets

---

# 4.2 Organization Management

## Description

The system shall allow authenticated users to create and manage organizations.

---

## FR-10: Create Organization

The system shall allow any authenticated user to create an organization.

When a user creates an organization:

* an organization record is created
* `owner_id` is set to the current user
* an organization membership row is created with role OWNER

---

## FR-11: View Accessible Organizations

The system shall allow users to view organizations they own or belong to.

A user must not see unrelated organizations.

---

## FR-12: View Organization Details

The system shall allow an organization owner or active organization member to view organization details.

Unauthorized users must be rejected.

---

## FR-13: Update Organization

The system shall allow only the organization owner to update organization details.

---

## FR-14: Disable or Delete Organization

The system shall allow only the organization owner to disable or delete an organization.

Preferred behavior:

* soft delete
* status-based disabling
* preserve historical attempts and certificates

---

# 4.3 Organization Membership Management

## Description

The system shall manage organization-level roles through organization memberships.

---

## FR-15: Add Organization Member

The system shall allow an organization owner to add a user as a PARTICIPANT member of an organization.

The target user must already exist.

Duplicate active memberships must be prevented.

---

## FR-16: List Organization Members

The system shall allow an organization owner to list members of an owned organization.

---

## FR-17: Remove Organization Member

The system shall allow an organization owner to remove or disable a member from an organization.

Removed members must lose access to protected organization data.

Historical attempts and certificates should remain preserved.

---

## FR-18: Membership Roles

The system shall support the following membership roles in the current phase:

* OWNER
* PARTICIPANT

Future roles may include:

* INSTRUCTOR
* MANAGER
* REVIEWER

These future roles are out of scope for the current MVP.

---

# 4.4 Quiz Management

## Description

The system shall support quiz creation and management inside organizations.

A quiz belongs directly to an organization.

Courses are not part of the current MVP.

---

## FR-19: Create Quiz

The system shall allow organization owners to create quizzes under organizations they own.

---

## FR-20: Quiz Fields

A quiz shall include:

* title
* description
* organizationId
* passingScore
* durationMinutes
* maxAttempts
* certificateEnabled
* certificateIssueMode
* isPublished
* status
* createdAt
* updatedAt
* deletedAt

---

## FR-21: Certificate Issue Mode

A quiz may support certificate issuing.

Supported certificate issue modes:

* AUTO
* MANUAL
* NONE

### AUTO

The system issues a certificate automatically when the participant passes the quiz.

### MANUAL

The owner reviews the submitted attempt and issues the certificate manually.

### NONE

The quiz does not issue certificates.

---

## FR-22: Add Quiz Questions

The system shall allow organization owners to add questions to quizzes.

The current phase supports:

* SINGLE_CHOICE questions

---

## FR-23: Add Quiz Options

The system shall allow organization owners to add answer options to quiz questions.

A SINGLE_CHOICE question must have exactly one correct answer.

---

## FR-24: Publish Quiz

The system shall allow organization owners to publish a quiz.

A quiz should not be publishable unless:

* it has at least one question
* every question has valid options
* every SINGLE_CHOICE question has exactly one correct option
* quiz settings are valid

---

## FR-25: View Organization Quizzes

The system shall allow:

* organization owners to view all quizzes in owned organizations
* active organization participants to view published quizzes in organizations where they are members

---

## FR-26: Update Quiz

The system shall allow only the organization owner to update quiz settings.

Published quiz modification should follow a safe policy to avoid corrupting historical attempts.

---

## FR-27: Archive or Delete Quiz

The system shall allow only the organization owner to archive or delete a quiz.

Historical attempts and certificates should remain consistent.

Soft delete or archive is preferred over hard delete.

---

# 4.5 Quiz Attempt Management

## Description

The system shall allow participants to take published quizzes.

---

## FR-28: Start Quiz Attempt

The system shall allow active organization participants to start attempts for published quizzes.

The system must enforce:

* organization membership
* participant status
* quiz publication status
* max attempts limit
* quiz status

---

## FR-29: Submit Quiz Attempt

The system shall allow users to submit answers for their own quiz attempts.

The system shall calculate:

* points awarded
* total score
* score percentage
* pass/fail result
* submittedAt timestamp

---

## FR-30: Prevent Invalid Submissions

The system shall reject:

* submissions for another user's attempt
* submissions for already submitted attempts
* answers using options from another quiz
* answers using questions from another quiz
* attempts for archived or unavailable quizzes
* attempts exceeding maxAttempts

---

## FR-31: View Own Attempts

The system shall allow users to view their own quiz attempts.

---

## FR-32: Owner View Attempts

The system shall allow organization owners to view attempts for quizzes in their owned organizations.

---

# 4.6 Certificate Management

## Description

The system shall support certificate issuance, revocation, and public verification.

Certificates are issued to users after passing quizzes.

---

## FR-33: Issue Certificate

The system shall allow certificates to be issued to users for quiz completion.

Certificates may be issued:

* automatically after a passing attempt if certificateIssueMode = AUTO
* manually by organization owner if certificateIssueMode = MANUAL

---

## FR-34: Certificate Eligibility

A certificate can only be issued if:

* target user exists
* target user is an ACTIVE PARTICIPANT member of the quiz organization
* target user has a submitted passing attempt
* duplicate active certificate does not already exist for the same quiz and user

---

## FR-35: Certificate Number

The system shall generate a unique certificate number for every certificate.

---

## FR-36: Verification Code

The system shall generate a unique verification code for every certificate.

---

## FR-37: Certificate Snapshots

The system shall store snapshot values at issuance time:

* participantNameSnapshot
* quizTitleSnapshot
* organizationNameSnapshot

This preserves certificate history even if user, quiz, or organization names change later.

---

## FR-38: View Own Certificates

The system shall allow users to view their own certificates.

---

## FR-39: View Organization Certificates

The system shall allow organization owners to view certificates issued under their own organizations.

---

## FR-40: Public Certificate Verification

The system shall provide a public endpoint to verify a certificate by verification code.

The public verification response must not expose sensitive user data.

Recommended public response fields:

* certificate status
* participant name snapshot
* quiz title snapshot
* organization name snapshot
* issued date
* revoked state if revoked

---

## FR-41: Revoke Certificate

The system shall allow organization owners to revoke certificates issued under their own organizations.

A revoked certificate must remain historically visible and verifiable as revoked.

---

# 4.7 Optional Resource Management

## Description

Resources are optional in the current phase.

If implemented, resources should be lightweight preparation materials attached to a quiz.

Supported resource types:

* LINK
* FILE

---

## FR-42: Create Quiz Resource

The system may allow organization owners to attach LINK or FILE resources to quizzes.

---

## FR-43: View Quiz Resources

The system may allow active organization participants to view resources attached to published quizzes.

---

## FR-44: File Storage Abstraction

If FILE resources are implemented, the system shall provide a backend file storage abstraction.

Initial implementation may use local storage.

Future implementations may include:

* S3
* Cloudinary
* Supabase Storage

---

# 4.8 Audit Logging

## Description

The system shall record important security and business actions.

---

## FR-45: Audit Sensitive Actions

The system shall record audit logs for sensitive actions, including:

* organization creation
* organization update
* organization deletion or disabling
* member added
* member removed
* quiz created
* quiz updated
* quiz published
* quiz archived
* attempt submitted
* certificate issued
* certificate revoked
* login failures
* password reset completion

---

## FR-46: Audit Metadata

Audit logs may include:

* actorUserId
* organizationId
* action
* entityType
* entityId
* ipAddress
* userAgent
* metadata
* createdAt

Audit metadata must not include:

* plaintext passwords
* raw tokens
* secrets
* sensitive authentication data

---

# 5. University MVP Recommendation

## 5.1 Recommended MVP Features

For the first university version, the system should focus on the following flow:

1. User registration and login
2. Organization creation
3. Owner automatically becomes organization owner
4. Owner adds participants
5. Owner creates quiz
6. Owner adds single-choice questions and options
7. Owner publishes quiz
8. Participant views published quiz
9. Participant starts attempt
10. Participant submits answers
11. System calculates score
12. System marks pass/fail
13. System issues certificate automatically if enabled
14. Public user verifies certificate using verification code

---

## 5.2 Recommended Features to Delay

The following features should be delayed until after the MVP:

* invitation links
* bulk member import
* advanced question types
* question bank
* certificate PDF generation
* QR code generation
* analytics dashboard
* leaderboard
* badges
* payments
* multi-owner organizations
* instructor roles
* advanced reporting
* frontend dashboard

---

## 5.3 University Example Flow

Example scenario:

A student club runs a workshop called “Introduction to Git & GitHub”.

The club leader creates an organization named “Computer Science Club”.

The leader adds students as participants.

The leader creates a quiz with 10 single-choice questions.

The quiz passing score is 70%.

The certificate issue mode is AUTO.

Students complete the quiz.

Students who pass receive a verifiable certificate.

Anyone can verify the certificate using the public verification endpoint.

---

# 6. Non-Functional Requirements

## 6.1 Performance Requirements

### NFR-1

The system shall support concurrent API users efficiently.

### NFR-2

API response time should not exceed 2 seconds under normal load for common endpoints.

### NFR-3

List endpoints shall use database-level pagination where possible.

### NFR-4

The system shall use indexes for commonly queried fields.

---

## 6.2 Security Requirements

### NFR-5

Passwords shall be stored using strong hashing.

### NFR-6

Access tokens and refresh tokens shall be protected.

### NFR-7

Refresh tokens shall be stored as hashes.

### NFR-8

Password reset and email verification tokens shall be stored as hashes.

### NFR-9

The system shall enforce authorization checks for all protected resources.

### NFR-10

The system shall prevent unauthorized access between organizations.

### NFR-11

The system shall not rely on global user roles for organization-level permissions.

### NFR-12

The system shall protect authentication endpoints using rate limiting.

Rate-limited endpoints should include:

* login
* register
* forgot password
* resend verification email

### NFR-13

The system shall not expose sensitive data in API responses.

Sensitive data includes:

* password hash
* refresh token hash
* reset token hash
* verification token hash
* internal secrets

---

## 6.3 Availability Requirements

### NFR-14

The system should be deployable to a cloud environment.

### NFR-15

The system should support backup and recovery mechanisms.

### NFR-16

The system should expose health check endpoints for deployment monitoring.

---

## 6.4 Scalability Requirements

### NFR-17

The architecture shall support future feature expansion.

### NFR-18

The system shall support increasing numbers of:

* users
* organizations
* memberships
* quizzes
* questions
* attempts
* certificates

### NFR-19

The backend should remain a modular monolith unless there is a strong need for microservices later.

---

## 6.5 Maintainability Requirements

### NFR-20

The system shall follow modular backend architecture.

Recommended modules:

* auth
* user
* organization
* membership
* quiz
* attempt
* certificate
* audit
* common
* security
* config

### NFR-21

Business rules shall be implemented in services, not controllers.

### NFR-22

Repeated authorization logic shall be centralized in an AuthorizationService.

### NFR-23

API responses shall use consistent response wrappers.

---

## 6.6 API Usability Requirements

Because the current phase is API-only, usability requirements apply to API consumers.

### NFR-24

The API shall be predictable and consistent.

### NFR-25

The API shall provide clear validation errors.

### NFR-26

The API shall provide Swagger/OpenAPI documentation.

### NFR-27

The API shall use consistent naming conventions and versioning.

---

# 7. System Architecture

## 7.1 High-Level Architecture

The current phase consists of:

* Backend API
* Database Layer
* Authentication and Authorization Layer
* Optional File Storage Layer
* API Documentation Layer

Frontend is out of scope.

---

## 7.2 Backend API Layer

Responsibilities:

* expose REST APIs
* validate request DTOs
* return standardized responses
* enforce request-level authentication
* call service layer

Suggested technologies:

* Java 17
* Spring Boot
* Spring Web
* Jakarta Validation

---

## 7.3 Service Layer

Responsibilities:

* enforce business rules
* enforce organization-scoped authorization
* manage transactions
* coordinate repositories
* prevent cross-tenant access
* keep controllers thin

---

## 7.4 Repository Layer

Responsibilities:

* database access
* query methods
* database-level pagination
* persistence operations

Suggested technologies:

* Spring Data JPA
* Hibernate

---

## 7.5 Database Layer

Responsibilities:

* data persistence
* relational integrity
* indexing
* constraints
* migration history

Suggested technologies:

* PostgreSQL
* Flyway

---

## 7.6 Authentication Layer

Responsibilities:

* user authentication
* JWT generation and validation
* refresh token management
* password reset tokens
* email verification tokens

Suggested technologies:

* Spring Security
* JWT
* BCrypt

---

## 7.7 Authorization Layer

Responsibilities:

* organization ownership checks
* organization membership checks
* quiz access checks
* attempt ownership checks
* certificate access checks

The system should include an AuthorizationService.

Example checks:

```text
ensureOrganizationOwner(organizationId)
ensureOrganizationMember(organizationId)
ensureActiveParticipantMember(organizationId, userId)
ensureQuizOwner(quizId)
ensureQuizAccessible(quizId)
ensureAttemptOwner(attemptId)
ensureCertificateAccessible(certificateId)
```

---

# 8. Database Design

## 8.1 Primary Entities

The system contains the following primary entities:

* User
* Organization
* OrganizationMembership
* Quiz
* QuizQuestion
* QuizOption
* QuizAttempt
* QuizAttemptAnswer
* Certificate
* RefreshToken
* EmailVerificationToken
* PasswordResetToken
* AuditLog

Optional:

* QuizResource

The system should not use these old entities as primary design elements:

* Student
* OrganizationStudent
* CourseStudent

---

## 8.2 Entity Summary

### User

Represents an account identity.

Important fields:

* id
* name
* email
* passwordHash
* emailVerified
* status
* createdAt
* updatedAt

---

### Organization

Represents an organization that owns quizzes and certificates.

Important fields:

* id
* name
* ownerId
* status
* createdAt
* updatedAt
* deletedAt

---

### OrganizationMembership

Represents a user's role inside an organization.

Important fields:

* organizationId
* userId
* role
* status
* createdAt
* updatedAt

Supported roles:

* OWNER
* PARTICIPANT

Supported statuses:

* ACTIVE
* INACTIVE
* REMOVED

---

### Quiz

Represents an assessment inside an organization.

Important fields:

* id
* organizationId
* title
* description
* passingScore
* durationMinutes
* maxAttempts
* certificateEnabled
* certificateIssueMode
* isPublished
* status
* createdAt
* updatedAt
* deletedAt

---

### QuizQuestion

Represents a question inside a quiz.

Important fields:

* id
* quizId
* text
* type
* points
* position
* createdAt
* updatedAt

Supported current type:

* SINGLE_CHOICE

---

### QuizOption

Represents an answer option.

Important fields:

* id
* questionId
* text
* isCorrect
* position
* createdAt
* updatedAt

---

### QuizAttempt

Represents a user's attempt at a quiz.

Important fields:

* id
* quizId
* userId
* score
* passed
* status
* startedAt
* submittedAt

---

### QuizAttemptAnswer

Represents an answer submitted by a user in a quiz attempt.

Important fields:

* id
* attemptId
* questionId
* selectedOptionId
* isCorrect
* pointsAwarded
* createdAt

---

### Certificate

Represents a quiz certificate issued to a user.

Important fields:

* id
* certificateNumber
* verificationCode
* organizationId
* quizId
* userId
* attemptId
* title
* participantNameSnapshot
* quizTitleSnapshot
* organizationNameSnapshot
* status
* issuedAt
* revokedAt
* revokeReason
* pdfUrl
* createdAt
* updatedAt

---

# 9. API Design

## 9.1 API Base Path

All versioned API endpoints shall use:

```text
/api/v1
```

---

## 9.2 Authentication APIs

* POST `/api/v1/auth/register`
* POST `/api/v1/auth/login`
* POST `/api/v1/auth/refresh`
* POST `/api/v1/auth/logout`
* POST `/api/v1/auth/logout-all`
* POST `/api/v1/auth/forgot-password`
* POST `/api/v1/auth/reset-password`
* POST `/api/v1/auth/verify-email`
* POST `/api/v1/auth/resend-verification`

---

## 9.3 User APIs

* GET `/api/v1/users/me`

---

## 9.4 Organization APIs

* POST `/api/v1/organizations`
* GET `/api/v1/organizations`
* GET `/api/v1/organizations/{organizationId}`
* PUT `/api/v1/organizations/{organizationId}`
* DELETE `/api/v1/organizations/{organizationId}`

---

## 9.5 Organization Membership APIs

* POST `/api/v1/organizations/{organizationId}/members`
* GET `/api/v1/organizations/{organizationId}/members`
* DELETE `/api/v1/organizations/{organizationId}/members/{userId}`

---

## 9.6 Quiz APIs

* POST `/api/v1/quizzes`
* GET `/api/v1/quizzes`
* GET `/api/v1/quizzes/organization/{organizationId}`
* GET `/api/v1/quizzes/{quizId}`
* PUT `/api/v1/quizzes/{quizId}`
* DELETE `/api/v1/quizzes/{quizId}`
* POST `/api/v1/quizzes/{quizId}/questions`
* POST `/api/v1/quizzes/{quizId}/publish`

---

## 9.7 Quiz Attempt APIs

* POST `/api/v1/quizzes/{quizId}/attempts`
* POST `/api/v1/quiz-attempts/{attemptId}/submit`
* GET `/api/v1/quiz-attempts/me`
* GET `/api/v1/quiz-attempts/{attemptId}`
* GET `/api/v1/quizzes/{quizId}/attempts`

---

## 9.8 Certificate APIs

* POST `/api/v1/certificates`
* GET `/api/v1/certificates/me`
* GET `/api/v1/certificates/organization/{organizationId}`
* GET `/api/v1/certificates/{certificateId}`
* POST `/api/v1/certificates/{certificateId}/revoke`
* GET `/api/v1/public/certificates/verify/{verificationCode}`

---

## 9.9 Optional Resource APIs

If quiz resources are implemented:

* POST `/api/v1/quizzes/{quizId}/resources`
* GET `/api/v1/quizzes/{quizId}/resources`
* DELETE `/api/v1/quiz-resources/{resourceId}`
* POST `/api/v1/files`

---

# 10. API Response Design

## 10.1 Success Response

All successful responses shall use a consistent wrapper.

Example:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## 10.2 Error Response

All error responses shall use a consistent wrapper.

Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

The system may extend errors with:

* errorCode
* timestamp
* path
* field validation details

---

## 10.3 Pagination

List endpoints shall support pagination.

Example:

```text
?page=0&size=10&sort=createdAt,desc
```

Paginated responses should include:

* items
* page
* size
* totalElements
* totalPages

---

# 11. Security Design

## 11.1 Authentication Security

The system shall use:

* JWT-based authentication
* secure password hashing
* token expiration
* refresh token management
* refresh token revocation
* password reset tokens
* email verification tokens

---

## 11.2 Authorization Security

The system shall use organization-scoped authorization.

The system shall not rely on global `users.role` for business permissions.

Authorization must check:

* organization ownership
* organization membership
* quiz ownership
* quiz accessibility
* attempt ownership
* certificate ownership or organization ownership

---

## 11.3 Data Protection

Sensitive fields must not be returned in API responses:

* passwordHash
* refreshTokenHash
* resetTokenHash
* emailVerificationTokenHash
* internal secrets

---

## 11.4 Multi-Tenant Isolation

The system shall prevent unauthorized access between organizations.

Users can access organization data only when they are:

* owner of the organization
* active member of the organization
* owner of a quiz organization
* participant in a quiz organization, where applicable

---

# 12. Deployment Requirements

## 12.1 Backend Deployment

The backend should support deployment using:

* Docker
* cloud VM
* managed container platform
* CI/CD pipeline

---

## 12.2 Database Deployment

The system should support PostgreSQL managed services.

Possible providers:

* Neon
* Supabase
* AWS RDS
* DigitalOcean Managed PostgreSQL

---

## 12.3 Configuration

The system shall use environment-based configuration.

Configuration should include:

* database URL
* JWT secret
* token expiration settings
* CORS settings
* rate limiting settings
* mail settings if email sending is enabled
* storage configuration if files are enabled

---

## 12.4 Health Checks

The backend shall expose health check endpoints suitable for deployment monitoring.

---

# 13. Testing Requirements

## 13.1 Unit Tests

Unit tests should cover:

* authentication logic
* authorization logic
* membership rules
* quiz validation
* quiz scoring
* certificate issuing rules
* token validation

---

## 13.2 Integration Tests

Integration tests should cover:

* registration without role
* login
* refresh token flow
* logout
* organization creation
* owner membership creation
* membership management
* quiz creation
* question and option creation
* quiz publishing
* quiz attempt submission
* certificate issuing
* public certificate verification
* cross-organization access rejection

---

## 13.3 Security Tests

Security tests should verify:

* protected endpoints reject unauthenticated requests
* unrelated users cannot access organization data
* participants cannot manage owner-only resources
* owners cannot manage other owners' organizations
* refresh token revocation works
* password reset tokens cannot be reused
* email verification tokens cannot be reused
* sensitive data is not exposed

---

# 14. Current Out-of-Scope Items

The following are out of scope for the current phase:

* frontend application
* web dashboard
* mobile app
* LMS course system
* lessons
* assignments
* attendance
* payments
* billing and subscriptions
* AI recommendations
* chat system
* notification system
* analytics dashboard
* leaderboard and badges
* advanced question bank engine
* video calls
* calendar scheduling
* advanced reporting
* microservices split
* multi-owner organization management
* ownership transfer
* marketplace/public quiz discovery
* advanced file processing
* video streaming
* social login
* OAuth login
* multi-factor authentication

---

# 15. Future Scalability

The architecture should support future extensions including:

* instructor role
* organization manager role
* multiple owners
* ownership transfer
* invitation-based membership
* bulk member import
* advanced question types
* question bank
* timed quizzes
* quiz randomization
* certificate PDF generation
* QR code verification
* external storage providers
* public certificate verification page
* analytics and reporting
* payment and subscription modules
* frontend dashboard
* student portal

---

# 16. Final Product Statement

Skillmark is an API-only quiz and certification backend that enables organizations, universities, student clubs, trainers, and technical communities to create assessments, manage participants, evaluate quiz attempts, and issue verifiable certificates with secure organization-scoped permissions.

The system is designed around a clean multi-tenant model where users do not have global business roles. Instead, permissions are based on each user's membership inside each organization.

This makes Skillmark flexible for university use cases where the same user may be an owner in one organization and a participant in another.
