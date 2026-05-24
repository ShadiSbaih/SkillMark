# Cohive Backend Architecture


## Overview

Cohive is a modular Spring Boot backend for a multi-organization training platform.

The current phase is API-only.

No frontend is required in the current phase.

Core stack:

- Java 17
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway
- OpenAPI/Swagger

Core priorities:

- keep feature modules isolated
- keep the API contract stable
- keep business rules in services
- keep infrastructure lightweight
- enforce organization-level isolation
- support one user having different roles in different organizations

---

# Product Model

Cohive is designed around organizations, courses, resources, quizzes, enrollments, and certificates.

Important identity rule:

A `User` is only an account identity.

A user must not be treated as globally `OWNER` or globally `STUDENT`.

Instead, organization-level permissions are stored in:

```text
organization_memberships

This allows:

User Ahmad:
- OWNER in Organization A
- STUDENT in Organization B
- STUDENT in Organization C
Request Flow
Client
  -> Controller
  -> Service
  -> AuthorizationService
  -> Repository
  -> Database

Controllers handle HTTP concerns.

Services enforce business rules.

AuthorizationService centralizes organization-scoped permission checks.

Repositories handle persistence.

Entities represent database state.

DTOs define external API contracts.

Module Structure

Each feature keeps its own package:

auth
user
organization
membership
course
enrollment
resource
quiz
certificate
file

Shared packages:

config
common
security

Typical feature layout:

course/
  controller/
  dto/
  entity/
  repository/
  service/
Removed Legacy Modules

The previous design used a separate student domain model and global User.role.

The new design removes or avoids relying on:

users.role
students
organization_students
course_students

These are replaced with:

organization_memberships
course_enrollments

A student is now a User with a STUDENT membership in a specific organization.

Layer Responsibilities
Layer	Responsibility
Controller	Accept requests, trigger validation, return standardized responses
Service	Apply business rules and call authorization checks
AuthorizationService	Enforce organization-level permissions
Repository	Execute persistence operations and query methods
Entity	Represent database state and relationships
DTO	Define API request and response shapes

Rules:

controllers do not contain business logic
controllers do not access repositories directly
services do not expose entities to the API
services call AuthorizationService for permission checks
repositories stay persistence-oriented
DTOs are the API boundary
Authorization Architecture

Authorization is organization-scoped.

Global user roles should not be used for business permissions.

AuthorizationService

Create a central service named:

AuthorizationService

Suggested methods:

ensureOrganizationOwner(UUID organizationId)

ensureOrganizationMember(UUID organizationId)

ensureOrganizationStudent(UUID organizationId, UUID userId)

isOrganizationOwner(UUID organizationId, UUID userId)

isOrganizationMember(UUID organizationId, UUID userId)

ensureCourseOwner(UUID courseId)

ensureCourseAccessible(UUID courseId)

ensureUserEnrolledInCourse(UUID courseId, UUID userId)

ensureCertificateAccessible(UUID certificateId)
Core Rules
Any authenticated user can create an organization.
The creator of an organization becomes its owner.
The owner is stored in organizations.owner_id.
The owner also gets an organization_memberships row with role OWNER.
A user can own multiple organizations.
A user can be a student/member in multiple organizations.
The same user can be owner in one organization and student in another.
Organization owners manage only their organizations.
Students access only enrolled course content.
No cross-organization data leakage is allowed.
DTO Strategy

All external API input and output uses DTOs.

Request DTO rules:

keep validation annotations on request DTOs
do not expose internal database structure unnecessarily
use userId instead of studentId
do not include role in public registration request

Response DTO rules:

map entities to responses using static factories such as fromEntity(...)
do not expose password hashes
do not expose sensitive token hashes
do not expose quiz correct answers to students before submission
do not expose private internal certificate data through public verification endpoint
Repository Strategy

Repositories extend JpaRepository and remain feature-specific.

Guidelines:

keep one repository interface per aggregate when query methods are needed
use repository-level pagination where possible
avoid loading large lists into memory for pagination
do not introduce empty repository abstractions just for structure
do not move repository access into controllers
keep custom methods focused on query intent, not business decisions
Pagination Strategy

List endpoints should return:

ApiResponse<PageResponse<T>>

Implementation guidelines:

controllers use PageResponse.from(Page<T>)
repositories should support Pageable
avoid manual in-memory pagination for large datasets
use database-level pagination for organizations, members, courses, resources, quizzes, attempts, and certificates
Security Architecture

Authentication is stateless and JWT-based.

Current structure:

auth contains authentication use cases and auth DTOs
security contains JWT parsing, filter integration, user details loading, and access handlers
config wires the security filter chain and related beans

Authentication endpoints:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/logout-all
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

Security rules:

public registration must not accept role
password hashing uses BCrypt
JWT generation and parsing stay centralized
refresh tokens are stored as hashes
password reset tokens are stored as hashes
email verification tokens are stored as hashes
exception handlers return the standard API error format
Token Strategy

Use two token types:

Access Token
short-lived
sent in Authorization: Bearer <token>
used to access protected APIs
Refresh Token
longer-lived
stored as a hash in the database
rotated when used
can be revoked during logout
supports logout from all devices
Rate Limiting

Rate limiting should protect sensitive public endpoints:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/resend-verification

Implementation options:

Bucket4j
Redis-backed limiter
custom Spring filter for initial MVP
Configuration Strategy

Configuration stays small and explicit.

Current responsibilities:

SecurityConfig wires the security filter chain, authentication provider, and password encoder
OpenApiConfig defines OpenAPI metadata
datasource configuration should rely on Spring Boot defaults where possible
production secrets must be provided through environment variables

Recommended profiles:

local
test
prod
Validation And Errors

Validation uses Jakarta Validation on DTOs.

Common annotations:

@NotBlank
@NotNull
@Email
@Size
@Valid

Global exception handling uses @RestControllerAdvice.

Error responses should stay consistent with the API design.

Multi-Tenant Rules

Tenant isolation is enforced in services and centralized authorization checks.

Key rules:

users see only organizations they own or belong to
organization owners manage only their own organizations
students access only organizations where they are active members
students access only courses where they are enrolled
students access only resources and quizzes belonging to enrolled courses
certificates are visible only to certificate owner or organization owner
public certificate verification returns safe public data only
Database Architecture

Persistence uses PostgreSQL with UUID primary keys and Flyway migrations.

Core tables:

users
organizations
organization_memberships
courses
course_enrollments
resources
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_attempt_answers
certificates
refresh_tokens
email_verification_tokens
password_reset_tokens

Design expectations:

normalized relationships
explicit ownership and membership checks
created/updated timestamps on major entities
status fields for soft deletion
indexes for organization and user access patterns
File Storage Architecture

Resources support only:

LINK
FILE

File resource handling should use an abstraction:

FileStorageService

Initial implementation:

LocalFileStorageService

Future implementations may include:

S3
Cloudinary
Supabase Storage
Azure Blob Storage

Rules:

services should depend on FileStorageService
resource records store file metadata
storage implementation details should not leak into controllers
Quiz Architecture

A quiz is composed of:

Quiz
QuizQuestion
QuizOption
QuizAttempt
QuizAttemptAnswer

Initial question type:

SINGLE_CHOICE

Rules:

organization owner manages quizzes
students can only attempt published quizzes for enrolled courses
correct answers must not be exposed before submission
backend calculates score and pass/fail
attempts are stored for history/review
Certificate Architecture

Certificates are production-friendly and verifiable.

A certificate belongs to:

organization
course
user

Certificate records include:

certificate number
verification code
title
student name snapshot
course title snapshot
organization name snapshot
issued date
status
optional PDF URL

Public verification endpoint:

GET /api/v1/public/certificates/verify/{verificationCode}

Rules:

public endpoint exposes only safe certificate data
certificates can be revoked
duplicate active certificates for the same user and course are not allowed
Development Principles

Prefer:

small configs
explicit service logic
organization-scoped authorization
feature-local repositories
DTO factories for simple mappings
database-level pagination
modular monolith structure
simple maintainable code

Avoid:

global User.role for business permissions
separate Student entity as the main permission model
extra abstraction layers for trivial field mapping
empty interfaces with no behavior or query intent
API shape changes without documentation updates
moving business logic into controllers
over-engineering with microservices
