
# Cohive Backend Platform

## Product Requirements Document (PRD)

---

# 1. Introduction

## 1.1 Purpose

This document defines the product, functional, technical, and architectural requirements for the Cohive Backend Platform.

Cohive is an API-only backend platform designed to help universities, training centers, companies, internship programs, and educational organizations manage:

- organizations
- organization memberships
- courses
- course enrollments
- learning resources
- quizzes
- quiz attempts
- certificates
- authentication and account flows

The current phase focuses only on the backend API.

Frontend implementation is explicitly out of scope for the current phase.

---

## 1.2 Product Scope

Cohive is a multi-organization training and course management backend.

The backend provides APIs for:

- user account registration and authentication
- organization creation and management
- organization membership management
- course creation and management
- course enrollment
- learning resource management
- quiz and quiz attempt management
- certificate issuance and verification
- password reset
- email verification
- refresh token session management

The platform is intended for:

- universities
- training centers
- software companies
- internship programs
- educational institutions
- internal company training programs

---

## 1.3 Current Phase Scope

The current phase includes:

- Backend API
- Database schema
- Authentication
- Authorization
- Business rules
- API documentation
- Integration tests
- Local/development file storage support
- Public certificate verification endpoint

The current phase does not include:

- frontend application
- mobile application
- dashboard UI
- public certificate verification web page
- payment system
- subscriptions
- notifications UI
- analytics dashboard
- microservices split

---

# 2. Product Overview

## 2.1 Product Type

API-only backend SaaS platform.

---

## 2.2 Architecture Style

The system shall follow:

- modular monolith architecture
- RESTful API architecture
- multi-tenant architecture
- organization-scoped authorization
- layered backend architecture
- database-backed persistence
- JWT-based authentication

---

## 2.3 Core Product Concept

A User is an identity/account.

A User must not be treated as globally `OWNER` or globally `STUDENT`.

Instead, permissions are defined at the organization level.

A single User can:

- own one or more organizations
- be a STUDENT/member in one or more organizations
- be OWNER in one organization and STUDENT in another organization at the same time

Therefore, business permissions must be based on:

```text
organization_memberships
````

not on:

```text
users.role
```

---

# 3. User Roles and Permission Model

## 3.1 User

A User is an authenticated account in the system.

A User can:

* register
* log in
* manage their own authentication session
* create organizations
* become owner of created organizations
* be added as a student/member to other organizations
* access data based on organization-level permissions

A User does not have a global business role.

---

## 3.2 Organization Owner

An Organization Owner is a User who has OWNER permission for a specific organization.

Ownership is represented by:

* `organizations.owner_id`
* `organization_memberships.role = OWNER`

An Organization Owner can manage only the organizations they own.

Responsibilities:

* create organizations
* manage organization information
* manage organization members
* create and manage courses
* enroll organization students in courses
* create and manage learning resources
* create and manage quizzes
* view quiz attempts for organization courses
* issue certificates
* revoke certificates

---

## 3.3 Organization Student

An Organization Student is a User who has STUDENT membership in a specific organization.

A User may be a student in one organization and an owner in another.

Responsibilities:

* view organizations where they are a member
* view enrolled courses
* access resources for enrolled courses
* view published quizzes for enrolled courses
* submit quiz attempts
* view their own certificates

---

## 3.4 Unauthenticated Visitor

An unauthenticated visitor can only access public APIs.

Allowed actions:

* register
* login
* request password reset
* reset password with valid token
* verify email with valid token
* verify public certificate by verification code

---

# 4. Functional Requirements

---

# 4.1 Authentication and User Account Management

## Description

The system shall provide secure authentication and account management.

## Functional Requirements

### FR-1: User Registration

The system shall allow users to register accounts using:

* name
* email
* password

Registration must not accept a business role such as OWNER or STUDENT.

A newly registered user is only an account identity.

---

### FR-2: User Login

The system shall allow users to log in using email and password.

The system shall return authentication tokens after successful login.

---

### FR-3: Access Token

The system shall issue an access token for authenticated API access.

The access token shall be used with:

```text
Authorization: Bearer <token>
```

---

### FR-4: Refresh Token

The system shall support refresh tokens for renewing access tokens.

Refresh tokens must be stored securely in the database as hashes.

The system shall support refresh token expiration and revocation.

---

### FR-5: Logout

The system shall allow users to log out by revoking their active refresh token.

The system may also support logout from all sessions.

---

### FR-6: Email Verification

The system shall support email verification.

Email verification tokens must be stored as hashes.

The user record shall include an email verification state.

---

### FR-7: Forgot Password

The system shall support password reset request flow.

The response must not reveal whether the email exists.

Password reset tokens must be stored as hashes.

---

### FR-8: Reset Password

The system shall allow password reset using a valid, unused, non-expired reset token.

After successful password reset, existing refresh tokens may be revoked.

---

### FR-9: Password Security

The system shall store passwords only as secure hashes.

Plaintext passwords must never be stored or returned.

---

### FR-10: Current User Profile

The system shall allow authenticated users to retrieve their own account profile.

The response must not include password hash or sensitive token data.

---

# 4.2 Organization Management

## Description

The system shall allow users to create and manage organizations.

## Functional Requirements

### FR-11: Create Organization

The system shall allow any authenticated user to create an organization.

When a user creates an organization:

* an organization record is created
* `owner_id` is set to the current user
* an organization membership row is created with role OWNER

---

### FR-12: View Accessible Organizations

The system shall allow users to view organizations they own or belong to.

A user must not see unrelated organizations.

---

### FR-13: View Organization Details

The system shall allow an organization owner or active organization member to view organization details.

Unauthorized users must be rejected.

---

### FR-14: Update Organization

The system shall allow only the organization owner to update organization details.

---

### FR-15: Disable or Delete Organization

The system shall allow only the organization owner to disable or delete an organization.

The preferred behavior is soft delete or status-based disabling to preserve historical records.

---

# 4.3 Organization Membership Management

## Description

The system shall manage organization-level roles through organization memberships.

## Functional Requirements

### FR-16: Add Organization Member

The system shall allow an organization owner to add a User as a STUDENT member of an organization.

The target user must already exist.

Duplicate active memberships must be prevented.

---

### FR-17: List Organization Members

The system shall allow an organization owner to list members of an owned organization.

---

### FR-18: Remove Organization Member

The system shall allow an organization owner to remove or disable a member from an organization.

Removed members must lose access to protected organization data.

---

### FR-19: Membership Role

The system shall support the following membership roles in the current phase:

* OWNER
* STUDENT

The system must support the possibility of future organization roles, such as:

* INSTRUCTOR
* MANAGER
* ASSISTANT

but these are out of scope for the current phase.

---

### FR-20: User with Multiple Organization Roles

The system shall support a User being:

* OWNER in one organization
* STUDENT in another organization
* STUDENT in multiple organizations
* OWNER of multiple organizations

---

# 4.4 Course Management

## Description

The system shall provide course creation and management capabilities.

## Functional Requirements

### FR-21: Create Course

The system shall allow organization owners to create courses under organizations they own.

---

### FR-22: Course Ownership

Each course shall belong to exactly one organization.

---

### FR-23: View Courses

The system shall allow:

* organization owners to view courses in organizations they own
* enrolled students to view courses they are enrolled in

---

### FR-24: View Course Details

The system shall allow course details to be viewed only by:

* the owner of the course organization
* users enrolled in the course

---

### FR-25: Update Course

The system shall allow only the owner of the course organization to update course information.

---

### FR-26: Archive or Delete Course

The system shall allow only the owner of the course organization to archive or delete a course.

Course deletion should preserve historical records where certificates or enrollments exist.

---

# 4.5 Course Enrollment Management

## Description

The system shall manage enrollment of organization students into courses.

## Functional Requirements

### FR-27: Enroll User in Course

The system shall allow an organization owner to enroll a User into a course.

The target User must be an ACTIVE STUDENT member of the course organization.

Enrollment uses:

```text
user_id
```

not:

```text
student_id
```

---

### FR-28: Prevent Duplicate Enrollment

The system shall prevent duplicate active enrollment for the same user and course.

---

### FR-29: View Course Enrollments

The system shall allow organization owners to view enrollments for courses in their own organizations.

---

### FR-30: View Own Enrollments

The system shall allow a user to view their own course enrollments.

---

### FR-31: Enrollment Status

The system shall support enrollment statuses such as:

* ACTIVE
* COMPLETED
* CANCELLED
* REMOVED

---

# 4.6 Resource Management

## Description

The system shall manage learning resources for courses.

The current phase supports only two resource types:

* LINK
* FILE

---

## Functional Requirements

### FR-32: Create LINK Resource

The system shall allow organization owners to create LINK resources for courses they own.

A LINK resource must include a valid URL.

---

### FR-33: Create FILE Resource

The system shall allow organization owners to create FILE resources for courses they own.

A FILE resource shall include file metadata such as:

* fileUrl
* originalFileName
* contentType
* sizeBytes

---

### FR-34: File Storage Abstraction

The system shall provide a backend file storage abstraction.

The initial implementation may use local storage for development.

The design should allow future replacement with:

* S3
* Cloudinary
* Supabase Storage
* other object storage providers

---

### FR-35: View Course Resources

The system shall allow resources to be viewed by:

* the owner of the course organization
* users enrolled in the course

---

### FR-36: Update Resource

The system shall allow only the organization owner to update resources.

---

### FR-37: Delete or Archive Resource

The system shall allow only the organization owner to delete or archive resources.

---

# 4.7 Quiz Management

## Description

The system shall support quizzes inside courses.

The quiz module shall support:

* quizzes
* questions
* options
* attempts
* submitted answers
* automatic scoring

---

## Functional Requirements

### FR-38: Create Quiz

The system shall allow organization owners to create quizzes for courses they own.

---

### FR-39: Quiz Fields

A quiz shall include:

* title
* description
* passingScore
* isPublished
* status

---

### FR-40: Add Quiz Questions

The system shall allow organization owners to add questions to quizzes.

The current phase supports:

* SINGLE_CHOICE questions

---

### FR-41: Add Quiz Options

The system shall allow organization owners to add answer options to quiz questions.

A SINGLE_CHOICE question must have exactly one correct answer.

---

### FR-42: Publish Quiz

The system shall allow organization owners to publish a quiz.

A quiz should not be publishable unless it contains valid questions and options.

---

### FR-43: View Course Quizzes

The system shall allow:

* organization owners to view all quizzes for owned courses
* enrolled users to view only published quizzes for enrolled courses

---

### FR-44: Start Quiz Attempt

The system shall allow enrolled users to start attempts for published quizzes.

---

### FR-45: Submit Quiz Attempt

The system shall allow users to submit answers for their own quiz attempts.

The system shall calculate:

* score
* pass/fail result
* submittedAt timestamp

---

### FR-46: View Quiz Attempts

The system shall allow:

* users to view their own quiz attempts
* organization owners to view attempts for quizzes in their owned organizations

---

# 4.8 Certificate Management

## Description

The system shall support certificate issuance, revocation, and public verification.

Certificates are issued to Users, not to separate Student records.

---

## Functional Requirements

### FR-47: Issue Certificate

The system shall allow organization owners to issue certificates to users enrolled in courses under owned organizations.

---

### FR-48: Certificate Eligibility

A certificate can only be issued if:

* target user exists
* target user is an ACTIVE STUDENT member of the course organization
* target user is enrolled in the course
* duplicate active certificate does not already exist
* required quiz completion rules are satisfied if configured

---

### FR-49: Certificate Number

The system shall generate a unique certificate number for every certificate.

---

### FR-50: Verification Code

The system shall generate a unique verification code for every certificate.

---

### FR-51: Certificate Snapshots

The system shall store snapshot values at issuance time:

* studentNameSnapshot
* courseTitleSnapshot
* organizationNameSnapshot

This preserves certificate history even if user, course, or organization names change later.

---

### FR-52: View Own Certificates

The system shall allow users to view their own certificates.

---

### FR-53: View Organization Certificates

The system shall allow organization owners to view certificates issued under their own organizations.

---

### FR-54: Public Certificate Verification

The system shall provide a public endpoint to verify a certificate by verification code.

The public verification response must not expose sensitive user data.

---

### FR-55: Revoke Certificate

The system shall allow organization owners to revoke certificates issued under their own organizations.

A revoked certificate must remain historically visible and verifiable as revoked.

---

# 5. Non-Functional Requirements

---

# 5.1 Performance Requirements

### NFR-1

The system shall support concurrent API users efficiently.

---

### NFR-2

API response time should not exceed 2 seconds under normal load for common endpoints.

---

### NFR-3

List endpoints shall use database-level pagination where possible.

---

### NFR-4

The system shall avoid loading large datasets into memory for pagination.

---

### NFR-5

The system shall use appropriate database indexes for commonly queried fields.

---

# 5.2 Security Requirements

### NFR-6

Passwords shall be stored using strong hashing.

---

### NFR-7

Access tokens and refresh tokens shall be protected.

---

### NFR-8

Refresh tokens shall be stored as hashes.

---

### NFR-9

Password reset and email verification tokens shall be stored as hashes.

---

### NFR-10

The system shall enforce authorization checks for all protected resources.

---

### NFR-11

The system shall prevent unauthorized access between organizations.

---

### NFR-12

The system shall not rely on global user roles for organization-level permissions.

---

### NFR-13

The system shall protect authentication endpoints using rate limiting.

Rate-limited endpoints should include:

* login
* register
* forgot password
* resend verification email

---

### NFR-14

The system shall not expose sensitive data in API responses.

Sensitive data includes:

* password hash
* refresh token hash
* reset token hash
* verification token hash
* internal secrets

---

# 5.3 Availability Requirements

### NFR-15

The system should be deployable to a cloud environment.

---

### NFR-16

The system should support backup and recovery mechanisms.

---

### NFR-17

The system should expose health check endpoints for deployment monitoring.

---

# 5.4 Scalability Requirements

### NFR-18

The architecture shall support future feature expansion.

---

### NFR-19

The system shall support increasing numbers of:

* users
* organizations
* memberships
* courses
* resources
* quizzes
* quiz attempts
* certificates

---

### NFR-20

The backend should remain a modular monolith unless there is a strong need for microservices later.

---

# 5.5 Maintainability Requirements

### NFR-21

The system shall follow modular backend architecture.

---

### NFR-22

The codebase shall be organized by feature modules.

Recommended modules:

* auth
* user
* organization
* membership
* course
* enrollment
* resource
* quiz
* certificate
* common
* security
* config

---

### NFR-23

Business rules shall be implemented in services, not controllers.

---

### NFR-24

Repeated authorization logic shall be centralized in an AuthorizationService.

---

### NFR-25

API responses shall use consistent response wrappers.

---

# 5.6 Usability Requirements

Because the current phase is API-only, usability requirements apply to API consumers.

### NFR-26

The API shall be predictable and consistent.

---

### NFR-27

The API shall provide clear validation errors.

---

### NFR-28

The API shall provide Swagger/OpenAPI documentation.

---

### NFR-29

The API shall use consistent naming conventions and versioning.

---

# 6. System Architecture

---

# 6.1 High-Level Architecture

The current phase consists of:

* Backend API
* Database Layer
* Authentication and Authorization Layer
* File Storage Layer
* API Documentation Layer

Frontend is out of scope.

---

# 6.2 Backend API Layer

## Responsibilities

* expose REST APIs
* validate request DTOs
* return standardized responses
* enforce request-level authentication
* call service layer

## Suggested Technologies

* Java 17
* Spring Boot
* Spring Web
* Jakarta Validation

---

# 6.3 Service Layer

## Responsibilities

* enforce business rules
* enforce organization-scoped authorization
* manage transactions
* coordinate repositories
* prevent cross-tenant access
* keep controllers thin

---

# 6.4 Repository Layer

## Responsibilities

* database access
* query methods
* database-level pagination
* persistence operations

## Suggested Technologies

* Spring Data JPA
* Hibernate

---

# 6.5 Database Layer

## Responsibilities

* data persistence
* relational integrity
* indexing
* constraints
* migration history

## Suggested Technologies

* PostgreSQL
* Flyway

---

# 6.6 Authentication Layer

## Responsibilities

* user authentication
* JWT generation and validation
* refresh token management
* password reset tokens
* email verification tokens

## Suggested Technologies

* Spring Security
* JWT
* BCrypt

---

# 6.7 Authorization Layer

## Responsibilities

* organization ownership checks
* organization membership checks
* course access checks
* enrollment checks
* certificate access checks
* quiz attempt access checks

The system should include an AuthorizationService.

Example checks:

```text
ensureOrganizationOwner(organizationId)
ensureOrganizationMember(organizationId)
ensureActiveStudentMember(organizationId, userId)
ensureCourseOwner(courseId)
ensureCourseAccessible(courseId)
ensureUserEnrolledInCourse(courseId, userId)
ensureCertificateAccessible(certificateId)
ensureQuizAccessible(quizId)
ensureAttemptOwner(attemptId)
```

---

# 6.8 File Storage Layer

## Responsibilities

* store uploaded files
* return file URLs
* store file metadata
* hide storage provider details behind an interface

Initial implementation:

* local file storage for development

Future implementations may include:

* AWS S3
* Cloudinary
* Supabase Storage
* other object storage providers

---

# 7. Database Design

---

# 7.1 Primary Entities

The system contains the following primary entities:

* User
* Organization
* OrganizationMembership
* Course
* CourseEnrollment
* Resource
* Quiz
* QuizQuestion
* QuizOption
* QuizAttempt
* QuizAttemptAnswer
* Certificate
* RefreshToken
* EmailVerificationToken
* PasswordResetToken

The system should not use these old entities as primary design elements:

* Student
* OrganizationStudent
* CourseStudent

---

# 7.2 Entity Summary

## User

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

## Organization

Represents an educational or training organization.

Important fields:

* id
* name
* ownerId
* status
* createdAt
* updatedAt
* deletedAt

---

## OrganizationMembership

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
* STUDENT

---

## Course

Represents a course under an organization.

Important fields:

* id
* organizationId
* title
* description
* status
* createdAt
* updatedAt
* deletedAt

---

## CourseEnrollment

Represents enrollment of a user in a course.

Important fields:

* courseId
* userId
* status
* enrolledAt
* completedAt

---

## Resource

Represents learning material under a course.

Important fields:

* id
* courseId
* title
* description
* type
* url
* fileUrl
* originalFileName
* contentType
* sizeBytes
* status
* createdAt
* updatedAt
* deletedAt

Supported types:

* LINK
* FILE

---

## Quiz

Represents a course quiz.

Important fields:

* id
* courseId
* title
* description
* passingScore
* isPublished
* status
* createdAt
* updatedAt
* deletedAt

---

## QuizQuestion

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

## QuizOption

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

## QuizAttempt

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

## QuizAttemptAnswer

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

## Certificate

Represents a course certificate issued to a user.

Important fields:

* id
* certificateNumber
* verificationCode
* organizationId
* courseId
* userId
* title
* studentNameSnapshot
* courseTitleSnapshot
* organizationNameSnapshot
* status
* issuedAt
* revokedAt
* revokeReason
* pdfUrl
* createdAt
* updatedAt

---

## RefreshToken

Represents a refresh token session.

Important fields:

* id
* userId
* tokenHash
* expiresAt
* revokedAt
* replacedByTokenId
* createdAt

---

## EmailVerificationToken

Represents email verification flow.

Important fields:

* id
* userId
* tokenHash
* expiresAt
* usedAt
* createdAt

---

## PasswordResetToken

Represents password reset flow.

Important fields:

* id
* userId
* tokenHash
* expiresAt
* usedAt
* createdAt

---

# 7.3 Relationships

* A User may own many Organizations.
* A User may belong to many Organizations through OrganizationMembership.
* An Organization has one owner.
* An Organization has many OrganizationMembership records.
* An Organization has many Courses.
* A Course belongs to one Organization.
* A Course has many Resources.
* A Course has many Quizzes.
* A Course has many CourseEnrollments.
* A User may be enrolled in many Courses through CourseEnrollment.
* A Quiz belongs to one Course.
* A Quiz has many QuizQuestions.
* A QuizQuestion has many QuizOptions.
* A Quiz has many QuizAttempts.
* A QuizAttempt belongs to one User.
* A QuizAttempt has many QuizAttemptAnswers.
* A Certificate belongs to one Organization.
* A Certificate belongs to one Course.
* A Certificate belongs to one User.
* A User may have many Certificates.
* A User may have many RefreshTokens.
* A User may have many EmailVerificationTokens.
* A User may have many PasswordResetTokens.

---

# 8. API Design

---

# 8.1 API Base Path

All versioned API endpoints shall use:

```text
/api/v1
```

---

# 8.2 Authentication APIs

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

# 8.3 User APIs

* GET `/api/v1/users/me`

---

# 8.4 Organization APIs

* POST `/api/v1/organizations`
* GET `/api/v1/organizations`
* GET `/api/v1/organizations/{organizationId}`
* PUT `/api/v1/organizations/{organizationId}`
* DELETE `/api/v1/organizations/{organizationId}`

---

# 8.5 Organization Membership APIs

* POST `/api/v1/organizations/{organizationId}/members`
* GET `/api/v1/organizations/{organizationId}/members`
* DELETE `/api/v1/organizations/{organizationId}/members/{userId}`

---

# 8.6 Course APIs

* POST `/api/v1/courses`
* GET `/api/v1/courses`
* GET `/api/v1/courses/{courseId}`
* PUT `/api/v1/courses/{courseId}`
* DELETE `/api/v1/courses/{courseId}`

---

# 8.7 Enrollment APIs

* POST `/api/v1/enrollments`
* GET `/api/v1/enrollments/me`
* GET `/api/v1/enrollments/course/{courseId}`
* GET `/api/v1/enrollments/user/{userId}`

---

# 8.8 Resource APIs

* POST `/api/v1/resources`
* GET `/api/v1/resources/course/{courseId}`
* GET `/api/v1/resources/{resourceId}`
* PUT `/api/v1/resources/{resourceId}`
* DELETE `/api/v1/resources/{resourceId}`
* POST `/api/v1/files`

---

# 8.9 Quiz APIs

* POST `/api/v1/quizzes`
* GET `/api/v1/quizzes/course/{courseId}`
* GET `/api/v1/quizzes/{quizId}`
* PUT `/api/v1/quizzes/{quizId}`
* DELETE `/api/v1/quizzes/{quizId}`
* POST `/api/v1/quizzes/{quizId}/questions`
* POST `/api/v1/quizzes/{quizId}/publish`
* POST `/api/v1/quizzes/{quizId}/attempts`
* POST `/api/v1/quiz-attempts/{attemptId}/submit`
* GET `/api/v1/quiz-attempts/{attemptId}`
* GET `/api/v1/quizzes/{quizId}/attempts`

---

# 8.10 Certificate APIs

* POST `/api/v1/certificates`
* GET `/api/v1/certificates/me`
* GET `/api/v1/certificates/organization/{organizationId}`
* GET `/api/v1/certificates/{certificateId}`
* POST `/api/v1/certificates/{certificateId}/revoke`
* GET `/api/v1/public/certificates/verify/{verificationCode}`

---

# 9. Object-Oriented Design

---

# 9.1 Core Classes and Responsibilities

## User

Responsibilities:

* identity
* authentication
* account profile
* password hash ownership

---

## Organization

Responsibilities:

* training organization representation
* ownership relationship
* organization lifecycle status

---

## OrganizationMembership

Responsibilities:

* organization-scoped role
* membership status
* owner/student distinction inside organization

---

## Course

Responsibilities:

* course representation
* organization association
* course lifecycle status

---

## CourseEnrollment

Responsibilities:

* user-course enrollment
* enrollment status
* completion tracking

---

## Resource

Responsibilities:

* learning material representation
* LINK or FILE type handling
* file metadata ownership

---

## Quiz

Responsibilities:

* quiz representation
* publish state
* passing score
* course association

---

## QuizQuestion

Responsibilities:

* question representation
* question type
* question points

---

## QuizOption

Responsibilities:

* answer option representation
* correct answer marker

---

## QuizAttempt

Responsibilities:

* user quiz attempt
* score tracking
* pass/fail result
* submission lifecycle

---

## QuizAttemptAnswer

Responsibilities:

* submitted selected answer
* correctness
* awarded points

---

## Certificate

Responsibilities:

* certificate issuance
* verification code
* historical snapshots
* revocation state

---

## AuthorizationService

Responsibilities:

* organization ownership checks
* organization membership checks
* course access checks
* enrollment checks
* certificate access checks
* quiz attempt access checks

---

## FileStorageService

Responsibilities:

* file storage abstraction
* upload handling
* storage provider independence

---

# 9.2 Design Principles

The system shall follow:

* SOLID principles
* separation of concerns
* modular architecture
* reusable components
* clean code practices
* DTO-based API boundaries
* service-based business rules
* repository-based persistence
* centralized authorization checks

---

# 10. Security Design

---

# 10.1 Authentication Security

The system shall use:

* JWT-based authentication
* secure password hashing
* token expiration
* refresh token rotation where possible
* refresh token revocation
* password reset tokens
* email verification tokens

---

# 10.2 Authorization Security

The system shall use organization-scoped authorization.

The system shall not rely on global `users.role` for business permissions.

Authorization must check:

* organization ownership
* organization membership
* course ownership
* course enrollment
* quiz attempt ownership
* certificate ownership or organization ownership

---

# 10.3 Data Protection

The system shall protect sensitive data.

Sensitive fields must not be returned in API responses:

* passwordHash
* refreshTokenHash
* resetTokenHash
* emailVerificationTokenHash
* internal secrets

---

# 10.4 Multi-Tenant Isolation

The system shall prevent unauthorized access between organizations.

Users can access organization data only when they are:

* owner of the organization
* active member of the organization
* enrolled in a course that belongs to the organization, where applicable

---

# 10.5 Rate Limiting

The system shall protect sensitive public endpoints from abuse.

Rate limiting should apply to:

* login
* register
* forgot password
* resend verification
* reset password where appropriate

---

# 11. API Response Design

---

# 11.1 Success Response

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

# 11.2 Error Response

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

# 11.3 Pagination

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

# 12. Deployment Requirements

---

# 12.1 Backend Deployment

The backend should support deployment using:

* Docker
* cloud VM
* managed container platform
* CI/CD pipeline

---

# 12.2 Database Deployment

The system should support PostgreSQL managed services.

Possible providers:

* Neon
* Supabase
* AWS RDS
* DigitalOcean Managed PostgreSQL

---

# 12.3 Configuration

The system shall use environment-based configuration.

Configuration should include:

* database URL
* JWT secret
* token expiration settings
* storage configuration
* CORS settings
* rate limiting settings
* mail settings if email sending is enabled

---

# 12.4 Health Checks

The backend shall expose health check endpoints suitable for deployment monitoring.

---

# 13. Testing Requirements

---

# 13.1 Unit Tests

Unit tests should cover:

* authentication logic
* authorization logic
* course business rules
* enrollment rules
* resource validation
* quiz scoring
* certificate issuance rules
* token validation

---

# 13.2 Integration Tests

Integration tests should cover:

* registration without role
* login
* refresh token flow
* logout
* organization creation
* owner membership creation
* membership management
* course creation
* course enrollment
* resource creation
* quiz creation
* quiz attempt submission
* certificate issuance
* public certificate verification
* cross-organization access rejection

---

# 13.3 Security Tests

Security tests should verify:

* protected endpoints reject unauthenticated requests
* unrelated users cannot access organization data
* students cannot manage owner-only resources
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
* React / Next.js / Tailwind implementation
* public certificate verification web page
* payment system
* billing and subscriptions
* AI recommendations
* attendance tracking
* mentorship sessions
* chat system
* notification system
* analytics dashboard
* leaderboard and badges
* assignment submission workflow
* advanced question bank engine
* video calls
* calendar scheduling
* advanced reporting
* microservices split
* multi-owner organization management
* ownership transfer
* marketplace/public course discovery
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
* assignment system
* attendance tracking
* progress analytics
* notifications
* team projects
* advanced reporting
* certificate PDF generation
* QR code verification
* external storage providers
* public certificate verification page
* payment and subscription modules

---

# 16. Product Positioning

## Official Product Category

API-only Training and Course Management Backend Platform

---

# 17. One-Line Product Pitch

Cohive is a modular backend API for managing organizations, memberships, courses, resources, quizzes, enrollments, and verifiable certificates with organization-scoped permissions.
