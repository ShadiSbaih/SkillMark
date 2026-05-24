# Backend Scenarios, Success Criteria, and Out-of-Boundary Scope

## Project
Cohive Backend  
Spring Boot + PostgreSQL (Neon)

## Purpose
This document defines the backend user scenarios, success criteria, and explicit out-of-boundary items for the Cohive platform.  
It is intended to support:
- backend implementation
- API testing
- integration testing
- QA test case creation
- scope control

---

# 1. System Overview

Cohive is a modular SaaS backend for managing:
- organizations
- students
- courses
- enrollments
- resources
- quizzes
- certificates

The backend exposes REST APIs and enforces:
- authentication
- authorization
- validation
- data integrity
- multi-tenant isolation

---

# 2. Actors

## 2.1 Organization Owner
A user who owns and manages an organization.

Responsibilities:
- create and manage organization data
- create courses
- manage students
- issue certificates
- review course content structure

---

## 2.2 Student
A user who belongs to an organization and enrolls in courses.

Responsibilities:
- access enrolled courses
- view resources
- participate in quizzes
- receive certificates

---

## 2.3 Unauthenticated Visitor
A user who has not logged in.

Responsibilities:
- register
- log in
- access only public authentication endpoints

---

## 2.4 System
The backend itself, responsible for:
- enforcing business rules
- storing data
- returning API responses
- validating permissions
- protecting organization boundaries

---

# 3. Core Business Rules

1. Every user must authenticate before accessing protected resources.
2. Every organization has exactly one owner.
3. A student belongs to an organization.
4. A course belongs to one organization.
5. A student can enroll in one or more courses.
6. Resources belong to courses.
7. Quizzes belong to courses.
8. Certificates belong to both a student and a course.
9. Users must not access data from other organizations.
10. APIs must validate inputs and reject invalid requests.
11. The backend must return consistent response structures.
12. The backend must support modular growth without breaking existing flows.

---

# 4. User Scenarios

---

# 4.1 Authentication Scenarios

## Scenario A1: Register a New User
### Actor
Unauthenticated Visitor

### Goal
Create a new account in the system.

### Preconditions
- Email is not already registered
- Password meets minimum policy
- Request body is valid

### Main Flow
1. Visitor sends registration request.
2. Backend validates input.
3. Backend checks if email already exists.
4. Backend creates a new user record.
5. Backend hashes the password.
6. Backend returns success response.

### Success Criteria
- A new user row is created in the database.
- Password is stored only in hashed form.
- API returns 201 Created or equivalent success response.
- Returned payload does not expose password.
- User can log in after registration.

### Out of Boundary
- Email verification flow
- OTP confirmation
- Social login
- Password recovery
- Multi-factor authentication

### Test Ideas
- Register with valid data
- Register with duplicate email
- Register with missing name
- Register with weak password
- Register with invalid email format

---

## Scenario A2: Login with Valid Credentials
### Actor
Registered User

### Goal
Obtain access token for protected APIs.

### Preconditions
- User already exists
- Password is correct

### Main Flow
1. User sends login request with email and password.
2. Backend verifies email exists.
3. Backend compares password hash.
4. Backend generates JWT token.
5. Backend returns token and user information.

### Success Criteria
- Correct token is generated.
- Token is usable for authenticated endpoints.
- API returns a successful response.
- Invalid credentials are not accepted.

### Out of Boundary
- Persistent login sessions in browser
- External identity providers
- OAuth login
- Refresh token rotation if not implemented

### Test Ideas
- Login with correct credentials
- Login with wrong password
- Login with non-existent email
- Login with malformed request body

---

## Scenario A3: Access Protected Endpoint Without Token
### Actor
Unauthenticated Visitor

### Goal
Verify unauthorized access is blocked.

### Preconditions
- Endpoint requires authentication

### Main Flow
1. Visitor sends request without token.
2. Backend checks security context.
3. Backend rejects the request.

### Success Criteria
- Response status is 401 Unauthorized.
- No protected data is exposed.
- No database mutation occurs.

### Out of Boundary
- Guest access to protected data
- Automatic anonymous session creation

### Test Ideas
- Call GET /courses without token
- Call POST /organizations without token
- Call DELETE /courses/{id} without token

---

# 4.2 Organization Scenarios

## Scenario O1: Create Organization
### Actor
Authenticated User

### Goal
Create a new organization.

### Preconditions
- User is authenticated
- Request body is valid
- User has permission to own organizations

### Main Flow
1. Owner submits organization creation request.
2. Backend validates request body.
3. Backend creates organization.
4. Backend assigns current user as owner.
5. Backend saves record.
6. Backend returns organization details.

### Success Criteria
- Organization record exists.
- owner_id references authenticated user.
- Organization name is stored correctly.
- Response includes organization ID.
- Organization is accessible only to its owner and authorized members.

### Out of Boundary
- Shared ownership across multiple users unless explicitly designed
- Organization branding and settings if not implemented
- Auto invitation emails

### Test Ideas
- Create organization with valid name
- Create organization with empty name
- Create organization with duplicate name if uniqueness is required
- Create organization as unauthorized user

---

## Scenario O2: View Own Organizations
### Actor
Organization Owner

### Goal
See organizations owned by the logged-in user.

### Preconditions
- User is authenticated

### Main Flow
1. Owner requests organization list.
2. Backend fetches organizations by owner_id.
3. Backend returns list.

### Success Criteria
- Only organizations owned by the user are returned.
- No cross-tenant organization leakage occurs.
- Response is paginated if list is large.

### Out of Boundary
- Viewing organizations of other users
- Admin-level global search if not implemented

### Test Ideas
- User with one organization
- User with multiple organizations
- User with zero organizations

---

## Scenario O3: Access Organization Details
### Actor
Organization Owner or Authorized User

### Goal
Open one organization record.

### Preconditions
- User is authenticated
- Organization exists
- User has permission

### Main Flow
1. User requests organization by ID.
2. Backend validates ownership or membership.
3. Backend returns details.

### Success Criteria
- Correct organization data is returned.
- Unauthorized access returns 403 or 404 depending on policy.
- Sensitive unrelated data is not exposed.

### Out of Boundary
- Editing organization settings if endpoint is read-only
- Cross-organization access

### Test Ideas
- Access own organization
- Access another user’s organization
- Access non-existent organization

---

# 4.3 Student Scenarios

## Scenario S1: Create Student Profile
### Actor
Authenticated User or Organization Owner

### Goal
Create a student profile linked to a user.

### Preconditions
- User exists
- Associated organization exists
- Request is valid

### Main Flow
1. Owner submits student creation request.
2. Backend validates user and organization references.
3. Backend creates student record.
4. Backend links student to user and organization.

### Success Criteria
- Student record is created.
- user_id is valid.
- org_id is valid.
- Student belongs to one organization if that is the current design.
- Response returns student details.

### Out of Boundary
- Student self-creation without permission if not allowed
- Multiple organization memberships if not supported

### Test Ideas
- Create student with valid user and organization
- Create student with invalid user ID
- Create student with invalid organization ID
- Create duplicate student for same user if uniqueness is required

---

## Scenario S2: View Student Profile
### Actor
Student or Organization Owner

### Goal
View a student profile.

### Preconditions
- Student exists
- Requester has access rights

### Main Flow
1. Request is sent for student ID.
2. Backend checks authorization.
3. Backend returns profile.

### Success Criteria
- Student profile is returned correctly.
- Unauthorized access is blocked.
- Data from other organizations is not exposed.

### Out of Boundary
- Access to students outside the organization
- Editing profile from this endpoint if it is read-only

### Test Ideas
- Owner views student in same organization
- Owner tries to view student from another organization
- Student views own profile
- Student views another student profile

---

# 4.4 Course Scenarios

## Scenario C1: Create Course
### Actor
Organization Owner

### Goal
Create a course under an organization.

### Preconditions
- Owner is authenticated
- Organization exists
- Owner owns the organization

### Main Flow
1. Owner submits course creation request.
2. Backend validates title and organization ID.
3. Backend verifies ownership.
4. Backend creates course.
5. Backend stores org_id relation.
6. Backend returns course data.

### Success Criteria
- Course is created successfully.
- course.org_id is valid.
- Course is linked to the correct organization.
- Returned response contains course ID.

### Out of Boundary
- Course creation by students
- Course creation under another organization

### Test Ideas
- Create valid course
- Create course with missing title
- Create course for invalid organization ID
- Create course for organization not owned by requester

---

## Scenario C2: View Courses for Organization
### Actor
Organization Owner or Authorized Student

### Goal
Retrieve all courses inside a specific organization.

### Preconditions
- User is authenticated
- User is authorized to view courses

### Main Flow
1. User sends list request.
2. Backend checks access rights.
3. Backend fetches courses by organization.
4. Backend returns courses.

### Success Criteria
- Only courses belonging to the authorized organization are returned.
- Pagination works if enabled.

### Out of Boundary
- All-system course directory without admin role
- Cross-tenant access

### Test Ideas
- List courses for organization with data
- List courses for organization with no data
- Try listing courses from another organization

---

## Scenario C3: View Course Details
### Actor
Organization Owner or Enrolled Student

### Goal
See details of one course.

### Preconditions
- Course exists
- Requester has permission

### Main Flow
1. Request course by ID.
2. Backend verifies permission.
3. Backend returns course info.

### Success Criteria
- Correct course is returned.
- Unauthorized access is blocked.

### Out of Boundary
- Editing course through read endpoint
- Accessing another organization’s course

### Test Ideas
- Access own course
- Access invalid course ID
- Access course from another organization

---

# 4.5 Enrollment Scenarios

## Scenario E1: Enroll Student in Course
### Actor
Organization Owner

### Goal
Attach a student to a course.

### Preconditions
- Student exists
- Course exists
- Student and course belong to same organization or cross-org enrollment is explicitly allowed
- Enrollment does not already exist

### Main Flow
1. Owner sends enrollment request.
2. Backend validates student and course existence.
3. Backend checks org compatibility.
4. Backend checks for duplicate enrollment.
5. Backend creates enrollment record.
6. Backend returns success.

### Success Criteria
- Enrollment record is created.
- Duplicate enrollment is prevented.
- Response indicates success clearly.

### Out of Boundary
- Enrolling a deleted student
- Enrolling in a course from another organization if not allowed
- Self-enrollment by student if not allowed

### Test Ideas
- Enroll valid student in valid course
- Enroll same student twice
- Enroll invalid student ID
- Enroll into invalid course ID
- Enroll across organizations if forbidden

---

## Scenario E2: View Student Enrollments
### Actor
Student or Owner

### Goal
See which courses a student is enrolled in.

### Preconditions
- Student exists
- Requester has access rights

### Main Flow
1. Request student enrollments.
2. Backend validates access.
3. Backend returns list.

### Success Criteria
- Correct enrollment list is returned.
- Unauthorized access is blocked.

### Out of Boundary
- Showing enrollments from another organization

### Test Ideas
- View own enrollments
- View another student’s enrollments as owner
- View another student’s enrollments as student

---

# 4.6 Resource Scenarios

## Scenario R1: Create Resource for Course
### Actor
Organization Owner

### Goal
Add learning material to a course.

### Preconditions
- Course exists
- User owns the organization
- Request is valid

### Main Flow
1. Owner submits resource creation request.
2. Backend validates request.
3. Backend verifies course ownership.
4. Backend creates resource record.
5. Backend links resource to course.
6. Backend returns created resource.

### Success Criteria
- Resource is created.
- Resource is linked to the correct course.
- URL and type are stored properly.

### Out of Boundary
- Uploading large files if file storage is not implemented
- Resource creation by students
- Resource sharing across unrelated courses unless designed

### Test Ideas
- Create resource with valid URL
- Create resource with missing type
- Create resource with invalid course ID
- Create resource in another organization’s course

---

## Scenario R2: View Course Resources
### Actor
Student or Owner

### Goal
See resources for a course.

### Preconditions
- User is authorized
- Course exists

### Main Flow
1. User requests resources for course.
2. Backend checks enrollment or ownership.
3. Backend returns resource list.

### Success Criteria
- Only authorized users can see the resources.
- Data returned matches the selected course.

### Out of Boundary
- Resources from other courses
- Hidden admin-only resources if not implemented

### Test Ideas
- View resources for enrolled course
- Try to view resources for non-enrolled course
- View resources for invalid course ID

---

# 4.7 Quiz Scenarios

## Scenario Q1: Create Quiz
### Actor
Organization Owner

### Goal
Add a quiz to a course.

### Preconditions
- Course exists
- Owner has permission

### Main Flow
1. Owner submits quiz creation request.
2. Backend validates title and course ID.
3. Backend confirms course ownership.
4. Backend creates quiz.
5. Backend links quiz to course.
6. Backend returns quiz details.

### Success Criteria
- Quiz exists in database.
- Quiz is linked to the correct course.

### Out of Boundary
- Quiz question banks if not implemented
- Quiz attempts if not implemented
- Student quiz creation

### Test Ideas
- Create valid quiz
- Create quiz with empty title
- Create quiz with invalid course ID

---

## Scenario Q2: View Course Quizzes
### Actor
Student or Owner

### Goal
See quizzes inside a course.

### Preconditions
- User is authorized
- Course exists

### Main Flow
1. User requests quizzes by course ID.
2. Backend verifies access.
3. Backend returns quizzes.

### Success Criteria
- Only quizzes for that course are returned.
- Unauthorized access is denied.

### Out of Boundary
- Quiz attempt submission
- Quiz scoring if not implemented

### Test Ideas
- View quizzes for enrolled course
- View quizzes for invalid course ID
- View quizzes without authorization

---

# 4.8 Certificate Scenarios

## Scenario T1: Issue Certificate
### Actor
Organization Owner

### Goal
Generate a certificate for a student in a course.

### Preconditions
- Student exists
- Course exists
- Student is enrolled in the course
- Certificate does not already exist if duplicates are forbidden

### Main Flow
1. Owner submits certificate issuance request.
2. Backend verifies student and course.
3. Backend verifies enrollment.
4. Backend checks duplicate certificate rules.
5. Backend creates certificate.
6. Backend returns certificate details.

### Success Criteria
- Certificate is created.
- It is linked to the correct student and course.
- Duplicate issuance is blocked if not allowed.

### Out of Boundary
- Auto certificate generation logic if not implemented
- PDF rendering if not implemented
- Public certificate verification portal if not implemented

### Test Ideas
- Issue certificate for enrolled student
- Issue certificate for non-enrolled student
- Issue certificate twice
- Issue certificate with invalid IDs

---

## Scenario T2: View Student Certificates
### Actor
Student or Owner

### Goal
Retrieve certificates owned by a student.

### Preconditions
- Student exists
- Requester has access rights

### Main Flow
1. Request certificate list.
2. Backend checks permission.
3. Backend returns certificate records.

### Success Criteria
- Only authorized certificate data is returned.
- Certificate list matches the student.

### Out of Boundary
- Certificates belonging to another student outside permitted access

### Test Ideas
- View own certificates
- View student certificates as owner
- View another student’s certificates without permission

---

# 5. Success Criteria Summary

A backend scenario is considered successful when all of the following are true:

1. Request is validated correctly.
2. Authorization is enforced correctly.
3. Database integrity is maintained.
4. Correct entity relationships are preserved.
5. API returns the expected HTTP status.
6. API response format is consistent.
7. No cross-organization data leakage occurs.
8. No sensitive fields are exposed.
9. Duplicate records are prevented when required.
10. Error responses are clear and actionable.

---

# 6. Global Out-of-Boundary Scope

The following items are explicitly outside the current backend scope unless added later:

- AI features
- recommendations
- attendance tracking
- mentorship sessions
- chat system
- notifications
- analytics dashboards
- leaderboard and badges
- team projects
- assignment submission workflow
- quiz question bank engine
- quiz attempts and auto-grading
- file uploads and file storage
- email verification
- password reset flows
- OAuth / social login
- mobile app support
- video calls
- calendar scheduling
- public certificate verification portal
- advanced reporting
- multi-role permission matrix if not implemented
- microservices split

---

# 7. Negative Test Expectations

The backend should reject:

- missing required fields
- invalid UUIDs
- duplicate enrollments
- duplicate emails
- unauthorized access
- cross-organization access
- invalid foreign keys
- malformed JSON
- invalid JWT tokens
- expired JWT tokens
- empty payloads when required
- business rule violations

---

# 8. Minimum Test Coverage Checklist

## Authentication
- register success
- register duplicate email
- login success
- login wrong password
- unauthorized access

## Organization
- create organization
- view own organizations
- block access to other organizations

## Student
- create student
- view student
- block unauthorized student access

## Course
- create course
- list courses
- reject invalid organization ID

## Enrollment
- create enrollment
- reject duplicate enrollment
- reject invalid student/course

## Resource
- create resource
- list resources for course
- reject unauthorized access

## Quiz
- create quiz
- list quizzes
- reject invalid course

## Certificate
- issue certificate
- reject duplicate issuance
- reject certificate for non-enrolled student

---

# 9. Notes for QA and Developers

When creating tests:
- test both success and failure paths
- verify response codes
- verify database state after each mutation
- verify security restrictions
- verify ownership checks
- verify that entity relationships remain consistent
- verify that invalid input never creates partial data

---

# 10. Final Scope Statement

The backend is a modular, secure, multi-tenant SaaS API for managing organizations, students, courses, enrollments, resources, quizzes, and certificates.  
All test cases should be written to confirm:
- correctness
- authorization
- data integrity
- tenant isolation
- predictable API behavior