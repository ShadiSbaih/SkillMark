 Cohive API Design

## Overview

Cohive exposes a RESTful API built with Spring Boot.

The API is designed to be:

- modular
- scalable
- secure
- API-only for the current phase
- versioned
- multi-organization aware
- suitable for future frontend or mobile clients

Base URL:

```text
/api/v1
API Standards
Request Format

Requests use JSON unless the endpoint explicitly handles file uploads.

Example:

{
  "title": "Java Fundamentals"
}

For file upload endpoints, requests may use multipart/form-data.

Response Format

All successful responses follow:

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
Error Response Format

All error responses follow:

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

Future enhanced error responses may include:

{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "path": "/api/v1/courses",
  "timestamp": "2026-01-01T10:00:00Z",
  "errors": [
    {
      "field": "title",
      "message": "must not be blank"
    }
  ]
}
HTTP Status Codes
Code	Meaning
200	Success
201	Created
204	Deleted successfully with no response body
400	Validation Error
401	Unauthorized
403	Forbidden
404	Not Found
409	Conflict
429	Too Many Requests
500	Internal Server Error
Authentication Model

Cohive uses JWT-based authentication.

Important rule:

A User is an identity/account only.

A user does not have one global business role such as OWNER or STUDENT.

Instead:

a user can own one or more organizations
the same user can be a student/member in other organizations
organization-level roles are stored in organization_memberships
supported organization membership roles are:
OWNER
STUDENT

Example:

User Ahmad:
- OWNER in Organization A
- STUDENT in Organization B
- STUDENT in Organization C
Authentication API
Register
POST /api/v1/auth/register

Registers a new user account.

The request must not include a role.

Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "refresh_token",
    "expiresAt": "2026-01-01T10:15:00Z"
  }
}
Rules
Email must be unique.
Password must satisfy the password policy.
The user is created as a normal account.
No organization role is assigned during registration.
The user becomes an OWNER only when creating an organization or through a future ownership transfer/invitation flow.
Login
POST /api/v1/auth/login

Authenticates a user and returns tokens.

Request
{
  "email": "john@example.com",
  "password": "password123"
}
Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "refresh_token",
    "expiresAt": "2026-01-01T10:15:00Z"
  }
}
Refresh Token
POST /api/v1/auth/refresh

Issues a new access token using a valid refresh token.

Request
{
  "refreshToken": "refresh_token"
}
Response
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_refresh_token",
    "expiresAt": "2026-01-01T10:30:00Z"
  }
}
Rules
Refresh tokens are stored securely as hashes.
Refresh token rotation should be used.
A revoked or expired refresh token must be rejected.
Logout
POST /api/v1/auth/logout

Revokes the current refresh token.

Request
{
  "refreshToken": "refresh_token"
}
Response
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
Logout From All Devices
POST /api/v1/auth/logout-all

Revokes all active refresh tokens for the authenticated user.

Response
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "data": null
}
Verify Email
POST /api/v1/auth/verify-email

Verifies a user's email address.

Request
{
  "token": "email_verification_token"
}
Response
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
Resend Email Verification
POST /api/v1/auth/resend-verification

Sends a new email verification token.

Request
{
  "email": "john@example.com"
}
Response
{
  "success": true,
  "message": "Verification email sent if the account exists",
  "data": null
}
Forgot Password
POST /api/v1/auth/forgot-password

Starts a password reset flow.

Request
{
  "email": "john@example.com"
}
Response
{
  "success": true,
  "message": "Password reset instructions sent if the account exists",
  "data": null
}
Security Rule

The response should not reveal whether the email exists.

Reset Password
POST /api/v1/auth/reset-password

Resets the password using a valid reset token.

Request
{
  "token": "password_reset_token",
  "newPassword": "newStrongPassword123"
}
Response
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
User API
Get Current User
GET /api/v1/users/me

Returns the authenticated user's account information.

Response
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "status": "ACTIVE"
  }
}
Get My Organization Memberships
GET /api/v1/users/me/memberships

Returns organizations where the current user is an owner or student/member.

Response
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "organizationId": "uuid",
      "organizationName": "Tech Academy",
      "role": "OWNER",
      "status": "ACTIVE"
    },
    {
      "organizationId": "uuid",
      "organizationName": "Code School",
      "role": "STUDENT",
      "status": "ACTIVE"
    }
  ]
}
Organization API
Create Organization
POST /api/v1/organizations

Creates a new organization.

Any authenticated user can create an organization.

When an organization is created:

organizations.owner_id is set to the authenticated user
an organization_memberships row is created with role OWNER
Request
{
  "name": "Tech Academy"
}
Response
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "uuid",
    "name": "Tech Academy",
    "ownerId": "uuid",
    "status": "ACTIVE",
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
Get Organizations
GET /api/v1/organizations

Returns organizations visible to the authenticated user.

For owners:

returns organizations they own

For students:

returns organizations where they have an active membership
Query Params
?page=0&size=10&sort=createdAt,desc
Get Organization By ID
GET /api/v1/organizations/{id}

Returns organization details if the authenticated user is authorized.

Authorized users:

organization owner
active organization member
Delete Organization
DELETE /api/v1/organizations/{id}

Soft deletes or disables an organization.

Only the organization owner can delete the organization.

Response
{
  "success": true,
  "message": "Organization deleted successfully",
  "data": null
}
Organization Member API
Add Member To Organization
POST /api/v1/organizations/{organizationId}/members

Adds an existing user to an organization.

Only the organization owner can add members.

Request
{
  "userId": "uuid",
  "role": "STUDENT"
}
Rules
The target user must exist.
The organization must exist.
The authenticated user must own the organization.
Duplicate active membership is not allowed.
STUDENT is the primary supported role for this endpoint.
Adding another owner should be handled later through an ownership transfer or multi-owner design.
Response
{
  "success": true,
  "message": "Member added to organization successfully",
  "data": {
    "organizationId": "uuid",
    "userId": "uuid",
    "role": "STUDENT",
    "status": "ACTIVE"
  }
}
Get Organization Members
GET /api/v1/organizations/{organizationId}/members

Lists organization members.

Only the organization owner can list all members.

Response
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "items": [
      {
        "userId": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "STUDENT",
        "status": "ACTIVE",
        "createdAt": "2026-01-01T10:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
Remove Member From Organization
DELETE /api/v1/organizations/{organizationId}/members/{userId}

Removes or disables a user's membership in the organization.

Only the organization owner can remove members.

Rules
Do not allow removing the only owner unless ownership transfer is implemented.
Prefer status REMOVED over hard delete.
Course API
Create Course
POST /api/v1/courses

Creates a course under an organization.

Only the organization owner can create courses.

Request
{
  "title": "Spring Boot Basics",
  "description": "Backend fundamentals",
  "organizationId": "uuid"
}
Get Courses
GET /api/v1/courses

Returns courses visible to the authenticated user.

Optional Query Params
organizationId=uuid
page=0
size=10
sort=createdAt,desc
Rules
Organization owners can see courses in their organizations.
Students can see courses where they are enrolled.
No cross-organization leakage is allowed.
Get Course By ID
GET /api/v1/courses/{id}

Returns course details if accessible.

Authorized users:

owner of the course organization
enrolled student
Update Course
PUT /api/v1/courses/{id}

Only the organization owner can update the course.

Request
{
  "title": "Advanced Spring Boot",
  "description": "Production-ready backend concepts"
}
Delete Course
DELETE /api/v1/courses/{id}

Only the organization owner can delete or archive the course.

Prefer soft delete.

Enrollment API
Enroll User In Course
POST /api/v1/enrollments

Enrolls a user in a course.

Only the course organization owner can enroll users.

Request
{
  "userId": "uuid",
  "courseId": "uuid"
}
Rules
The authenticated user must own the course organization.
The target user must be an active STUDENT member of the course organization.
Duplicate enrollment is not allowed.
Enrollment is stored in course_enrollments.
Get Course Enrollments
GET /api/v1/enrollments/course/{courseId}

Returns enrollments for a course.

Only the course organization owner can access this endpoint.

Get User Enrollments
GET /api/v1/enrollments/user/{userId}

Returns enrollments for a user.

Rules:

A user can view their own enrollments.
Organization owner can view enrollments for members in owned organizations.
Resource API

Resources belong to courses.

Supported resource types:

LINK
FILE

Only the course organization owner can create, update, or delete resources.

Enrolled students can view course resources.

Create Link Resource
POST /api/v1/resources
Request
{
  "title": "Spring Docs",
  "description": "Official Spring documentation",
  "type": "LINK",
  "url": "https://spring.io",
  "courseId": "uuid"
}
Create File Resource Metadata
POST /api/v1/resources
Request
{
  "title": "Week 1 PDF",
  "description": "Introduction material",
  "type": "FILE",
  "fileUrl": "/uploads/week-1.pdf",
  "originalFileName": "week-1.pdf",
  "contentType": "application/pdf",
  "sizeBytes": 204800,
  "courseId": "uuid"
}
Upload File Resource
POST /api/v1/resources/upload

Uploads a file and creates a FILE resource.

Request Type
multipart/form-data
Fields
Field	Type
courseId	UUID
title	string
description	string
file	file
Rules
Only organization owner can upload.
File metadata is stored in resources.
File storage should use a storage abstraction.
Local storage is acceptable for development.
S3, Cloudinary, Supabase Storage, or similar can be added later.
Get Course Resources
GET /api/v1/resources/course/{courseId}

Authorized users:

organization owner
enrolled students
Update Resource
PUT /api/v1/resources/{id}

Only organization owner can update.

Delete Resource
DELETE /api/v1/resources/{id}

Only organization owner can delete or archive.

Prefer soft delete.

Quiz API

Quizzes belong to courses.

A usable quiz contains:

quiz metadata
questions
options
attempts
submitted answers
calculated score
pass/fail result
Create Quiz
POST /api/v1/quizzes

Only the course organization owner can create quizzes.

Request
{
  "title": "Java Quiz",
  "description": "Basic Java concepts",
  "courseId": "uuid",
  "passingScore": 60,
  "isPublished": false
}
Get Course Quizzes
GET /api/v1/quizzes/course/{courseId}

Authorized users:

course organization owner
enrolled students

Students should only see published quizzes.

Update Quiz
PUT /api/v1/quizzes/{quizId}

Only organization owner can update quiz metadata.

Delete Quiz
DELETE /api/v1/quizzes/{quizId}

Only organization owner can delete or archive a quiz.

Add Question To Quiz
POST /api/v1/quizzes/{quizId}/questions

Only organization owner can add questions.

Request
{
  "text": "Which keyword is used to inherit a class in Java?",
  "type": "SINGLE_CHOICE",
  "points": 1,
  "position": 1,
  "options": [
    {
      "text": "extends",
      "isCorrect": true,
      "position": 1
    },
    {
      "text": "implements",
      "isCorrect": false,
      "position": 2
    }
  ]
}
Rules
For SINGLE_CHOICE, exactly one option should be correct.
Question must have at least two options.
Get Quiz Questions
GET /api/v1/quizzes/{quizId}/questions

Authorized users:

organization owner
enrolled students if quiz is published

For students, correct answer flags should not be exposed before submission.

Start Quiz Attempt
POST /api/v1/quizzes/{quizId}/attempts

Allows an enrolled student to start a quiz attempt.

Response
{
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "attemptId": "uuid",
    "quizId": "uuid",
    "status": "IN_PROGRESS",
    "startedAt": "2026-01-01T10:00:00Z"
  }
}
Submit Quiz Attempt
POST /api/v1/quiz-attempts/{attemptId}/submit

Submits answers and calculates score.

Request
{
  "answers": [
    {
      "questionId": "uuid",
      "selectedOptionId": "uuid"
    }
  ]
}
Response
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "attemptId": "uuid",
    "score": 85,
    "passed": true,
    "status": "SUBMITTED",
    "submittedAt": "2026-01-01T10:10:00Z"
  }
}
Get My Quiz Attempts
GET /api/v1/quizzes/{quizId}/attempts/me

Returns attempts for the authenticated user.

Get Quiz Attempts
GET /api/v1/quizzes/{quizId}/attempts

Only organization owner can view attempts for a quiz.

Certificate API

Certificates are issued to users, not separate student records.

A certificate belongs to:

organization
course
user

Certificates include:

certificate number
verification code
snapshots of student, course, and organization names
active/revoked status
optional PDF URL
Issue Certificate
POST /api/v1/certificates

Only the course organization owner can issue certificates.

Request
{
  "userId": "uuid",
  "courseId": "uuid",
  "title": "Certificate of Completion"
}
Rules
User must be an active STUDENT member of the course organization.
User must be enrolled in the course.
If quiz completion is required, user must pass required quiz.
Duplicate active certificate for the same user and course is not allowed.
Certificate stores name snapshots at issuance time.
Get User Certificates
GET /api/v1/certificates/user/{userId}

Rules:

A user can view their own certificates.
Organization owner can view certificates for users in owned organizations.
Get Certificate By ID
GET /api/v1/certificates/{id}

Authorized users:

certificate owner
organization owner
Revoke Certificate
POST /api/v1/certificates/{id}/revoke

Only organization owner can revoke.

Request
{
  "reason": "Issued by mistake"
}
Public Certificate Verification
GET /api/v1/public/certificates/verify/{verificationCode}

Public endpoint.

Does not require authentication.

Response
{
  "success": true,
  "message": "Certificate verified successfully",
  "data": {
    "certificateNumber": "CERT-2026-000001",
    "title": "Certificate of Completion",
    "studentName": "Jane Doe",
    "courseTitle": "Spring Boot Basics",
    "organizationName": "Tech Academy",
    "issuedAt": "2026-01-01T10:00:00Z",
    "status": "ACTIVE"
  }
}
Rules
Return only safe public data.
Do not expose internal user ID unless explicitly needed.
Pagination Standard

List endpoints should support:

?page=0&size=10&sort=createdAt,desc

Example:

GET /api/v1/courses?page=0&size=10

Paginated response format:

{
  "success": true,
  "message": "Operation successful",
  "data": {
    "items": [],
    "page": 0,
    "size": 10,
    "totalElements": 0,
    "totalPages": 0
  }
}
Filtering Strategy

Support filtering through query params.

Examples:

GET /api/v1/courses?organizationId=uuid
GET /api/v1/resources/course/{courseId}?type=LINK
GET /api/v1/quizzes/course/{courseId}?published=true
Validation Rules

Use DTO validation.

Examples:

@NotBlank
@NotNull
@Email
@Size
@Valid

Validation errors should return:

400 Bad Request
Security Design

Authentication:

JWT Bearer Token

Header format:

Authorization: Bearer <token>
Protected Routes

All routes except the following require authentication:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
GET  /api/v1/public/certificates/verify/{verificationCode}
GET  /swagger-ui.html
GET  /swagger-ui/**
GET  /v3/api-docs/**
GET  /actuator/health

Swagger should be restricted or disabled in production if needed.

Rate Limiting

Rate limiting should apply to sensitive public endpoints:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/resend-verification

Excessive requests should return:

429 Too Many Requests
API Versioning

Current version:

/api/v1

Future versions:

/api/v2
/api/v3
Naming Conventions

Use:

plural resource names
lowercase paths
clear REST-style endpoints

Good:

/courses
/organizations/{id}/members
/quizzes/{quizId}/questions

Avoid:

/getCourses
/createCourse
Future API Extensions

Potential future APIs:

notifications
attendance
assignments
analytics
role management
invitation system
ownership transfer
file storage integrations
mentorship sessions
progress tracking
OpenAPI Documentation

Swagger/OpenAPI should be enabled for development.

Recommended endpoint:

/swagger-ui.html
API Design Goals

The API should remain:

predictable
consistent
scalable
API-only for the current phase
maintainable
secure
modular
organization-aware