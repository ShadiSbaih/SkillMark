
# Backend Scenarios, Success Criteria, and Out-of-Boundary Scope

## Project

Cohive Backend  
Spring Boot + PostgreSQL

---

## Purpose

This document defines the backend business scenarios, success criteria, negative cases, and explicit out-of-boundary scope for the Cohive platform.

It is intended to support:

- backend implementation
- API testing
- integration testing
- QA test case creation
- scope control
- authorization validation
- multi-tenant isolation validation

---

# 1. System Overview

Cohive is an API-only modular backend for managing multi-organization training and course operations.

The backend manages:

- users
- organizations
- organization memberships
- courses
- course enrollments
- resources
- quizzes
- quiz attempts
- certificates
- authentication tokens
- account verification flows
- password reset flows

The backend exposes REST APIs and enforces:

- authentication
- organization-scoped authorization
- validation
- data integrity
- multi-tenant isolation
- predictable API responses

Frontend implementation is out of scope for the current phase.

---

# 2. Core Product Model

## 2.1 User

A User is an identity/account in the system.

A User is not globally an OWNER or STUDENT.

A single User can:

- own one or more organizations
- be a STUDENT/member in one or more other organizations
- be OWNER in one organization and STUDENT in another organization at the same time

Business permissions must not depend on a global `users.role`.

---

## 2.2 Organization

An Organization represents a training center, university unit, company, internship program, or educational group.

Each organization has an owner.

The creator of an organization becomes its owner.

Ownership is represented by:

- `organizations.owner_id`
- an `organization_memberships` row with `role = OWNER`

---

## 2.3 Organization Membership

OrganizationMembership defines a user's role inside a specific organization.

Supported roles for the current phase:

- OWNER
- STUDENT

A User may have different roles in different organizations.

Examples:

- User A is OWNER in Organization 1.
- User A is STUDENT in Organization 2.
- User B is STUDENT in Organization 1.
- User C is OWNER in Organization 2.

---

## 2.4 Course

A Course belongs to one Organization.

Only the owner of the course organization can manage the course.

Students can access a course only if they are enrolled in it.

---

## 2.5 Course Enrollment

CourseEnrollment connects a User to a Course.

A user can only be enrolled in a course if they are an ACTIVE STUDENT member of the course organization.

Enrollment uses `user_id`, not `student_id`.

---

## 2.6 Resource

A Resource belongs to a Course.

Supported resource types:

- LINK
- FILE

A LINK resource stores an external URL.

A FILE resource stores file metadata and a file URL.

Only the organization owner can manage resources.

Enrolled students can view resources for their enrolled courses.

---

## 2.7 Quiz

A Quiz belongs to a Course.

A Quiz may contain:

- questions
- options
- attempts
- answers
- scoring
- pass/fail status

Only the organization owner can manage quizzes.

Enrolled students can view and attempt published quizzes for their enrolled courses.

---

## 2.8 Certificate

A Certificate is issued to a User for completing or participating in a Course.

Certificates reference:

- organization
- course
- user

Certificates must not depend on a separate Student table.

Certificates should be verifiable using a public verification code.

Certificates store snapshot fields to preserve historical data.

---

# 3. Actors

## 3.1 Unauthenticated Visitor

A user who has not logged in.

Allowed actions:

- register
- log in
- request password reset
- verify public certificate by verification code

Not allowed:

- create organizations
- view protected course data
- access protected organization data
- create resources
- take quizzes
- issue certificates

---

## 3.2 Authenticated User

A logged-in account.

An authenticated user can:

- view their own profile
- create organizations
- become owner of created organizations
- be added as a student/member to organizations
- access protected features according to organization-level permissions

---

## 3.3 Organization Owner

A User who has OWNER role in a specific organization.

The Organization Owner can manage only their own organization data.

Responsibilities:

- manage organization details
- manage organization members
- create and manage courses
- enroll organization students in courses
- create and manage resources
- create and manage quizzes
- view quiz attempts for their organization courses
- issue and revoke certificates

---

## 3.4 Organization Student

A User who has STUDENT role in a specific organization.

The Organization Student can:

- view organizations where they are a member
- view courses they are enrolled in
- view resources for enrolled courses
- view and attempt published quizzes for enrolled courses
- view their own certificates

A student in one organization may still be an owner in another organization.

---

## 3.5 System

The backend system is responsible for:

- enforcing business rules
- storing data
- validating permissions
- returning standardized API responses
- protecting organization boundaries
- preventing cross-tenant data leakage

---

# 4. Global Business Rules

1. Every protected endpoint requires authentication.
2. Public endpoints are limited to authentication, password recovery, email verification, health checks, API documentation if enabled, and public certificate verification.
3. A User is an identity/account and does not hold a global business role.
4. Organization-level roles are stored in `organization_memberships`.
5. A User can own multiple organizations.
6. A User can be STUDENT in multiple organizations.
7. A User can be OWNER in one organization and STUDENT in another.
8. The creator of an organization automatically becomes its OWNER.
9. Organization owners can manage only organizations they own.
10. Organization students can access only data they are authorized to access.
11. A Course belongs to exactly one Organization.
12. A Resource belongs to exactly one Course.
13. A Quiz belongs to exactly one Course.
14. A Certificate belongs to one Organization, one Course, and one User.
15. A User must be an ACTIVE STUDENT member of the course organization before they can be enrolled in that course.
16. A User must be enrolled in a Course before accessing course resources or attempting course quizzes.
17. Certificates can only be issued for users enrolled in the related course.
18. Duplicate active enrollments should be prevented.
19. Duplicate active certificates for the same user and course should be prevented.
20. No user may access data from organizations where they have no valid permission.
21. Backend must return consistent success and error responses.
22. Frontend is out of scope for the current phase.

---

# 5. Authentication Scenarios

---

## Scenario A1: Register a New User

### Actor

Unauthenticated Visitor

### Goal

Create a new user account.

### Preconditions

- Email is not already registered.
- Request body is valid.
- Password meets minimum security policy.

### Main Flow

1. Visitor sends registration request.
2. Backend validates name, email, and password.
3. Backend checks whether email already exists.
4. Backend hashes the password.
5. Backend creates a new user record.
6. Backend sets `email_verified = false`.
7. Backend returns success response.
8. Backend may generate email verification token if email verification is enabled.

### Request Rules

Registration request must not include a role.

Valid request example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
````

Invalid request example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "OWNER"
}
```

### Success Criteria

* A new user row is created.
* Password is stored only as a hash.
* No global OWNER/STUDENT role is assigned.
* API returns a success response.
* Password is never exposed.
* Duplicate emails are rejected.

### Out of Boundary

* Social login
* OAuth login
* Multi-factor authentication

### Test Ideas

* Register with valid data.
* Register with duplicate email.
* Register with missing name.
* Register with invalid email.
* Register with weak password.
* Register with role field and verify it is ignored or rejected.

---

## Scenario A2: Login with Valid Credentials

### Actor

Registered User

### Goal

Obtain authentication tokens for protected APIs.

### Preconditions

* User exists.
* Password is correct.
* User status allows login.

### Main Flow

1. User sends login request.
2. Backend validates email and password.
3. Backend authenticates credentials.
4. Backend generates access token.
5. Backend generates refresh token if refresh tokens are enabled.
6. Backend returns authentication response.

### Success Criteria

* Correct token is generated.
* Token can access protected endpoints.
* Invalid credentials are rejected.
* Password hash is never returned.
* Login failures do not reveal whether email or password was wrong.

### Out of Boundary

* Browser session management
* External identity providers
* OAuth login

### Test Ideas

* Login with correct credentials.
* Login with wrong password.
* Login with unknown email.
* Login with disabled account.
* Login with malformed request.

---

## Scenario A3: Refresh Access Token

### Actor

Authenticated User with valid refresh token

### Goal

Obtain a new access token without logging in again.

### Preconditions

* Refresh token exists.
* Refresh token is not expired.
* Refresh token is not revoked.
* User account is active.

### Main Flow

1. User sends refresh token.
2. Backend hashes or validates the token.
3. Backend checks token expiration and revocation status.
4. Backend issues a new access token.
5. Backend rotates refresh token if refresh token rotation is implemented.
6. Backend returns new token payload.

### Success Criteria

* New access token is returned.
* Expired refresh token is rejected.
* Revoked refresh token is rejected.
* Reused rotated token is rejected if rotation is implemented.

### Out of Boundary

* Device management UI
* Manual session management dashboard

### Test Ideas

* Refresh with valid token.
* Refresh with expired token.
* Refresh with revoked token.
* Refresh with malformed token.
* Refresh after logout.

---

## Scenario A4: Logout

### Actor

Authenticated User

### Goal

Invalidate current refresh token/session.

### Preconditions

* User is authenticated.
* Refresh token exists if refresh tokens are enabled.

### Main Flow

1. User sends logout request.
2. Backend identifies refresh token or current session.
3. Backend revokes the refresh token.
4. Backend returns success response.

### Success Criteria

* Refresh token can no longer be used.
* Access token naturally expires.
* Logout response is consistent.

### Out of Boundary

* Frontend token deletion
* Browser cookie clearing unless cookies are used

### Test Ideas

* Logout with valid refresh token.
* Try refresh after logout.
* Logout twice.
* Logout without token.

---

## Scenario A5: Forgot Password

### Actor

Unauthenticated Visitor

### Goal

Request a password reset flow.

### Preconditions

* Email may or may not exist.
* Request body is valid.

### Main Flow

1. Visitor submits email.
2. Backend validates request.
3. Backend returns generic success response.
4. If email exists, backend creates password reset token.
5. Backend stores token hash.
6. Backend sends or logs reset delivery depending on environment.

### Success Criteria

* Response does not reveal whether email exists.
* Token is stored hashed.
* Token has expiration.
* Existing unused tokens may be invalidated depending on policy.

### Out of Boundary

* Email provider integration if not implemented
* Frontend reset page

### Test Ideas

* Request reset for existing email.
* Request reset for unknown email.
* Request reset with invalid email.
* Ensure raw token is not stored.

---

## Scenario A6: Reset Password

### Actor

Unauthenticated Visitor with reset token

### Goal

Set a new password.

### Preconditions

* Reset token exists.
* Token is not expired.
* Token is not used.
* New password meets policy.

### Main Flow

1. Visitor submits token and new password.
2. Backend hashes submitted token.
3. Backend finds matching valid token.
4. Backend updates user password hash.
5. Backend marks token as used.
6. Backend may revoke existing refresh tokens.
7. Backend returns success response.

### Success Criteria

* Password changes successfully.
* Token cannot be reused.
* Expired token is rejected.
* Old password no longer works.
* New password works.

### Out of Boundary

* Frontend reset password form
* Passwordless login

### Test Ideas

* Reset with valid token.
* Reset with expired token.
* Reset with used token.
* Reset with weak password.
* Login with new password.

---

## Scenario A7: Verify Email

### Actor

Registered User or Visitor with verification token

### Goal

Verify user's email address.

### Preconditions

* Verification token exists.
* Token is not expired.
* Token is not used.

### Main Flow

1. User submits verification token.
2. Backend hashes submitted token.
3. Backend finds valid verification token.
4. Backend marks user as email verified.
5. Backend marks token as used.
6. Backend returns success response.

### Success Criteria

* User email becomes verified.
* Token cannot be reused.
* Expired token is rejected.

### Out of Boundary

* Email template design
* Frontend verification page

### Test Ideas

* Verify with valid token.
* Verify with expired token.
* Verify with used token.
* Resend verification token.
* Verify already verified email.

---

# 6. User Profile Scenarios

---

## Scenario U1: Get Current User

### Actor

Authenticated User

### Goal

View current account profile.

### Preconditions

* User is authenticated.
* User exists.
* User status is active.

### Main Flow

1. User requests current profile.
2. Backend reads authenticated user ID.
3. Backend fetches user.
4. Backend returns safe user profile fields.

### Success Criteria

* Response includes user ID, name, email, status, and email verification state.
* Password hash is not returned.
* Organization permissions are not confused with global role.

### Out of Boundary

* Profile picture upload
* Full account settings UI

### Test Ideas

* Get current user with valid token.
* Get current user without token.
* Ensure password hash is not exposed.

---

# 7. Organization Scenarios

---

## Scenario O1: Create Organization

### Actor

Authenticated User

### Goal

Create a new organization and become its owner.

### Preconditions

* User is authenticated.
* User account is active.
* Request body is valid.

### Main Flow

1. User submits organization creation request.
2. Backend validates organization name.
3. Backend creates organization with `owner_id = currentUserId`.
4. Backend creates organization membership:

   * organization_id = created organization
   * user_id = current user
   * role = OWNER
   * status = ACTIVE
5. Backend returns organization details.

### Success Criteria

* Organization is created.
* Current user becomes owner.
* OWNER membership row is created.
* Organization is only manageable by its owner.
* User can create multiple organizations.

### Out of Boundary

* Organization branding
* Organization subscription billing
* Multiple owners unless explicitly implemented
* Ownership transfer unless explicitly implemented

### Test Ideas

* Create organization with valid name.
* Create organization with empty name.
* Verify owner_id is current user.
* Verify OWNER membership exists.
* Same user creates multiple organizations.

---

## Scenario O2: View Accessible Organizations

### Actor

Authenticated User

### Goal

See organizations the user owns or belongs to.

### Preconditions

* User is authenticated.

### Main Flow

1. User requests organization list.
2. Backend fetches organizations where:

   * user is owner, or
   * user has ACTIVE organization membership
3. Backend returns paginated organization list.

### Success Criteria

* User sees owned organizations.
* User sees organizations where they are STUDENT.
* User does not see unrelated organizations.
* No cross-tenant leakage occurs.

### Out of Boundary

* Admin global organization search
* Public organization directory

### Test Ideas

* User owns one organization.
* User belongs to another organization as STUDENT.
* User sees both.
* User does not see unrelated organization.

---

## Scenario O3: Get Organization Details

### Actor

Organization Owner or Organization Member

### Goal

View one organization.

### Preconditions

* User is authenticated.
* Organization exists.
* User has access to the organization.

### Main Flow

1. User requests organization by ID.
2. Backend checks whether user is owner or active member.
3. Backend returns organization details.

### Success Criteria

* Authorized user can view organization.
* Unauthorized user is rejected.
* Deleted organization is not returned as active.

### Out of Boundary

* Public organization profiles
* Admin-level access

### Test Ideas

* Owner views organization.
* Student member views organization.
* Unrelated user attempts access.
* Non-existent organization ID.

---

## Scenario O4: Delete or Disable Organization

### Actor

Organization Owner

### Goal

Remove or disable an organization.

### Preconditions

* User is authenticated.
* Organization exists.
* User is the organization owner.

### Main Flow

1. Owner requests organization deletion.
2. Backend verifies ownership.
3. Backend soft-deletes or disables organization.
4. Backend prevents further active operations under organization.
5. Backend returns success response.

### Success Criteria

* Only owner can delete/disable.
* Organization is not hard-deleted if historical data exists.
* Courses and certificates remain consistent.

### Out of Boundary

* Permanent hard delete of historical data
* Organization restore unless implemented
* Ownership transfer unless implemented

### Test Ideas

* Owner disables organization.
* Non-owner attempts delete.
* Student attempts delete.
* Access disabled organization data.

---

# 8. Organization Membership Scenarios

---

## Scenario M1: Add Member to Organization

### Actor

Organization Owner

### Goal

Add a User as a STUDENT member of an organization.

### Preconditions

* Owner is authenticated.
* Organization exists.
* Owner owns the organization.
* Target user exists.
* Target user is not already an active member.

### Main Flow

1. Owner submits add member request.
2. Backend validates organization ownership.
3. Backend validates target user exists.
4. Backend checks duplicate membership.
5. Backend creates membership with role STUDENT.
6. Backend returns success response.

### Request Example

```json
{
  "userId": "uuid",
  "role": "STUDENT"
}
```

### Success Criteria

* Membership is created.
* Duplicate membership is prevented.
* Only organization owner can add members.
* Target user can now be enrolled in courses under that organization.

### Out of Boundary

* Invite emails
* Bulk import
* Multiple owners unless explicitly implemented

### Test Ideas

* Owner adds valid user.
* Owner adds same user twice.
* Non-owner attempts to add user.
* Add unknown user.
* Add user to unrelated organization.

---

## Scenario M2: List Organization Members

### Actor

Organization Owner

### Goal

View users who belong to an organization.

### Preconditions

* User is authenticated.
* Organization exists.
* User owns the organization.

### Main Flow

1. Owner requests organization members.
2. Backend verifies ownership.
3. Backend returns paginated member list.

### Success Criteria

* Only owner can list members.
* Member records include user info and membership role/status.
* Unrelated users are not returned.

### Out of Boundary

* Public member directory
* Student viewing all members unless explicitly allowed

### Test Ideas

* Owner lists members.
* Student attempts to list members.
* Non-member attempts to list members.

---

## Scenario M3: Remove or Disable Organization Member

### Actor

Organization Owner

### Goal

Remove or disable a member from an organization.

### Preconditions

* Owner is authenticated.
* Organization exists.
* Target member exists.
* Target member is not the only owner unless ownership transfer exists.

### Main Flow

1. Owner requests member removal.
2. Backend verifies organization ownership.
3. Backend verifies target membership exists.
4. Backend marks membership as REMOVED or DISABLED.
5. Backend handles active enrollments according to policy.
6. Backend returns success response.

### Success Criteria

* Member is no longer active in organization.
* Removed member can no longer access organization data.
* Historical certificates remain intact.

### Out of Boundary

* Permanent deletion of historical membership
* Ownership transfer unless implemented

### Test Ideas

* Owner removes student.
* Student attempts to remove member.
* Remove non-existing member.
* Removed member tries to access course resources.

---

# 9. Course Scenarios

---

## Scenario C1: Create Course

### Actor

Organization Owner

### Goal

Create a course under an owned organization.

### Preconditions

* User is authenticated.
* Organization exists.
* User owns the organization.
* Request body is valid.

### Main Flow

1. Owner submits course creation request.
2. Backend validates title and organization ID.
3. Backend verifies current user is organization owner.
4. Backend creates course.
5. Backend returns course details.

### Success Criteria

* Course is created.
* Course belongs to the correct organization.
* Only organization owner can create course.
* Course is not accessible to unrelated users.

### Out of Boundary

* Course marketplace
* Public course catalog
* Course payments

### Test Ideas

* Owner creates valid course.
* Student tries to create course.
* Owner tries to create course under another organization.
* Missing title is rejected.

---

## Scenario C2: View Courses

### Actor

Organization Owner or Enrolled Student

### Goal

Retrieve courses visible to the current user.

### Preconditions

* User is authenticated.

### Main Flow

1. User requests course list.
2. Backend determines accessible courses:

   * owner sees courses in owned organizations
   * student sees courses where they are enrolled
3. Backend applies filters such as organizationId if provided.
4. Backend returns paginated results.

### Success Criteria

* Owner sees owned organization courses.
* Student sees only enrolled courses.
* No cross-organization leakage occurs.
* Pagination is supported.

### Out of Boundary

* Global course discovery
* Public course directory

### Test Ideas

* Owner lists courses.
* Student lists enrolled courses.
* Student does not see non-enrolled courses.
* Filter by organization ID.

---

## Scenario C3: View Course Details

### Actor

Organization Owner or Enrolled Student

### Goal

View details of one course.

### Preconditions

* Course exists.
* User has permission.

### Main Flow

1. User requests course by ID.
2. Backend checks:

   * user owns the course organization, or
   * user is enrolled in the course
3. Backend returns course details.

### Success Criteria

* Authorized user receives course.
* Unauthorized user is rejected.
* Deleted or archived courses follow status policy.

### Out of Boundary

* Course preview without enrollment unless implemented

### Test Ideas

* Owner views course.
* Enrolled student views course.
* Non-enrolled student attempts access.
* User from another organization attempts access.

---

## Scenario C4: Update Course

### Actor

Organization Owner

### Goal

Update course details.

### Preconditions

* User is authenticated.
* Course exists.
* User owns the course organization.
* Request body is valid.

### Main Flow

1. Owner submits update request.
2. Backend verifies course ownership.
3. Backend updates allowed fields.
4. Backend returns updated course.

### Success Criteria

* Only owner can update.
* Course remains linked to same organization unless explicitly allowed.
* Updated data is returned.

### Out of Boundary

* Student course editing
* Moving courses between organizations unless implemented

### Test Ideas

* Owner updates course.
* Student attempts update.
* Other owner attempts update.
* Invalid request rejected.

---

## Scenario C5: Delete or Archive Course

### Actor

Organization Owner

### Goal

Remove or archive a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns the course organization.

### Main Flow

1. Owner requests course deletion.
2. Backend verifies ownership.
3. Backend soft-deletes or archives course.
4. Backend preserves historical enrollments and certificates.
5. Backend returns success response.

### Success Criteria

* Only owner can delete/archive.
* Historical certificates remain valid.
* Enrolled users lose or retain access according to status policy.

### Out of Boundary

* Permanent deletion of historical course data

### Test Ideas

* Owner archives course.
* Student attempts delete.
* Other owner attempts delete.
* Certificate remains verifiable after course archive.

---

# 10. Enrollment Scenarios

---

## Scenario E1: Enroll User in Course

### Actor

Organization Owner

### Goal

Enroll an organization student in a course.

### Preconditions

* Owner is authenticated.
* Course exists.
* Owner owns the course organization.
* Target user exists.
* Target user is an ACTIVE STUDENT member of the course organization.
* Enrollment does not already exist.

### Main Flow

1. Owner submits enrollment request with userId and courseId.
2. Backend validates course exists.
3. Backend verifies owner owns the course organization.
4. Backend validates target user exists.
5. Backend verifies target user is ACTIVE STUDENT member of the organization.
6. Backend checks duplicate enrollment.
7. Backend creates course enrollment.
8. Backend returns enrollment details.

### Request Example

```json
{
  "userId": "uuid",
  "courseId": "uuid"
}
```

### Success Criteria

* Enrollment is created.
* Duplicate enrollment is prevented.
* Only organization owner can enroll users.
* User must be organization STUDENT before enrollment.

### Out of Boundary

* Student self-enrollment unless explicitly implemented
* Cross-organization enrollment
* Payment-based enrollment

### Test Ideas

* Owner enrolls valid organization student.
* Owner enrolls user who is not organization member.
* Owner enrolls OWNER as student if policy forbids it.
* Duplicate enrollment rejected.
* Non-owner attempts enrollment.

---

## Scenario E2: View Course Enrollments

### Actor

Organization Owner

### Goal

View users enrolled in a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns the course organization.

### Main Flow

1. Owner requests course enrollments.
2. Backend verifies course ownership.
3. Backend returns paginated enrollment list.

### Success Criteria

* Only owner can view course enrollment list.
* Enrollments belong only to selected course.
* User information is safely returned.

### Out of Boundary

* Students viewing all course participants unless implemented

### Test Ideas

* Owner views course enrollments.
* Student attempts to view course enrollments.
* Other owner attempts access.

---

## Scenario E3: View Current User Enrollments

### Actor

Authenticated User

### Goal

View courses the current user is enrolled in.

### Preconditions

* User is authenticated.

### Main Flow

1. User requests own enrollments.
2. Backend reads current user ID.
3. Backend fetches enrollments by user ID.
4. Backend returns enrollment list.

### Success Criteria

* User sees only own enrollments.
* No other user's enrollment data is exposed.

### Out of Boundary

* Viewing another user's enrollments unless owner has permission

### Test Ideas

* User views own enrollments.
* User attempts to view another user's enrollments.
* Owner views enrollments of member within owned organization.

---

# 11. Resource Scenarios

---

## Scenario R1: Create LINK Resource

### Actor

Organization Owner

### Goal

Add a link-based learning resource to a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns the course organization.
* Resource type is LINK.
* URL is present.

### Main Flow

1. Owner submits LINK resource request.
2. Backend validates title, courseId, type, and URL.
3. Backend verifies course ownership.
4. Backend creates resource.
5. Backend returns resource details.

### Success Criteria

* Resource is created.
* Type is LINK.
* URL is stored.
* File fields are empty or ignored.
* Only owner can create resource.

### Request Example

```json
{
  "title": "Spring Documentation",
  "description": "Official Spring documentation",
  "type": "LINK",
  "url": "https://spring.io",
  "courseId": "uuid"
}
```

### Out of Boundary

* URL preview scraping
* Link health checking

### Test Ideas

* Create valid LINK resource.
* LINK resource without URL is rejected.
* Student attempts resource creation.
* Owner creates resource in another organization course.

---

## Scenario R2: Create FILE Resource

### Actor

Organization Owner

### Goal

Add a file-based learning resource to a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns the course organization.
* Resource type is FILE.
* File metadata or upload result exists.

### Main Flow

1. Owner uploads or references a file through backend API.
2. Backend validates file metadata.
3. Backend verifies course ownership.
4. Backend stores file metadata:

   * fileUrl
   * originalFileName
   * contentType
   * sizeBytes
5. Backend creates resource.
6. Backend returns resource details.

### Success Criteria

* Resource is created.
* Type is FILE.
* fileUrl is stored.
* File metadata is stored.
* URL field for LINK is not required.
* Only owner can create file resource.

### Request Example

```json
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
```

### Out of Boundary

* Advanced file processing
* Video streaming
* File preview generation
* Virus scanning unless explicitly implemented

### Test Ideas

* Create valid FILE resource.
* FILE resource without fileUrl is rejected.
* Invalid file metadata rejected.
* Student attempts file resource creation.

---

## Scenario R3: View Course Resources

### Actor

Organization Owner or Enrolled Student

### Goal

View resources for a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns course organization or is enrolled in course.

### Main Flow

1. User requests resources for course.
2. Backend verifies access:

   * owner of organization, or
   * enrolled student
3. Backend returns resource list.

### Success Criteria

* Owner can view course resources.
* Enrolled student can view course resources.
* Non-enrolled user cannot view resources.
* Resources from other courses are not returned.

### Out of Boundary

* Public resource access
* Resource download authorization tokens unless implemented

### Test Ideas

* Owner views resources.
* Enrolled student views resources.
* Non-enrolled student attempts access.
* User from another organization attempts access.

---

# 12. Quiz Scenarios

---

## Scenario Q1: Create Quiz

### Actor

Organization Owner

### Goal

Create a quiz under a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns the course organization.
* Request body is valid.

### Main Flow

1. Owner submits quiz creation request.
2. Backend validates title, courseId, passingScore, and publish status.
3. Backend verifies course ownership.
4. Backend creates quiz.
5. Backend returns quiz details.

### Success Criteria

* Quiz is created.
* Quiz belongs to correct course.
* Only organization owner can create quiz.
* passingScore is between 0 and 100.

### Out of Boundary

* Question bank system
* Randomized quiz generation

### Test Ideas

* Owner creates quiz.
* Student attempts create quiz.
* Invalid passing score rejected.
* Create quiz in another owner's course rejected.

---

## Scenario Q2: Add Quiz Question and Options

### Actor

Organization Owner

### Goal

Add questions and answer options to a quiz.

### Preconditions

* User is authenticated.
* Quiz exists.
* User owns the quiz course organization.
* Question body is valid.
* For SINGLE_CHOICE, valid options are provided.

### Main Flow

1. Owner submits question with options.
2. Backend validates question text, points, type, and options.
3. Backend verifies quiz ownership.
4. Backend stores question.
5. Backend stores options.
6. Backend returns question details.

### Success Criteria

* Question is created.
* Options are created.
* SINGLE_CHOICE question has at least two options.
* SINGLE_CHOICE question has exactly one correct option.
* Only owner can add questions.

### Out of Boundary

* Multiple choice questions unless implemented
* Text answers unless implemented
* Question banks

### Test Ideas

* Add valid single-choice question.
* Add question with no correct option.
* Add question with multiple correct options.
* Student attempts add question.

---

## Scenario Q3: Publish Quiz

### Actor

Organization Owner

### Goal

Make quiz available to enrolled students.

### Preconditions

* User is authenticated.
* Quiz exists.
* User owns quiz course organization.
* Quiz has valid questions and options.

### Main Flow

1. Owner requests quiz publish.
2. Backend validates quiz completeness.
3. Backend sets `is_published = true`.
4. Backend returns updated quiz.

### Success Criteria

* Quiz becomes visible to enrolled students.
* Incomplete quiz cannot be published.
* Only owner can publish.

### Out of Boundary

* Scheduled publishing unless implemented

### Test Ideas

* Publish complete quiz.
* Publish quiz with no questions.
* Student attempts publish.

---

## Scenario Q4: View Course Quizzes

### Actor

Organization Owner or Enrolled Student

### Goal

View quizzes for a course.

### Preconditions

* User is authenticated.
* Course exists.
* User owns course organization or is enrolled.

### Main Flow

1. User requests quizzes by course ID.
2. Backend checks access.
3. Backend returns quizzes.
4. For students, backend returns only published quizzes.

### Success Criteria

* Owner sees course quizzes.
* Enrolled student sees published course quizzes.
* Students do not see unpublished quizzes.
* Non-enrolled users are rejected.

### Out of Boundary

* Public quiz preview

### Test Ideas

* Owner views all quizzes.
* Student views published quizzes.
* Student cannot view unpublished quiz.
* Non-enrolled user attempts access.

---

## Scenario Q5: Start Quiz Attempt

### Actor

Enrolled Student

### Goal

Start a quiz attempt.

### Preconditions

* User is authenticated.
* Quiz exists.
* Quiz is published.
* User is enrolled in the quiz course.

### Main Flow

1. Student requests to start quiz attempt.
2. Backend verifies quiz is published.
3. Backend verifies user is enrolled in course.
4. Backend creates quiz attempt with status IN_PROGRESS.
5. Backend returns attempt details and questions.

### Success Criteria

* Attempt is created.
* Attempt belongs to current user.
* Non-enrolled users cannot start attempts.
* Unpublished quiz cannot be attempted.

### Out of Boundary

* Time limits unless implemented
* Proctoring
* Attempt limit unless implemented

### Test Ideas

* Enrolled student starts attempt.
* Non-enrolled student attempts quiz.
* Attempt unpublished quiz.
* Owner attempts as non-student according to policy.

---

## Scenario Q6: Submit Quiz Attempt

### Actor

Enrolled Student

### Goal

Submit quiz answers and receive score.

### Preconditions

* User is authenticated.
* Attempt exists.
* Attempt belongs to current user.
* Attempt status is IN_PROGRESS.
* Submitted answers are valid.

### Main Flow

1. Student submits answers.
2. Backend validates attempt ownership.
3. Backend validates selected options belong to quiz questions.
4. Backend calculates points awarded.
5. Backend calculates score percentage.
6. Backend determines pass/fail based on passingScore.
7. Backend marks attempt SUBMITTED.
8. Backend stores answers.
9. Backend returns result.

### Success Criteria

* Attempt is submitted once.
* Score is calculated correctly.
* Pass/fail is stored.
* Attempt cannot be submitted twice.
* Student cannot submit another user's attempt.

### Out of Boundary

* Manual grading
* Open-ended answers
* Partial credit beyond defined rules

### Test Ideas

* Submit valid answers.
* Submit missing answer.
* Submit option from another quiz.
* Submit attempt twice.
* Submit another user's attempt.

---

## Scenario Q7: View Quiz Attempts

### Actor

Student or Organization Owner

### Goal

View quiz attempt results.

### Preconditions

* User is authenticated.
* Attempt exists.
* User has access.

### Main Flow

1. User requests attempt details.
2. Backend checks:

   * student can view own attempts
   * owner can view attempts for quizzes in owned organization
3. Backend returns attempt result.

### Success Criteria

* Student sees own result.
* Owner sees attempts for owned organization courses.
* Unauthorized attempts are blocked.

### Out of Boundary

* Public leaderboards
* Analytics dashboards

### Test Ideas

* Student views own attempt.
* Student views another user's attempt.
* Owner views attempts in owned organization.
* Other owner attempts access.

---

# 13. Certificate Scenarios

---

## Scenario T1: Issue Certificate

### Actor

Organization Owner

### Goal

Issue certificate to a user for a course.

### Preconditions

* User is authenticated.
* Course exists.
* Owner owns the course organization.
* Target user exists.
* Target user is a STUDENT member of the organization.
* Target user is enrolled in the course.
* Certificate does not already exist as ACTIVE for same course and user.
* If quiz completion is required, target user has passed required quiz.

### Main Flow

1. Owner submits certificate issue request.
2. Backend validates course exists.
3. Backend verifies organization ownership.
4. Backend validates target user exists.
5. Backend verifies target user is organization STUDENT.
6. Backend verifies target user is enrolled in course.
7. Backend checks duplicate active certificate.
8. Backend checks quiz passing rule if applicable.
9. Backend generates certificate number.
10. Backend generates verification code.
11. Backend stores certificate snapshots:

    * studentNameSnapshot
    * courseTitleSnapshot
    * organizationNameSnapshot
12. Backend creates certificate.
13. Backend returns certificate details.

### Request Example

```json
{
  "userId": "uuid",
  "courseId": "uuid",
  "title": "Certificate of Completion"
}
```

### Success Criteria

* Certificate is issued.
* Certificate references user, course, and organization.
* Certificate has unique certificate number.
* Certificate has unique verification code.
* Duplicate active certificate is prevented.
* Historical snapshot fields are stored.

### Out of Boundary

* PDF rendering unless implemented
* Automatic certificate issuing unless implemented

### Test Ideas

* Issue certificate for enrolled user.
* Issue certificate for non-enrolled user.
* Issue duplicate certificate.
* Issue certificate for user outside organization.
* Issue certificate when required quiz is not passed.

---

## Scenario T2: View Current User Certificates

### Actor

Authenticated User

### Goal

View own certificates.

### Preconditions

* User is authenticated.

### Main Flow

1. User requests own certificates.
2. Backend fetches certificates by current user ID.
3. Backend returns certificates.

### Success Criteria

* User sees only own certificates.
* Revoked certificates are handled according to API policy.
* Certificate metadata is returned safely.

### Out of Boundary

* Certificate PDF download unless implemented

### Test Ideas

* User views own certificates.
* User does not see another user's certificates.
* User views revoked certificate if policy allows.

---

## Scenario T3: View Organization Certificates

### Actor

Organization Owner

### Goal

View certificates issued within owned organization.

### Preconditions

* User is authenticated.
* Organization exists.
* User owns organization.

### Main Flow

1. Owner requests organization certificates.
2. Backend verifies ownership.
3. Backend returns paginated certificates.

### Success Criteria

* Owner sees certificates only for owned organization.
* Other owners cannot see certificates.
* Students cannot view all organization certificates.

### Out of Boundary

* Global certificate admin search

### Test Ideas

* Owner views organization certificates.
* Student attempts access.
* Other owner attempts access.

---

## Scenario T4: Public Certificate Verification

### Actor

Unauthenticated Visitor

### Goal

Verify certificate authenticity using verification code.

### Preconditions

* Verification code is provided.
* Certificate exists.
* Certificate is active or revoked according to response policy.

### Main Flow

1. Visitor requests certificate verification endpoint.
2. Backend searches certificate by verification code.
3. Backend returns safe verification data.

### Safe Response Fields

* certificateNumber
* title
* studentNameSnapshot
* courseTitleSnapshot
* organizationNameSnapshot
* issuedAt
* status
* revokedAt if revoked

### Success Criteria

* Valid certificate is verifiable without login.
* Invalid code returns not found or invalid response.
* Sensitive user data is not exposed.
* Passwords, emails, and internal IDs are not exposed unless intentionally allowed.

### Out of Boundary

* Public verification frontend page
* QR code generation unless implemented

### Test Ideas

* Verify active certificate.
* Verify revoked certificate.
* Verify unknown code.
* Ensure email is not exposed.

---

## Scenario T5: Revoke Certificate

### Actor

Organization Owner

### Goal

Revoke an issued certificate.

### Preconditions

* User is authenticated.
* Certificate exists.
* User owns certificate organization.
* Certificate is ACTIVE.

### Main Flow

1. Owner requests certificate revocation.
2. Backend verifies certificate exists.
3. Backend verifies ownership of organization.
4. Backend sets status to REVOKED.
5. Backend stores revokedAt and revokeReason.
6. Backend returns updated certificate.

### Success Criteria

* Certificate is revoked.
* Revoked certificate cannot be treated as active.
* Public verification shows revoked status.
* Only organization owner can revoke.

### Out of Boundary

* Deleting certificate permanently

### Test Ideas

* Owner revokes certificate.
* Student attempts revoke.
* Other owner attempts revoke.
* Revoke already revoked certificate.

---

# 15. Authorization Service Expectations

The backend should centralize repeated authorization logic in an AuthorizationService.

Expected checks:

* ensureOrganizationOwner(organizationId)
* ensureOrganizationMember(organizationId)
* ensureActiveStudentMember(organizationId, userId)
* ensureCourseOwner(courseId)
* ensureCourseAccessible(courseId)
* ensureUserEnrolledInCourse(courseId, userId)
* ensureCertificateAccessible(certificateId)
* ensureQuizAccessible(quizId)
* ensureAttemptOwner(attemptId)

Success criteria:

* Services do not rely on global User.role.
* Services do not duplicate ownership checks everywhere.
* Cross-organization access is consistently rejected.
* Authorization logic is testable.

---

# 16. Success Criteria Summary

A backend scenario is considered successful when all of the following are true:

1. Request is validated correctly.
2. Authentication is enforced where required.
3. Organization-scoped authorization is enforced correctly.
4. Database integrity is maintained.
5. Correct entity relationships are preserved.
6. API returns the expected HTTP status.
7. API response format is consistent.
8. No cross-organization data leakage occurs.
9. No sensitive fields are exposed.
10. Duplicate records are prevented where required.
11. Historical data remains consistent after soft delete/archive.
12. Error responses are clear and predictable.

---

# 17. Global Out-of-Boundary Scope

The following items are outside the current backend scope unless added later:

* frontend implementation
* React / Next.js / Tailwind UI
* mobile app
* public certificate verification webpage
* payment system
* subscriptions
* AI features
* recommendations
* attendance tracking
* mentorship sessions
* chat system
* notifications
* analytics dashboards
* leaderboard and badges
* team projects
* assignment submission workflow
* advanced question bank engine
* video calls
* calendar scheduling
* advanced reporting
* microservices split
* multi-owner organizations unless explicitly implemented
* ownership transfer unless explicitly implemented
* advanced file processing
* video streaming
* social login
* OAuth login
* multi-factor authentication

---

# 18. Negative Test Expectations

The backend should reject:

* missing required fields
* invalid UUIDs
* duplicate emails
* duplicate organization memberships
* duplicate enrollments
* duplicate active certificates
* unauthorized access
* cross-organization access
* invalid foreign keys
* malformed JSON
* invalid JWT tokens
* expired JWT tokens
* revoked refresh tokens
* empty payloads when required
* enrollment for non-member user
* enrollment for user who is not STUDENT in the organization
* certificate issuing for non-enrolled user
* certificate issuing by non-owner
* resource creation by non-owner
* quiz attempt by non-enrolled user
* password reset with expired token
* email verification with used token
* business rule violations

---

# 19. Minimum Test Coverage Checklist

## Authentication

* register success without role
* register duplicate email
* register rejects or ignores role
* login success
* login wrong password
* unauthorized access without token
* refresh token success
* refresh token revoked
* logout invalidates refresh token
* forgot password generic response
* reset password success
* email verification success

## User

* get current user
* password hash not exposed
* disabled user restrictions

## Organization

* create organization
* creator becomes owner
* owner membership created
* view owned organizations
* view organizations where user is student
* block unrelated organization access
* disable organization

## Membership

* owner adds student member
* duplicate membership rejected
* non-owner cannot add member
* owner lists members
* owner removes member
* removed member loses access

## Course

* owner creates course
* owner updates course
* owner archives course
* student cannot create course
* enrolled student views course
* non-enrolled student cannot view course

## Enrollment

* owner enrolls active student member
* duplicate enrollment rejected
* non-member enrollment rejected
* non-owner enrollment rejected
* user views own enrollments

## Resource

* owner creates LINK resource
* LINK without url rejected
* owner creates FILE resource
* FILE without fileUrl rejected
* student views resources for enrolled course
* non-enrolled user cannot view resources

## Quiz

* owner creates quiz
* owner adds question and options
* single-choice requires exactly one correct answer
* owner publishes complete quiz
* incomplete quiz cannot be published
* enrolled student starts attempt
* non-enrolled user cannot start attempt
* student submits attempt
* score is calculated
* attempt cannot be submitted twice

## Certificate

* owner issues certificate
* duplicate active certificate rejected
* certificate for non-enrolled user rejected
* public verification works
* revoked certificate shows revoked status
* owner revokes certificate
* non-owner cannot revoke certificate

# 20. Notes for QA and Developers

When creating tests:

* test both success and failure paths
* verify response codes
* verify response body structure
* verify database state after each mutation
* verify security restrictions
* verify ownership checks
* verify organization membership checks
* verify enrollment checks
* verify that invalid input never creates partial data
* verify no cross-organization data leakage
* verify sensitive fields are never exposed
* verify soft-deleted or disabled records behave according to policy

---

# 21. Final Scope Statement

The backend is an API-only, modular, secure, multi-tenant SaaS backend for managing organizations, memberships, courses, enrollments, resources, quizzes, quiz attempts, and certificates.

The key architectural rule is:

A User is an identity, not a global role holder.

Business permissions are organization-scoped through organization memberships.

The backend must support the case where the same user is:

* OWNER of one organization
* STUDENT in another organization
* member of multiple organizations
* enrolled in multiple courses

All implementation and test cases should confirm:

* correctness
* authentication
* organization-scoped authorization
* data integrity
* tenant isolation
* predictable API behavior
* maintainability


