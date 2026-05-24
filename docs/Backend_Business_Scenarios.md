# Skillmark Backend Business Scenarios

## 1. Overview

This document describes the main backend business scenarios for **Skillmark**, an API-first quiz and certification platform.

The goal of this document is to explain how the backend should behave in real use cases, especially for university students, student clubs, trainers, and organizations.

Each scenario includes:

- actor
- preconditions
- main flow
- backend rules
- expected result
- important edge cases

---

## 2. Main Actors

## 2.1 Visitor

A visitor is not authenticated.

Can:

- register
- login
- request password reset
- verify email
- verify public certificates

Cannot:

- access private organizations
- take quizzes
- view private certificates
- manage organizations

---

## 2.2 Authenticated User

An authenticated user is logged in.

Can:

- view own profile
- create organizations
- view organizations where they are owner/member
- view own attempts
- view own certificates

Does not have a global business role.

---

## 2.3 Organization Owner

A user with OWNER membership inside a specific organization.

Can manage that organization only.

Can:

- update organization
- add/remove members
- create quizzes
- publish quizzes
- view attempts
- issue/revoke certificates

---

## 2.4 Organization Participant

A user with PARTICIPANT membership inside a specific organization.

Can:

- view published quizzes
- start attempts
- submit answers
- view own results
- view own certificates

---

# 3. Scenario 1: User Registration

## Actor

Visitor

## Goal

Create a new account in Skillmark.

## Preconditions

- user is not logged in
- email is not already registered

## Main Flow

1. Visitor sends registration request with name, email, and password.
2. Backend validates input.
3. Backend checks if email is already used.
4. Backend hashes the password.
5. Backend creates user account.
6. Backend creates email verification token if email verification is enabled.
7. Backend returns created user profile without sensitive fields.

## Backend Rules

- registration must not accept OWNER or PARTICIPANT role
- password must never be stored in plain text
- email must be unique
- response must not include password hash

## Expected Result

A new user account is created.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Email already exists | Return 409 Conflict |
| Invalid email format | Return 400 Validation Error |
| Weak password | Return 400 Validation Error |
| Request contains role | Ignore or reject depending on validation policy |

---

# 4. Scenario 2: User Login

## Actor

Registered user

## Goal

Login and receive access tokens.

## Preconditions

- user account exists
- password is correct
- account is active

## Main Flow

1. User sends email and password.
2. Backend finds user by email.
3. Backend verifies password using password encoder.
4. Backend generates access token.
5. Backend generates refresh token.
6. Backend stores refresh token hash in database.
7. Backend returns tokens and user profile.

## Backend Rules

- wrong email/password should return generic error
- refresh token must be stored as hash
- raw refresh token is returned only once
- login failures should be audit logged

## Expected Result

User receives access token and refresh token.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Wrong password | Return 401 Unauthorized |
| User not found | Return 401 Unauthorized with generic message |
| User disabled | Return 403 Forbidden |
| Too many attempts | Return 429 Too Many Requests |

---

# 5. Scenario 3: Create Organization

## Actor

Authenticated user

## Goal

Create a new organization.

## Preconditions

- user is logged in

## Main Flow

1. User sends organization creation request.
2. Backend validates organization name.
3. Backend creates organization record.
4. Backend sets `owner_id` to current user.
5. Backend creates organization membership with role OWNER.
6. Backend creates audit log.
7. Backend returns organization data.

## Backend Rules

- any authenticated user can create an organization
- creator must become OWNER automatically
- owner membership must be created in the same transaction
- organization name should be required

## Expected Result

Organization is created and current user becomes owner.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Missing name | Return 400 Validation Error |
| DB failure after organization creation | Rollback transaction |
| Duplicate name | Allow or reject depending on product policy |

---

# 6. Scenario 4: Add Participant to Organization

## Actor

Organization Owner

## Goal

Add an existing user as a participant.

## Preconditions

- actor is logged in
- actor is OWNER of the organization
- target user exists

## Main Flow

1. Owner sends userId and role PARTICIPANT.
2. Backend checks actor is organization owner.
3. Backend checks target user exists.
4. Backend checks no active membership already exists.
5. Backend creates membership with role PARTICIPANT and status ACTIVE.
6. Backend creates audit log.
7. Backend returns membership data.

## Backend Rules

- only organization owner can add members
- current MVP should allow adding PARTICIPANT only
- duplicate active membership is not allowed
- target user must already be registered

## Expected Result

Target user becomes participant in organization.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Actor is not owner | Return 403 Forbidden |
| Target user not found | Return 404 Not Found |
| Membership already exists | Return 409 Conflict |
| Trying to add OWNER role manually | Return 400 or 403 depending on policy |

---

# 7. Scenario 5: Remove Participant from Organization

## Actor

Organization Owner

## Goal

Remove or disable a participant from organization access.

## Preconditions

- actor is OWNER
- participant has active membership

## Main Flow

1. Owner sends remove member request.
2. Backend checks actor is organization owner.
3. Backend finds target membership.
4. Backend changes membership status to REMOVED or INACTIVE.
5. Backend creates audit log.
6. Backend returns success response.

## Backend Rules

- removed user must lose access to organization private data
- old attempts and certificates should remain stored
- owner should not remove themselves in current MVP

## Expected Result

Participant no longer has active access.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Actor is not owner | Return 403 Forbidden |
| Membership not found | Return 404 Not Found |
| Removing owner | Reject in MVP |
| Participant already removed | Return success or conflict depending on policy |

---

# 8. Scenario 6: Create Quiz

## Actor

Organization Owner

## Goal

Create a quiz inside owned organization.

## Preconditions

- actor is logged in
- actor owns the organization

## Main Flow

1. Owner sends quiz data.
2. Backend checks organization ownership.
3. Backend validates quiz fields.
4. Backend creates quiz with status DRAFT and `isPublished = false`.
5. Backend creates audit log.
6. Backend returns quiz data.

## Backend Rules

- only owner can create quiz
- quiz belongs to organization
- passing score should be between 0 and 100
- max attempts should be at least 1
- duration should be positive
- certificate issue mode must be AUTO, MANUAL, or NONE

## Expected Result

Draft quiz is created.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Actor does not own organization | Return 403 Forbidden |
| Organization not found | Return 404 Not Found |
| Invalid passing score | Return 400 Validation Error |
| Invalid certificate mode | Return 400 Validation Error |

---

# 9. Scenario 7: Add Question and Options

## Actor

Organization Owner

## Goal

Add a single-choice question to a quiz.

## Preconditions

- actor owns quiz organization
- quiz exists
- quiz is not archived/deleted

## Main Flow

1. Owner sends question text, type, points, and options.
2. Backend checks actor owns the quiz organization.
3. Backend validates question data.
4. Backend validates options.
5. Backend ensures exactly one correct option for SINGLE_CHOICE.
6. Backend saves question and options.
7. Backend returns question data.

## Backend Rules

- MVP supports SINGLE_CHOICE only
- points must be positive
- every question should have options
- SINGLE_CHOICE must have exactly one correct option

## Expected Result

Question and options are added to the quiz.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| No correct option | Return 400 Validation Error |
| More than one correct option | Return 400 Validation Error |
| Quiz already has attempts | Restrict editing depending on policy |
| Actor is not owner | Return 403 Forbidden |

---

# 10. Scenario 8: Publish Quiz

## Actor

Organization Owner

## Goal

Make quiz available to participants.

## Preconditions

- actor owns quiz organization
- quiz exists
- quiz has valid questions and options

## Main Flow

1. Owner requests quiz publishing.
2. Backend checks actor is quiz organization owner.
3. Backend validates quiz readiness.
4. Backend checks quiz has at least one question.
5. Backend checks every question has valid options.
6. Backend sets `isPublished = true` and status ACTIVE.
7. Backend creates audit log.
8. Backend returns published quiz.

## Backend Rules

- quiz cannot be published without questions
- every SINGLE_CHOICE question must have exactly one correct answer
- only owner can publish

## Expected Result

Quiz becomes visible to active participants.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| No questions | Return 422 Business Rule Error |
| Invalid question options | Return 422 Business Rule Error |
| Actor not owner | Return 403 Forbidden |
| Quiz archived | Return 422 Business Rule Error |

---

# 11. Scenario 9: Participant Views Published Quizzes

## Actor

Organization Participant

## Goal

View quizzes available inside organization.

## Preconditions

- participant is logged in
- participant has ACTIVE membership in organization

## Main Flow

1. Participant requests organization quizzes.
2. Backend checks active membership.
3. Backend returns published and active quizzes only.

## Backend Rules

- participants cannot see draft quizzes
- participants cannot see archived quizzes
- participants cannot see quizzes from unrelated organizations

## Expected Result

Participant sees available published quizzes.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Not a member | Return 403 Forbidden |
| Removed member | Return 403 Forbidden |
| Quiz draft | Do not include in result |
| Organization disabled | Return 403 or 404 depending on policy |

---

# 12. Scenario 10: Start Quiz Attempt

## Actor

Organization Participant

## Goal

Start a quiz attempt.

## Preconditions

- participant is logged in
- participant is ACTIVE member of quiz organization
- quiz is published and active
- max attempts not exceeded

## Main Flow

1. Participant sends start attempt request.
2. Backend checks quiz exists.
3. Backend checks quiz is published and active.
4. Backend checks participant has active membership.
5. Backend checks previous submitted attempts count.
6. Backend creates attempt with status IN_PROGRESS.
7. Backend returns attempt data.

## Backend Rules

- only active participants can start attempts
- quiz must be published
- max attempts must be enforced
- one or multiple in-progress attempts policy should be defined

Recommended MVP policy:

- reject starting a new attempt if there is already an IN_PROGRESS attempt for the same quiz and user

## Expected Result

Attempt is created and ready for submission.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Quiz not published | Return 403 or 422 |
| User not participant | Return 403 Forbidden |
| Max attempts reached | Return 422 Business Rule Error |
| Existing in-progress attempt | Return existing attempt or reject |

---

# 13. Scenario 11: Submit Quiz Attempt

## Actor

Organization Participant

## Goal

Submit answers and receive score.

## Preconditions

- attempt exists
- attempt belongs to current user
- attempt is IN_PROGRESS
- answers are valid

## Main Flow

1. Participant submits selected options.
2. Backend checks attempt ownership.
3. Backend checks attempt status is IN_PROGRESS.
4. Backend validates all question IDs belong to the quiz.
5. Backend validates selected options belong to their questions.
6. Backend calculates points awarded.
7. Backend calculates score percentage.
8. Backend determines pass/fail.
9. Backend saves answers.
10. Backend updates attempt as SUBMITTED.
11. Backend creates audit log.
12. If quiz certificate mode is AUTO and participant passed, backend issues certificate.
13. Backend returns attempt result.

## Backend Rules

- user cannot submit another user's attempt
- attempt cannot be submitted twice
- backend must calculate score, not frontend
- selected option must belong to submitted question
- submitted question must belong to attempt quiz

## Expected Result

Attempt is submitted and scored.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Attempt not owned by user | Return 403 Forbidden |
| Attempt already submitted | Return 409 Conflict |
| Option from another quiz | Return 400 Validation Error |
| Missing answer | Depends on policy: count as wrong or reject |
| Quiz archived after attempt start | Allow submission or reject depending on policy |

Recommended MVP policy for missing answers:

- unanswered questions count as zero points

---

# 14. Scenario 12: Auto Certificate Issuing

## Actor

System

## Goal

Automatically issue certificate after participant passes quiz.

## Preconditions

- quiz certificateEnabled is true
- quiz certificateIssueMode is AUTO
- attempt is submitted
- attempt passed
- participant is active member
- no active certificate exists for same user and quiz

## Main Flow

1. Participant submits quiz attempt.
2. Backend calculates result.
3. Backend checks participant passed.
4. Backend checks certificate mode is AUTO.
5. Backend checks certificate eligibility.
6. Backend generates certificate number.
7. Backend generates verification code.
8. Backend stores certificate snapshots.
9. Backend creates certificate.
10. Backend returns attempt result with certificateIssued = true.

## Backend Rules

- certificate cannot be issued for failed attempt
- duplicate active certificate is not allowed
- certificate must store snapshots
- verification code must be unique

## Expected Result

Certificate is issued automatically.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Participant failed | No certificate issued |
| Certificate mode MANUAL | No automatic issue |
| Certificate mode NONE | No certificate issued |
| Duplicate certificate exists | Do not create duplicate |
| Verification code collision | Regenerate code |

---

# 15. Scenario 13: Manual Certificate Issuing

## Actor

Organization Owner

## Goal

Issue certificate manually after reviewing a passing attempt.

## Preconditions

- owner owns quiz organization
- participant has passing submitted attempt
- quiz certificateIssueMode is MANUAL
- no duplicate active certificate exists

## Main Flow

1. Owner reviews quiz attempts.
2. Owner selects participant passing attempt.
3. Owner sends issue certificate request.
4. Backend checks owner permission.
5. Backend checks participant eligibility.
6. Backend checks attempt is submitted and passed.
7. Backend checks duplicate certificate does not exist.
8. Backend creates certificate number and verification code.
9. Backend stores snapshot fields.
10. Backend creates certificate.
11. Backend creates audit log.
12. Backend returns certificate data.

## Backend Rules

- only organization owner can manually issue
- certificate must be linked to quiz, user, organization, and attempt
- snapshots must be saved at issue time

## Expected Result

Certificate is manually issued.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Attempt failed | Return 422 Business Rule Error |
| Attempt not submitted | Return 422 Business Rule Error |
| User not active participant | Return 422 or 403 |
| Duplicate certificate | Return 409 Conflict |
| Actor not owner | Return 403 Forbidden |

---

# 16. Scenario 14: View Own Certificates

## Actor

Authenticated User

## Goal

View certificates issued to current user.

## Preconditions

- user is logged in

## Main Flow

1. User requests own certificates.
2. Backend uses current user ID.
3. Backend returns certificates where `certificate.userId = currentUser.id`.

## Backend Rules

- user can view only their own certificates
- response should include certificate status
- revoked certificates may still appear with status REVOKED

## Expected Result

User sees their certificates.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| No certificates | Return empty list |
| Certificate revoked | Show status REVOKED |
| User tries query param for another user | Ignore or reject |

---

# 17. Scenario 15: Owner Views Organization Attempts

## Actor

Organization Owner

## Goal

View attempts submitted for quizzes in owned organization.

## Preconditions

- actor owns quiz organization
- quiz exists

## Main Flow

1. Owner requests attempts for a quiz.
2. Backend checks owner permission.
3. Backend returns paginated attempts.
4. Owner can review participant results.

## Backend Rules

- only owner can view all attempts
- participant can only view own attempts
- attempts from unrelated organizations must not be exposed

## Expected Result

Owner sees quiz attempts and results.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Actor not owner | Return 403 Forbidden |
| Quiz not found | Return 404 Not Found |
| No attempts | Return empty paginated list |

---

# 18. Scenario 16: Revoke Certificate

## Actor

Organization Owner

## Goal

Revoke an issued certificate.

## Preconditions

- actor owns certificate organization
- certificate exists
- certificate is active

## Main Flow

1. Owner sends revoke certificate request with reason.
2. Backend checks owner permission.
3. Backend checks certificate exists.
4. Backend changes certificate status to REVOKED.
5. Backend stores revokedAt timestamp and revokeReason.
6. Backend creates audit log.
7. Backend returns updated certificate data.

## Backend Rules

- revoked certificate should not be deleted
- public verification should show revoked status
- only owner of certificate organization can revoke

## Expected Result

Certificate is revoked but remains historically visible.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Actor not owner | Return 403 Forbidden |
| Certificate not found | Return 404 Not Found |
| Already revoked | Return 409 or success depending on policy |
| Missing reason | Allow optional or require depending on policy |

---

# 19. Scenario 17: Public Certificate Verification

## Actor

Visitor or any user

## Goal

Verify certificate authenticity using verification code.

## Preconditions

- verification code exists

## Main Flow

1. Visitor opens verification endpoint with verification code.
2. Backend searches certificate by verification code.
3. Backend returns public certificate data.
4. If revoked, backend returns revoked status.

## Backend Rules

- endpoint must be public
- no authentication required
- response must not expose sensitive data
- revoked certificates should still be verifiable as revoked

## Expected Result

Visitor can verify if certificate is valid or revoked.

## Public Response Should Include

- certificate number
- status
- participant name snapshot
- quiz title snapshot
- organization name snapshot
- issued date
- revoked date if revoked

## Public Response Should Not Include

- user email
- password data
- internal token data
- private attempt answer details

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Invalid code | Return 404 Not Found |
| Revoked certificate | Return certificate with REVOKED status |
| Code format invalid | Return 400 Validation Error |

---

# 20. Scenario 18: Cross-Organization Access Rejection

## Actor

Authenticated user

## Goal

Ensure users cannot access data from unrelated organizations.

## Example

User is OWNER of Organization A but not a member of Organization B.

User tries to access quizzes, attempts, members, or certificates from Organization B.

## Backend Rules

- ownership in one organization does not give access to another organization
- every organization resource must check organization scope
- every quiz access should resolve its organization before authorization
- every certificate access should check certificate organization

## Expected Result

Backend rejects the request.

## Edge Cases

| Case | Backend Behavior |
|---|---|
| Owner of another organization tries access | Return 403 Forbidden |
| Participant from another organization tries access | Return 403 Forbidden |
| User guesses resource ID | Return 403 or 404 depending on security policy |

Recommended security policy:

- return 403 when resource exists but user is not allowed
- return 404 if you want to hide resource existence

---

# 21. Scenario 19: Refresh Token Rotation

## Actor

Authenticated user

## Goal

Get a new access token using refresh token.

## Preconditions

- refresh token is valid
- refresh token is not expired
- refresh token is not revoked

## Main Flow

1. User sends refresh token.
2. Backend hashes provided token.
3. Backend searches token hash in database.
4. Backend validates expiration and revocation status.
5. Backend revokes old token if rotation is enabled.
6. Backend creates new access token.
7. Backend creates new refresh token.
8. Backend stores new refresh token hash.
9. Backend returns new tokens.

## Backend Rules

- refresh tokens must be stored as hashes
- expired tokens are rejected
- revoked tokens are rejected
- token reuse after rotation should be detected if possible

## Expected Result

User receives new access and refresh tokens.

---

# 22. Scenario 20: Password Reset

## Actor

Visitor or registered user

## Goal

Reset forgotten password.

## Preconditions

- user requests reset using email
- token is valid, unused, and not expired

## Main Flow

1. User requests forgot password.
2. Backend returns generic success message.
3. If email exists, backend creates reset token hash.
4. User submits reset token and new password.
5. Backend validates token.
6. Backend updates password hash.
7. Backend marks reset token as used.
8. Backend may revoke existing refresh tokens.
9. Backend returns success.

## Backend Rules

- forgot password response must not reveal if email exists
- reset token must be stored as hash
- reset token must be single-use
- after password reset, refresh tokens should be revoked

## Expected Result

Password is changed securely.

---

# 23. Scenario 21: Email Verification

## Actor

Registered user

## Goal

Verify user email address.

## Preconditions

- verification token exists
- token is valid, unused, and not expired

## Main Flow

1. User submits verification token.
2. Backend hashes token and finds stored token.
3. Backend validates token status and expiration.
4. Backend sets user emailVerified to true.
5. Backend marks token as used.
6. Backend returns success.

## Backend Rules

- verification token must be stored as hash
- token must not be reusable
- already verified email should return suitable response

## Expected Result

User email becomes verified.

---

# 24. Scenario 22: Audit Sensitive Action

## Actor

System

## Goal

Record important business and security actions.

## Trigger Actions

Audit logs should be created for:

- organization creation
- organization update
- organization deletion or disabling
- member added
- member removed
- quiz created
- quiz updated
- quiz published
- quiz archived
- attempt submitted
- certificate issued
- certificate revoked
- login failures
- password reset completion

## Backend Rules

- audit logs must not store plaintext passwords
- audit logs must not store raw tokens
- metadata should be useful but safe

## Expected Result

Important actions are traceable.

---

# 25. University MVP End-to-End Scenario

## Scenario Name

Git & GitHub Workshop Certification

## Actors

- Club Leader: Organization Owner
- Students: Organization Participants
- Public Visitor: Certificate verifier

## Main Flow

1. Club leader registers and logs in.
2. Club leader creates organization: Computer Science Club.
3. Backend creates OWNER membership for club leader.
4. Students register accounts.
5. Club leader adds students as PARTICIPANT members.
6. Club leader creates quiz: Git & GitHub Workshop Quiz.
7. Club leader adds single-choice questions and options.
8. Club leader publishes quiz.
9. Students view published quiz.
10. Students start attempts.
11. Students submit answers.
12. Backend calculates scores.
13. Students who pass receive certificates automatically.
14. Students can view their certificates.
15. Anyone can verify certificate using verification code.

## Expected Result

The student club can run a complete workshop assessment and certificate workflow.

---

# 26. Business Rules Summary

## User Rules

- user does not have global business role
- user can create organizations
- user permissions depend on organization membership

## Organization Rules

- creator becomes owner
- only owner can manage organization
- users see only accessible organizations

## Membership Rules

- membership controls role inside organization
- duplicate active membership is not allowed
- removed members lose access

## Quiz Rules

- quiz belongs to organization
- only owner can create/manage quiz
- participant can see published quizzes only
- quiz must be valid before publishing

## Attempt Rules

- participant must be active member
- quiz must be published
- max attempts must be enforced
- backend calculates score
- attempt cannot be submitted twice

## Certificate Rules

- certificate requires passing submitted attempt
- certificate can be AUTO or MANUAL
- duplicate active certificate is not allowed
- certificate stores snapshots
- public verification must be safe
- revoked certificates remain verifiable as revoked

---

# 27. Recommended MVP Priority

Implement in this order:

1. Authentication
2. User profile
3. Organization creation
4. Membership management
5. Quiz creation
6. Question and option creation
7. Quiz publishing
8. Attempt start and submit
9. Auto scoring
10. Certificate issuing
11. Public certificate verification
12. Audit logging

---

# 28. Final Business Scenario Statement

Skillmark backend should support a complete flow where an organization owner can create an organization, add participants, publish quizzes, receive student attempts, calculate scores, and issue verifiable certificates.

The most important business rule is that permissions are always based on organization membership.

A user can be an owner in one organization and a participant in another organization at the same time.
