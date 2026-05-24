# Skillmark API Design

## 1. Overview

This document defines the REST API design for **Skillmark**, an API-first quiz and certification backend.

Skillmark allows organizations to:

- register and authenticate users
- create organizations
- manage members
- create quizzes
- publish quizzes
- allow participants to submit attempts
- issue verifiable certificates
- verify certificates publicly

The current API is designed for a backend MVP.

---

## 2. API Design Principles

The API should be:

- RESTful
- predictable
- versioned
- secure
- consistent
- easy to test in Swagger or Postman
- based on organization-scoped permissions

All business permissions must be checked using organization membership, not a global user role.

---

## 3. Base URL

All endpoints should use the following versioned base path:

```text
/api/v1
```

Example:

```text
POST /api/v1/auth/register
```

---

## 4. Authentication

Protected endpoints require an access token in the Authorization header:

```http
Authorization: Bearer <accessToken>
```

Public endpoints do not require authentication.

Public endpoints include:

- register
- login
- forgot password
- reset password
- verify email
- resend verification email
- public certificate verification

---

## 5. Standard Response Format

## 5.1 Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## 5.2 Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-05-24T15:00:00Z",
  "path": "/api/v1/auth/register"
}
```

## 5.3 Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
}
```

---

## 6. HTTP Status Codes

| Status Code | Meaning |
|---:|---|
| 200 | Success |
| 201 | Created |
| 204 | Success with no content |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict / duplicate resource |
| 422 | Business rule violation |
| 429 | Too many requests |
| 500 | Internal server error |

---

# 7. Authentication APIs

## 7.1 Register

```http
POST /api/v1/auth/register
```

Public endpoint.

Creates a new user account.

Registration must not accept a business role such as OWNER or PARTICIPANT.

### Request Body

```json
{
  "name": "Ahmad Ashqar",
  "email": "ahmad@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Account registered successfully. Please verify your email.",
  "data": {
    "id": "user-id",
    "name": "Ahmad Ashqar",
    "email": "ahmad@example.com",
    "emailVerified": false,
    "status": "ACTIVE"
  }
}
```

### Validation Rules

- name is required
- email is required and must be unique
- password is required and must meet minimum security rules
- request must not include role

---

## 7.2 Login

```http
POST /api/v1/auth/login
```

Public endpoint.

### Request Body

```json
{
  "email": "ahmad@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "user-id",
      "name": "Ahmad Ashqar",
      "email": "ahmad@example.com",
      "emailVerified": true
    }
  }
}
```

---

## 7.3 Refresh Token

```http
POST /api/v1/auth/refresh
```

Public endpoint, but requires a valid refresh token.

### Request Body

```json
{
  "refreshToken": "refresh-token"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-refresh-token",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

---

## 7.4 Logout

```http
POST /api/v1/auth/logout
```

Protected endpoint.

### Request Body

```json
{
  "refreshToken": "refresh-token"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## 7.5 Logout From All Sessions

```http
POST /api/v1/auth/logout-all
```

Protected endpoint.

Revokes all active refresh tokens for the current user.

---

## 7.6 Forgot Password

```http
POST /api/v1/auth/forgot-password
```

Public endpoint.

The response must not reveal whether the email exists.

### Request Body

```json
{
  "email": "ahmad@example.com"
}
```

### Success Response

```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent.",
  "data": null
}
```

---

## 7.7 Reset Password

```http
POST /api/v1/auth/reset-password
```

Public endpoint.

### Request Body

```json
{
  "token": "reset-token",
  "newPassword": "NewStrongPassword123"
}
```

---

## 7.8 Verify Email

```http
POST /api/v1/auth/verify-email
```

Public endpoint.

### Request Body

```json
{
  "token": "email-verification-token"
}
```

---

## 7.9 Resend Verification Email

```http
POST /api/v1/auth/resend-verification
```

Public or protected depending on implementation.

### Request Body

```json
{
  "email": "ahmad@example.com"
}
```

---

# 8. User APIs

## 8.1 Get Current User

```http
GET /api/v1/users/me
```

Protected endpoint.

### Success Response

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "user-id",
    "name": "Ahmad Ashqar",
    "email": "ahmad@example.com",
    "emailVerified": true,
    "status": "ACTIVE",
    "createdAt": "2026-05-24T15:00:00Z"
  }
}
```

The response must not include password hash or token hashes.

---

# 9. Organization APIs

## 9.1 Create Organization

```http
POST /api/v1/organizations
```

Protected endpoint.

Any authenticated user can create an organization.

The creator automatically becomes OWNER of the organization.

### Request Body

```json
{
  "name": "Computer Science Club",
  "description": "University student club for programming and technology activities."
}
```

### Success Response

```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "organization-id",
    "name": "Computer Science Club",
    "description": "University student club for programming and technology activities.",
    "ownerId": "user-id",
    "status": "ACTIVE",
    "createdAt": "2026-05-24T15:00:00Z"
  }
}
```

---

## 9.2 Get Accessible Organizations

```http
GET /api/v1/organizations?page=0&size=10
```

Protected endpoint.

Returns organizations where the current user is an owner or active member.

---

## 9.3 Get Organization Details

```http
GET /api/v1/organizations/{organizationId}
```

Protected endpoint.

Allowed for:

- organization owner
- active organization member

---

## 9.4 Update Organization

```http
PUT /api/v1/organizations/{organizationId}
```

Protected endpoint.

Allowed only for organization owner.

### Request Body

```json
{
  "name": "Updated Computer Science Club",
  "description": "Updated description"
}
```

---

## 9.5 Delete or Disable Organization

```http
DELETE /api/v1/organizations/{organizationId}
```

Protected endpoint.

Allowed only for organization owner.

Recommended behavior: soft delete or status-based disabling.

---

# 10. Organization Membership APIs

## 10.1 Add Organization Member

```http
POST /api/v1/organizations/{organizationId}/members
```

Protected endpoint.

Allowed only for organization owner.

The target user must already exist.

### Request Body

```json
{
  "userId": "target-user-id",
  "role": "PARTICIPANT"
}
```

For the MVP, allowed role to add manually:

```text
PARTICIPANT
```

OWNER is created automatically when the organization is created.

---

## 10.2 List Organization Members

```http
GET /api/v1/organizations/{organizationId}/members?page=0&size=10
```

Protected endpoint.

Allowed only for organization owner.

---

## 10.3 Remove Organization Member

```http
DELETE /api/v1/organizations/{organizationId}/members/{userId}
```

Protected endpoint.

Allowed only for organization owner.

Recommended behavior:

- set membership status to REMOVED or INACTIVE
- preserve historical attempts and certificates

---

# 11. Quiz APIs

## 11.1 Create Quiz

```http
POST /api/v1/quizzes
```

Protected endpoint.

Allowed only for organization owner.

### Request Body

```json
{
  "organizationId": "organization-id",
  "title": "Git & GitHub Workshop Quiz",
  "description": "Short quiz for students after the workshop.",
  "passingScore": 70,
  "durationMinutes": 30,
  "maxAttempts": 2,
  "certificateEnabled": true,
  "certificateIssueMode": "AUTO"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "id": "quiz-id",
    "organizationId": "organization-id",
    "title": "Git & GitHub Workshop Quiz",
    "passingScore": 70,
    "durationMinutes": 30,
    "maxAttempts": 2,
    "certificateEnabled": true,
    "certificateIssueMode": "AUTO",
    "isPublished": false,
    "status": "DRAFT"
  }
}
```

---

## 11.2 Get Quizzes

```http
GET /api/v1/quizzes?page=0&size=10
```

Protected endpoint.

Suggested behavior:

- owner sees quizzes in owned organizations
- participant sees published quizzes in organizations where they are active member

---

## 11.3 Get Organization Quizzes

```http
GET /api/v1/quizzes/organization/{organizationId}?page=0&size=10
```

Protected endpoint.

Allowed for:

- organization owner: can see all quizzes
- participant: can see published quizzes only

---

## 11.4 Get Quiz Details

```http
GET /api/v1/quizzes/{quizId}
```

Protected endpoint.

Allowed for:

- owner of quiz organization
- active participant if quiz is published

---

## 11.5 Update Quiz

```http
PUT /api/v1/quizzes/{quizId}
```

Protected endpoint.

Allowed only for owner of quiz organization.

Published quiz modification should be restricted if attempts already exist.

---

## 11.6 Delete or Archive Quiz

```http
DELETE /api/v1/quizzes/{quizId}
```

Protected endpoint.

Allowed only for owner of quiz organization.

Recommended behavior: archive or soft delete.

---

## 11.7 Add Question to Quiz

```http
POST /api/v1/quizzes/{quizId}/questions
```

Protected endpoint.

Allowed only for owner of quiz organization.

### Request Body

```json
{
  "text": "What command is used to create a new Git branch?",
  "type": "SINGLE_CHOICE",
  "points": 1,
  "position": 1,
  "options": [
    {
      "text": "git branch branch-name",
      "isCorrect": true,
      "position": 1
    },
    {
      "text": "git create branch-name",
      "isCorrect": false,
      "position": 2
    },
    {
      "text": "git new branch-name",
      "isCorrect": false,
      "position": 3
    }
  ]
}
```

Validation:

- question text is required
- type must be SINGLE_CHOICE in MVP
- points must be positive
- at least two options are recommended
- exactly one option must be correct

---

## 11.8 Publish Quiz

```http
POST /api/v1/quizzes/{quizId}/publish
```

Protected endpoint.

Allowed only for owner of quiz organization.

The quiz can be published only if:

- it has at least one question
- every question has valid options
- every SINGLE_CHOICE question has exactly one correct option
- quiz settings are valid

---

# 12. Quiz Attempt APIs

## 12.1 Start Quiz Attempt

```http
POST /api/v1/quizzes/{quizId}/attempts
```

Protected endpoint.

Allowed only for active participants of the quiz organization.

Rules:

- quiz must be published
- quiz must be active
- user must be active participant
- max attempts must not be exceeded

### Success Response

```json
{
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "attemptId": "attempt-id",
    "quizId": "quiz-id",
    "status": "IN_PROGRESS",
    "startedAt": "2026-05-24T15:00:00Z"
  }
}
```

---

## 12.2 Submit Quiz Attempt

```http
POST /api/v1/quiz-attempts/{attemptId}/submit
```

Protected endpoint.

Allowed only for the owner of the attempt.

### Request Body

```json
{
  "answers": [
    {
      "questionId": "question-id-1",
      "selectedOptionId": "option-id-1"
    },
    {
      "questionId": "question-id-2",
      "selectedOptionId": "option-id-5"
    }
  ]
}
```

### Success Response

```json
{
  "success": true,
  "message": "Quiz attempt submitted successfully",
  "data": {
    "attemptId": "attempt-id",
    "score": 80,
    "passed": true,
    "status": "SUBMITTED",
    "submittedAt": "2026-05-24T15:20:00Z",
    "certificateIssued": true,
    "certificateId": "certificate-id"
  }
}
```

Rules:

- user can submit only their own attempt
- attempt must be IN_PROGRESS
- selected options must belong to the correct questions
- questions must belong to the attempt quiz
- backend calculates score
- duplicate submission is rejected

---

## 12.3 Get My Attempts

```http
GET /api/v1/quiz-attempts/me?page=0&size=10
```

Protected endpoint.

Returns attempts for the current user.

---

## 12.4 Get Attempt Details

```http
GET /api/v1/quiz-attempts/{attemptId}
```

Protected endpoint.

Allowed for:

- attempt owner
- organization owner of the quiz

---

## 12.5 Get Quiz Attempts

```http
GET /api/v1/quizzes/{quizId}/attempts?page=0&size=10
```

Protected endpoint.

Allowed only for owner of quiz organization.

---

# 13. Certificate APIs

## 13.1 Issue Certificate Manually

```http
POST /api/v1/certificates
```

Protected endpoint.

Allowed only for owner of quiz organization.

Used when quiz certificateIssueMode is MANUAL.

### Request Body

```json
{
  "quizId": "quiz-id",
  "userId": "participant-user-id",
  "attemptId": "attempt-id",
  "title": "Git & GitHub Workshop Certificate"
}
```

Rules:

- user must exist
- user must be active participant in the organization
- attempt must be submitted
- attempt must be passing
- duplicate active certificate must not exist
- owner must own the quiz organization

---

## 13.2 Get My Certificates

```http
GET /api/v1/certificates/me?page=0&size=10
```

Protected endpoint.

Returns certificates issued to the current user.

---

## 13.3 Get Organization Certificates

```http
GET /api/v1/certificates/organization/{organizationId}?page=0&size=10
```

Protected endpoint.

Allowed only for organization owner.

---

## 13.4 Get Certificate Details

```http
GET /api/v1/certificates/{certificateId}
```

Protected endpoint.

Allowed for:

- certificate owner
- owner of certificate organization

---

## 13.5 Revoke Certificate

```http
POST /api/v1/certificates/{certificateId}/revoke
```

Protected endpoint.

Allowed only for owner of certificate organization.

### Request Body

```json
{
  "reason": "Issued by mistake"
}
```

Revoked certificates must remain historically visible and publicly verifiable as revoked.

---

## 13.6 Public Certificate Verification

```http
GET /api/v1/public/certificates/verify/{verificationCode}
```

Public endpoint.

### Success Response

```json
{
  "success": true,
  "message": "Certificate verified successfully",
  "data": {
    "certificateNumber": "Skillmark-2026-000001",
    "status": "ACTIVE",
    "participantName": "Ahmad Ashqar",
    "quizTitle": "Git & GitHub Workshop Quiz",
    "organizationName": "Computer Science Club",
    "issuedAt": "2026-05-24T15:30:00Z",
    "revokedAt": null
  }
}
```

The public response must not expose sensitive data such as:

- user email
- user ID if not needed
- internal attempt details
- token data

---

# 14. Optional Resource APIs

Resources are optional in the MVP.

## 14.1 Create Quiz Resource

```http
POST /api/v1/quizzes/{quizId}/resources
```

Protected endpoint.

Allowed only for owner of quiz organization.

### Request Body for LINK

```json
{
  "type": "LINK",
  "title": "Workshop Slides",
  "url": "https://example.com/slides"
}
```

---

## 14.2 Get Quiz Resources

```http
GET /api/v1/quizzes/{quizId}/resources
```

Protected endpoint.

Allowed for:

- owner of quiz organization
- active participant if quiz is published

---

## 14.3 Delete Quiz Resource

```http
DELETE /api/v1/quiz-resources/{resourceId}
```

Protected endpoint.

Allowed only for owner of quiz organization.

---

# 15. Authorization Summary

| Endpoint Group | Visitor | Auth User | Owner | Participant |
|---|---:|---:|---:|---:|
| Auth public endpoints | Yes | Yes | Yes | Yes |
| Get own profile | No | Yes | Yes | Yes |
| Create organization | No | Yes | Yes | Yes |
| Update organization | No | No | Owned only | No |
| Add members | No | No | Owned only | No |
| Create quiz | No | No | Owned only | No |
| Publish quiz | No | No | Owned only | No |
| View published quizzes | No | If member | Yes | Yes |
| Start attempt | No | If participant | If participant | Yes |
| Submit attempt | No | Own only | Own only | Own only |
| View all attempts | No | No | Owned only | No |
| Issue certificate | No | No | Owned only | No |
| Revoke certificate | No | No | Owned only | No |
| Public verify certificate | Yes | Yes | Yes | Yes |

---

# 16. Recommended MVP Endpoint List

For the first implementation, prioritize these endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/users/me

POST /api/v1/organizations
GET  /api/v1/organizations
GET  /api/v1/organizations/{organizationId}
PUT  /api/v1/organizations/{organizationId}
DELETE /api/v1/organizations/{organizationId}

POST /api/v1/organizations/{organizationId}/members
GET  /api/v1/organizations/{organizationId}/members
DELETE /api/v1/organizations/{organizationId}/members/{userId}

POST /api/v1/quizzes
GET  /api/v1/quizzes/organization/{organizationId}
GET  /api/v1/quizzes/{quizId}
PUT  /api/v1/quizzes/{quizId}
DELETE /api/v1/quizzes/{quizId}
POST /api/v1/quizzes/{quizId}/questions
POST /api/v1/quizzes/{quizId}/publish

POST /api/v1/quizzes/{quizId}/attempts
POST /api/v1/quiz-attempts/{attemptId}/submit
GET  /api/v1/quiz-attempts/me
GET  /api/v1/quizzes/{quizId}/attempts

POST /api/v1/certificates
GET  /api/v1/certificates/me
GET  /api/v1/certificates/organization/{organizationId}
POST /api/v1/certificates/{certificateId}/revoke
GET  /api/v1/public/certificates/verify/{verificationCode}
```

---

# 17. Notes for Swagger Documentation

Each endpoint should include:

- endpoint summary
- endpoint description
- required authentication
- required role/permission
- request body schema
- response schema
- error examples

Swagger should make it clear that OWNER and PARTICIPANT are organization-level roles, not global user roles.

---

# 18. Final API Design Statement

Skillmark APIs are designed around a secure organization-scoped permission model.

The API allows authenticated users to create organizations, manage organization members, create and publish quizzes, receive quiz submissions, calculate scores, issue certificates, and verify certificates publicly.

The most important API rule is that business actions must always be checked against organization membership and ownership.
