# Skillmark User Scenarios

## Full User Scenario Coverage

This document describes the main user scenarios for the expanded **Skillmark** platform.

Skillmark is a university-focused training, assessment, and certification backend platform.

It supports:

- Clerk authentication
- organizations
- organization memberships
- programs/workshops
- program enrollments
- invitation links
- program resources
- quizzes
- quiz attempts
- certificates
- public certificate verification
- statistics
- audit logs
- Cloudflare R2 file storage
- Cloudinary image/media management

---

# 1. User Types

Skillmark has four main user types/states:

1. Unauthenticated Visitor
2. Authenticated User
3. Organization Owner
4. Program Participant

Important rule:

A user does **not** have a global business role.

Wrong:

```text
users.role = OWNER
users.role = PARTICIPANT
```

Correct:

```text
organization_memberships.role
program_enrollments.status
```

A user can be:

- OWNER in one organization
- PARTICIPANT in another organization
- enrolled in multiple programs
- not enrolled in other programs

---

# 2. Scenario Format

Each scenario includes:

- Actor
- Goal
- Preconditions
- Main Flow
- Business Rules
- Alternative / Error Flows
- Expected Result

---

# 3. Visitor Scenarios

---

## SC-001: Visitor Verifies a Certificate Publicly

### Actor

Unauthenticated Visitor

### Goal

Verify whether a certificate is valid using a verification code.

### Preconditions

- Certificate exists in the system.
- Visitor has a certificate verification code.

### Main Flow

1. Visitor opens public certificate verification page.
2. Visitor enters verification code.
3. Frontend calls public verification endpoint.
4. Backend searches certificate by verification code.
5. Backend returns public certificate data.

### Business Rules

- No login is required.
- The response must not expose sensitive user data.
- The response can include:
  - certificate status
  - participant name snapshot
  - quiz title snapshot
  - program title snapshot
  - organization name snapshot
  - issued date
  - revoked state if revoked

### Alternative / Error Flows

- If verification code does not exist, return not found response.
- If certificate is revoked, return certificate data with status `REVOKED`.

### Expected Result

Visitor can verify if the certificate is valid, revoked, or not found.

---

## SC-002: Visitor Tries to Access Private Program

### Actor

Unauthenticated Visitor

### Goal

Access a private program page or resource.

### Preconditions

- Visitor is not logged in.

### Main Flow

1. Visitor opens private program/resource URL.
2. Backend checks authentication.
3. Backend rejects the request.

### Business Rules

- Private endpoints require a valid Clerk session/token.

### Expected Result

System returns unauthorized response.

---

## SC-003: Visitor Opens Invitation Link Without Login

### Actor

Unauthenticated Visitor

### Goal

Join a program through invitation link.

### Preconditions

- Invitation link exists.

### Main Flow

1. Visitor opens invitation link.
2. Frontend detects user is not logged in.
3. Frontend redirects user to Clerk sign in/sign up.
4. After authentication, user can continue the join flow.

### Business Rules

- Joining a program requires authentication.
- Invitation validation happens after user is authenticated.

### Expected Result

Visitor is asked to login/register before joining the program.

---

# 4. Authenticated User Scenarios

---

## SC-004: User First Login and Backend Profile Sync

### Actor

Authenticated User

### Goal

Create or update local backend user profile after Clerk authentication.

### Preconditions

- User has a valid Clerk session/token.
- User may or may not exist in local `users` table.

### Main Flow

1. User logs in using Clerk.
2. Frontend calls backend `/api/v1/users/sync`.
3. Backend verifies Clerk token.
4. Backend extracts Clerk user ID.
5. Backend checks if local user exists by `clerk_user_id`.
6. If not found, backend creates local user record.
7. If found, backend updates name/email/avatar if changed.
8. Backend returns current user profile.

### Business Rules

- `clerk_user_id` must be unique.
- Backend must not store passwords.
- Clerk is source of truth for authentication identity.
- Backend user table is used for domain relationships.

### Alternative / Error Flows

- Invalid Clerk token: return unauthorized.
- Missing email from Clerk: return validation/business error if email is required.

### Expected Result

User has a synchronized local backend profile.

---

## SC-005: Authenticated User Views Own Profile

### Actor

Authenticated User

### Goal

View own backend profile.

### Preconditions

- User has a valid Clerk token.
- Local user profile exists or can be synced.

### Main Flow

1. User requests `/api/v1/users/me`.
2. Backend verifies Clerk token.
3. Backend resolves local user.
4. Backend returns user response.

### Business Rules

- Response must not expose sensitive internal data.
- User can only view own profile.

### Expected Result

User receives own profile data.

---

## SC-006: Authenticated User Creates Organization

### Actor

Authenticated User

### Goal

Create a new organization.

### Preconditions

- User is authenticated.
- Local user profile exists.

### Main Flow

1. User sends organization creation request.
2. Backend validates organization data.
3. Backend creates organization record.
4. Backend sets `owner_id` to current user.
5. Backend creates organization membership:
   - role = OWNER
   - status = ACTIVE
6. Backend writes audit log.
7. Backend returns organization response.

### Business Rules

- Any authenticated user can create an organization.
- Organization creation and owner membership creation must be in one transaction.
- Creator becomes organization owner automatically.

### Alternative / Error Flows

- Invalid organization name: return validation error.
- User not synced locally: sync user first or return error depending on implementation.

### Expected Result

Organization is created and current user becomes owner.

---

## SC-007: Authenticated User Views Accessible Organizations

### Actor

Authenticated User

### Goal

View organizations they own or belong to.

### Preconditions

- User is authenticated.
- User has one or more organization memberships.

### Main Flow

1. User requests organization list.
2. Backend gets current user.
3. Backend queries active organization memberships.
4. Backend returns accessible organizations.

### Business Rules

- User must not see unrelated organizations.
- Use pagination if list can grow.

### Expected Result

User receives only organizations they can access.

---

# 5. Organization Owner Scenarios

---

## SC-008: Owner Updates Organization

### Actor

Organization Owner

### Goal

Update owned organization details.

### Preconditions

- User is authenticated.
- User has OWNER role in the organization.

### Main Flow

1. Owner sends update request.
2. Backend checks `ensureOrganizationOwner(organizationId)`.
3. Backend validates request.
4. Backend updates organization.
5. Backend writes audit log.
6. Backend returns updated organization.

### Business Rules

- Only owner can update organization.
- Owner cannot update unrelated organizations.

### Alternative / Error Flows

- Participant tries to update: return forbidden.
- Unrelated user tries to update: return forbidden or not found depending on policy.

### Expected Result

Organization details are updated.

---

## SC-009: Owner Soft Deletes Organization

### Actor

Organization Owner

### Goal

Disable or delete organization while preserving history.

### Preconditions

- User is owner.

### Main Flow

1. Owner sends delete request.
2. Backend checks ownership.
3. Backend sets organization status to `DELETED` or `DISABLED`.
4. Backend sets `deleted_at`.
5. Backend writes audit log.

### Business Rules

- Prefer soft delete.
- Do not delete historical programs, attempts, certificates.
- Deleted organization should not be available for new activity.

### Expected Result

Organization is disabled/deleted safely.

---

## SC-010: Owner Adds Organization Member

### Actor

Organization Owner

### Goal

Add user as participant/member in organization.

### Preconditions

- Owner is authenticated.
- Target user exists in local users table.

### Main Flow

1. Owner sends target user ID or email.
2. Backend checks organization ownership.
3. Backend checks target user exists.
4. Backend checks no duplicate active membership.
5. Backend creates membership:
   - role = PARTICIPANT
   - status = ACTIVE
6. Backend writes audit log.
7. Backend returns membership response.

### Business Rules

- Only owner can add members.
- Duplicate active membership is not allowed.
- Current MVP supports OWNER and PARTICIPANT only.

### Alternative / Error Flows

- Target user not found: return not found.
- Duplicate active membership: return conflict.
- Non-owner tries to add member: return forbidden.

### Expected Result

Target user becomes organization participant.

---

## SC-011: Owner Removes Organization Member

### Actor

Organization Owner

### Goal

Remove participant from organization.

### Preconditions

- Owner is authenticated.
- Target user is an organization member.

### Main Flow

1. Owner sends remove request.
2. Backend checks ownership.
3. Backend marks membership as `REMOVED` or `INACTIVE`.
4. Backend writes audit log.

### Business Rules

- Do not hard delete historical data.
- Removed members lose access to organization data.
- Owner should not accidentally remove the only owner unless ownership transfer exists.

### Alternative / Error Flows

- Trying to remove non-member: return not found.
- Trying to remove owner without supported policy: return business rule error.

### Expected Result

Member loses organization access.

---

# 6. Program / Workshop Scenarios

---

## SC-012: Owner Creates Program / Workshop

### Actor

Organization Owner

### Goal

Create a training program or workshop inside an organization.

### Preconditions

- User is owner of the organization.

### Main Flow

1. Owner sends program data.
2. Backend checks organization ownership.
3. Backend validates program data.
4. Backend creates program with:
   - status = DRAFT
   - is_published = false
5. Backend writes audit log.
6. Backend returns program response.

### Business Rules

- Only organization owner can create programs.
- Program belongs to one organization.
- Draft programs are visible to owners only.

### Expected Result

Program is created as draft.

---

## SC-013: Owner Updates Program

### Actor

Organization Owner

### Goal

Update program details.

### Preconditions

- Program exists.
- User owns the program organization.

### Main Flow

1. Owner sends update request.
2. Backend checks program ownership through organization.
3. Backend validates request.
4. Backend updates program.
5. Backend writes audit log.

### Business Rules

- Only owner can update program.
- Archived/deleted programs may have restricted updates.

### Expected Result

Program is updated.

---

## SC-014: Owner Publishes Program

### Actor

Organization Owner

### Goal

Make program available to enrolled participants.

### Preconditions

- Program exists.
- User owns organization.

### Main Flow

1. Owner requests publish.
2. Backend checks ownership.
3. Backend validates program required fields.
4. Backend sets:
   - status = PUBLISHED
   - is_published = true
5. Backend writes audit log.

### Business Rules

- Only owner can publish.
- Participants can view published program only if enrolled.

### Expected Result

Program becomes published.

---

## SC-015: Owner Archives Program

### Actor

Organization Owner

### Goal

Archive a completed or inactive program.

### Preconditions

- Program exists.
- User owns organization.

### Main Flow

1. Owner requests archive.
2. Backend checks ownership.
3. Backend sets status = ARCHIVED.
4. Backend writes audit log.

### Business Rules

- Archived program should not accept new enrollments.
- Historical data remains available to owner.

### Expected Result

Program is archived safely.

---

## SC-016: Participant Views Enrolled Programs

### Actor

Program Participant

### Goal

View programs they joined.

### Preconditions

- User is authenticated.
- User has active program enrollments.

### Main Flow

1. User requests own enrollments.
2. Backend gets current user.
3. Backend returns active enrolled programs.

### Business Rules

- User sees only own enrollments.
- Removed enrollments should not appear as active.

### Expected Result

User sees list of enrolled programs.

---

# 7. Invitation Link Scenarios

---

## SC-017: Owner Creates Invitation Link

### Actor

Organization Owner

### Goal

Create a join link for a program.

### Preconditions

- Program exists.
- User owns program organization.

### Main Flow

1. Owner sends invitation settings:
   - max uses
   - expiration date
2. Backend checks program ownership.
3. Backend generates unique code.
4. Backend creates invitation link:
   - status = ACTIVE
   - used_count = 0
5. Backend writes audit log.
6. Backend returns invitation link/code.

### Business Rules

- Only owner can create invitation links.
- Code must be unique.
- Invitation belongs to one program and organization.

### Expected Result

Owner can share invitation link with students.

---

## SC-018: User Joins Program by Invitation

### Actor

Authenticated User

### Goal

Join a program using invitation code.

### Preconditions

- User is authenticated.
- Invitation exists.

### Main Flow

1. User opens invitation link.
2. Frontend sends code to backend.
3. Backend verifies Clerk token.
4. Backend resolves local user.
5. Backend finds invitation by code.
6. Backend validates invitation:
   - status = ACTIVE
   - not expired
   - usage limit not exceeded
7. Backend checks program is joinable.
8. Backend ensures user has organization membership if required by product policy.
9. Backend checks no duplicate active enrollment.
10. Backend creates program enrollment.
11. Backend increments invitation `used_count`.
12. Backend writes audit log.
13. Backend returns program/enrollment response.

### Business Rules

- User must be logged in.
- Expired invitation must be rejected.
- Disabled invitation must be rejected.
- Max uses must be enforced.
- Duplicate active enrollment is not allowed.
- Join flow must be transactional.

### Alternative / Error Flows

- Invitation not found: return not found.
- Invitation disabled: return business rule error.
- Invitation expired: return business rule error.
- Max uses reached: return business rule error.
- Already enrolled: return conflict.

### Expected Result

User becomes enrolled in the program.

---

## SC-019: Owner Disables Invitation Link

### Actor

Organization Owner

### Goal

Stop an invitation link from being used.

### Preconditions

- Invitation exists.
- User owns organization.

### Main Flow

1. Owner requests disable invitation.
2. Backend checks invitation ownership.
3. Backend sets status = DISABLED.
4. Backend writes audit log.

### Business Rules

- Disabled invitation cannot be used.
- Existing enrollments remain active.

### Expected Result

Invitation link becomes unusable.

---

# 8. Resource Scenarios

---

## SC-020: Owner Adds External Link Resource

### Actor

Organization Owner

### Goal

Add a learning resource as external link.

### Preconditions

- Program exists.
- User owns program organization.

### Main Flow

1. Owner sends resource:
   - title
   - description
   - type = LINK
   - url
2. Backend checks ownership.
3. Backend validates URL.
4. Backend creates resource.
5. Backend writes audit log.

### Business Rules

- Only owner can create resources.
- LINK resource stores external URL.
- No R2/Cloudinary upload required.

### Expected Result

Resource is available to enrolled participants.

---

## SC-021: Owner Adds File Resource Using Cloudflare R2

### Actor

Organization Owner

### Goal

Add downloadable file resource.

### Preconditions

- Program exists.
- User owns program organization.
- R2 is configured.

### Main Flow

1. Owner requests upload URL or uploads file through backend.
2. Backend checks ownership.
3. Backend uses R2 storage service.
4. File is stored in Cloudflare R2.
5. Backend stores resource metadata:
   - type = FILE
   - storage_provider = R2
   - object_key
   - url if public/signed
6. Backend writes audit log.

### Business Rules

- File storage logic must be inside storage service.
- Controllers should not call R2 SDK directly.
- Store metadata, not raw file content, in database.

### Expected Result

File resource is stored and linked to program.

---

## SC-022: Owner Adds Image Resource Using Cloudinary

### Actor

Organization Owner

### Goal

Add image/media resource.

### Preconditions

- Program exists.
- User owns program organization.
- Cloudinary is configured.

### Main Flow

1. Owner uploads image or requests signed upload.
2. Backend checks ownership.
3. Backend uses Cloudinary media service.
4. Cloudinary stores image.
5. Backend stores resource metadata:
   - type = IMAGE
   - storage_provider = CLOUDINARY
   - url
   - object_key/public id
6. Backend writes audit log.

### Business Rules

- Cloudinary is preferred for images/media.
- R2 is preferred for PDFs/files.

### Expected Result

Image resource is added to program.

---

## SC-023: Participant Views Program Resources

### Actor

Program Participant

### Goal

Access resources for enrolled program.

### Preconditions

- User is authenticated.
- User has active enrollment in program.
- Resources exist.

### Main Flow

1. Participant requests program resources.
2. Backend verifies current user.
3. Backend checks active program enrollment.
4. Backend returns active resources.

### Business Rules

- Unenrolled users cannot view private resources.
- Archived/deleted resources should not appear to participants.
- Owner can view all resources.

### Alternative / Error Flows

- User is not enrolled: return forbidden.
- Program is archived: product policy decides whether participants can still view.

### Expected Result

Participant can access program learning materials.

---

## SC-024: Owner Archives Resource

### Actor

Organization Owner

### Goal

Hide resource from participants.

### Preconditions

- Resource exists.
- Owner owns program organization.

### Main Flow

1. Owner requests archive/delete resource.
2. Backend checks ownership.
3. Backend sets status = ARCHIVED or DELETED.
4. Backend writes audit log.

### Business Rules

- Prefer soft delete.
- Do not delete R2/Cloudinary file unless explicitly required.

### Expected Result

Resource is no longer visible to participants.

---

# 9. Quiz Management Scenarios

---

## SC-025: Owner Creates Quiz

### Actor

Organization Owner

### Goal

Create a quiz inside a program.

### Preconditions

- Program exists.
- User owns organization.

### Main Flow

1. Owner sends quiz data:
   - title
   - description
   - passing score
   - max attempts
   - duration
   - certificate settings
2. Backend checks program ownership.
3. Backend validates quiz settings.
4. Backend creates quiz:
   - status = DRAFT
   - is_published = false
5. Backend writes audit log.

### Business Rules

- Quiz belongs to program.
- Only owner can create quiz.
- Passing score must be between 0 and 100.
- Max attempts must be greater than 0.

### Expected Result

Quiz is created as draft.

---

## SC-026: Owner Adds Question to Quiz

### Actor

Organization Owner

### Goal

Add question to quiz.

### Preconditions

- Quiz exists.
- Quiz belongs to owned program.

### Main Flow

1. Owner sends question data.
2. Backend checks quiz ownership.
3. Backend validates question.
4. Backend creates question.

### Business Rules

- MVP supports SINGLE_CHOICE.
- Points must be positive.

### Expected Result

Question is added to quiz.

---

## SC-027: Owner Adds Options to Question

### Actor

Organization Owner

### Goal

Add answer options to a question.

### Preconditions

- Question exists.
- Question belongs to owned quiz.

### Main Flow

1. Owner sends options.
2. Backend checks question ownership.
3. Backend validates option data.
4. Backend creates options.

### Business Rules

- Option text is required.
- A SINGLE_CHOICE question must have exactly one correct option before quiz publishing.
- The system may validate exactly one correct option immediately or during publishing.

### Expected Result

Options are added to question.

---

## SC-028: Owner Publishes Quiz

### Actor

Organization Owner

### Goal

Make quiz available to enrolled participants.

### Preconditions

- Quiz exists.
- Quiz is draft.
- User owns quiz program organization.

### Main Flow

1. Owner requests quiz publish.
2. Backend checks ownership.
3. Backend validates quiz:
   - has at least one question
   - every question has options
   - every SINGLE_CHOICE question has exactly one correct option
   - settings are valid
4. Backend sets:
   - status = PUBLISHED
   - is_published = true
5. Backend writes audit log.

### Business Rules

- Invalid quiz cannot be published.
- Participants can only see published quizzes.
- Published quiz modifications should be safe.

### Alternative / Error Flows

- Quiz has no questions: return business rule error.
- Question has no correct answer: return business rule error.
- More than one correct option for SINGLE_CHOICE: return business rule error.

### Expected Result

Quiz becomes available to enrolled participants.

---

## SC-029: Owner Archives Quiz

### Actor

Organization Owner

### Goal

Stop quiz from accepting new attempts.

### Preconditions

- Quiz exists.
- User owns quiz program organization.

### Main Flow

1. Owner requests archive.
2. Backend checks ownership.
3. Backend sets status = ARCHIVED.
4. Backend writes audit log.

### Business Rules

- Historical attempts remain preserved.
- Certificates remain valid unless separately revoked.
- Archived quiz should not allow new attempts.

### Expected Result

Quiz is archived safely.

---

# 10. Participant Quiz Scenarios

---

## SC-030: Participant Views Published Quizzes

### Actor

Program Participant

### Goal

View available quizzes inside enrolled program.

### Preconditions

- User is enrolled in program.
- Program has published quizzes.

### Main Flow

1. Participant requests program quizzes.
2. Backend checks active enrollment.
3. Backend returns published quizzes only.

### Business Rules

- Participants cannot view draft/unpublished quizzes.
- Owners can view all quizzes.

### Expected Result

Participant sees available published quizzes.

---

## SC-031: Participant Starts Quiz Attempt

### Actor

Program Participant

### Goal

Start a quiz attempt.

### Preconditions

- User is enrolled in program.
- Quiz is published.
- Max attempts not exceeded.

### Main Flow

1. Participant requests start attempt.
2. Backend checks:
   - quiz exists
   - quiz is published
   - quiz status = PUBLISHED
   - user is actively enrolled in program
   - max attempts not exceeded
3. Backend creates attempt:
   - status = IN_PROGRESS
   - started_at = now
4. Backend returns attempt response.

### Business Rules

- Unenrolled users cannot start attempt.
- Archived quiz cannot be attempted.
- Max attempts must be enforced.
- Owner can start attempt only if also enrolled as participant.

### Alternative / Error Flows

- Max attempts reached: return business rule error.
- Quiz not published: return forbidden/not found.
- User not enrolled: return forbidden.

### Expected Result

Attempt is created.

---

## SC-032: Participant Submits Quiz Attempt

### Actor

Program Participant

### Goal

Submit quiz answers.

### Preconditions

- Attempt exists.
- Attempt belongs to current user.
- Attempt status is IN_PROGRESS.

### Main Flow

1. Participant sends selected answers.
2. Backend checks attempt owner.
3. Backend checks attempt status.
4. Backend validates:
   - questions belong to quiz
   - selected options belong to questions
   - no duplicated question answer
5. Backend calculates points.
6. Backend calculates score percentage.
7. Backend determines pass/fail.
8. Backend saves attempt answers.
9. Backend updates attempt:
   - status = SUBMITTED
   - submitted_at = now
   - score
   - passed
10. Backend writes audit log.
11. If passed and certificate mode is AUTO, backend issues certificate.

### Business Rules

- Backend calculates score.
- Client score is ignored.
- User cannot submit another user's attempt.
- User cannot submit attempt twice.
- Invalid question/option combinations are rejected.

### Alternative / Error Flows

- Attempt already submitted: return conflict.
- Selected option does not belong to question: return validation error.
- Question does not belong to quiz: return validation error.
- Attempt belongs to another user: return forbidden.

### Expected Result

Attempt is submitted and scored.

---

## SC-033: Participant Views Own Attempts

### Actor

Program Participant

### Goal

View own attempt history.

### Preconditions

- User has attempts.

### Main Flow

1. Participant requests own attempts.
2. Backend resolves current user.
3. Backend returns attempts where user_id = current user.

### Business Rules

- User can only view own attempts unless owner viewing organization attempts.

### Expected Result

Participant sees own quiz results.

---

# 11. Certificate Scenarios

---

## SC-034: System Auto-Issues Certificate

### Actor

System

### Goal

Automatically issue certificate after passing quiz.

### Preconditions

- Attempt was submitted.
- Attempt passed.
- Quiz certificateEnabled = true.
- Quiz certificateIssueMode = AUTO.

### Main Flow

1. Attempt submission completes.
2. Backend checks certificate eligibility.
3. Backend verifies:
   - user is enrolled in program
   - attempt is submitted
   - attempt passed
   - no duplicate active certificate exists
4. Backend generates certificate number.
5. Backend generates verification code.
6. Backend stores snapshots:
   - participantNameSnapshot
   - quizTitleSnapshot
   - programTitleSnapshot
   - organizationNameSnapshot
7. Backend creates certificate.
8. Backend may generate/store PDF/QR metadata.
9. Backend writes audit log.

### Business Rules

- No duplicate active certificate for same user and quiz.
- Certificate snapshots preserve historical names.
- Failed attempts cannot receive certificates.

### Expected Result

Certificate is issued automatically.

---

## SC-035: Owner Manually Issues Certificate

### Actor

Organization Owner

### Goal

Issue certificate manually for passing attempt.

### Preconditions

- Quiz certificateIssueMode = MANUAL.
- Attempt exists.
- Attempt is submitted and passed.
- Owner owns organization.

### Main Flow

1. Owner selects passing attempt.
2. Backend checks owner permission.
3. Backend checks attempt eligibility.
4. Backend checks no duplicate active certificate.
5. Backend generates certificate number and verification code.
6. Backend stores snapshots.
7. Backend creates certificate.
8. Backend writes audit log.

### Business Rules

- Only owner can manually issue certificate.
- Failed attempts are not eligible.
- Duplicate active certificates are rejected.

### Alternative / Error Flows

- Attempt failed: return business rule error.
- Certificate already exists: return conflict.
- Owner does not own organization: return forbidden.

### Expected Result

Certificate is issued manually.

---

## SC-036: Participant Views Own Certificates

### Actor

Program Participant

### Goal

View certificates issued to them.

### Preconditions

- User has certificates.

### Main Flow

1. User requests own certificates.
2. Backend resolves current user.
3. Backend returns certificates where user_id = current user.

### Business Rules

- User can only view own certificates.
- Certificate response can include PDF/QR URLs if available.

### Expected Result

Participant sees own certificates.

---

## SC-037: Owner Views Organization Certificates

### Actor

Organization Owner

### Goal

View certificates issued under owned organization.

### Preconditions

- User owns organization.

### Main Flow

1. Owner requests organization certificates.
2. Backend checks organization ownership.
3. Backend returns certificates for organization.

### Business Rules

- Owners cannot view certificates of unrelated organizations.

### Expected Result

Owner sees organization certificate list.

---

## SC-038: Owner Revokes Certificate

### Actor

Organization Owner

### Goal

Revoke certificate.

### Preconditions

- Certificate exists.
- User owns certificate organization.

### Main Flow

1. Owner sends revoke request with reason.
2. Backend checks ownership.
3. Backend sets:
   - status = REVOKED
   - revoked_at = now
   - revoke_reason
4. Backend writes audit log.

### Business Rules

- Revoked certificate remains verifiable as revoked.
- Do not delete certificate.
- Only owner can revoke certificates in owned organization.

### Expected Result

Certificate is revoked but still historically visible.

---

## SC-039: Public Certificate Verification Shows Revoked Certificate

### Actor

Visitor

### Goal

Verify a revoked certificate.

### Preconditions

- Certificate exists and status = REVOKED.

### Main Flow

1. Visitor enters verification code.
2. Backend finds certificate.
3. Backend returns safe certificate data with status REVOKED.

### Business Rules

- Public verification should not hide revoked certificates.
- It should clearly indicate revoked status.

### Expected Result

Visitor sees that certificate was revoked.

---

# 12. Certificate PDF and QR Scenarios

---

## SC-040: System Stores Certificate PDF in Cloudflare R2

### Actor

System

### Goal

Store generated certificate PDF.

### Preconditions

- Certificate exists.
- PDF generation is enabled.
- R2 is configured.

### Main Flow

1. System generates certificate PDF.
2. System uploads PDF to Cloudflare R2.
3. R2 returns object key or URL.
4. Backend stores:
   - pdf_url
   - pdf_object_key
5. Backend updates certificate.

### Business Rules

- R2 is preferred for certificate PDFs.
- Database stores metadata only.
- PDF generation can be delayed in first MVP.

### Expected Result

Certificate has downloadable PDF metadata.

---

## SC-041: System Stores QR Code

### Actor

System

### Goal

Store QR code for certificate verification.

### Preconditions

- Certificate exists.
- Verification code exists.
- QR generation is enabled.

### Main Flow

1. System generates QR code pointing to verification URL.
2. System uploads QR image to R2 or Cloudinary.
3. Backend stores:
   - qr_code_url
   - qr_code_object_key

### Business Rules

- QR code should point to public verification page.
- R2 or Cloudinary can store QR image.
- Database stores metadata only.

### Expected Result

Certificate has QR metadata.

---

# 13. Statistics Scenarios

---

## SC-042: Owner Views Organization Statistics

### Actor

Organization Owner

### Goal

View high-level organization stats.

### Preconditions

- User owns organization.

### Main Flow

1. Owner requests organization stats.
2. Backend checks ownership.
3. Backend calculates:
   - total programs
   - total members
   - total enrolled participants
   - total quizzes
   - total attempts
   - total certificates
   - average score
   - pass rate
4. Backend returns stats response.

### Business Rules

- Only owner can view organization stats.
- Stats must be scoped to organization.

### Expected Result

Owner sees organization performance overview.

---

## SC-043: Owner Views Program Statistics

### Actor

Organization Owner

### Goal

View statistics for a specific program.

### Preconditions

- Program exists.
- User owns program organization.

### Main Flow

1. Owner requests program stats.
2. Backend checks program ownership.
3. Backend calculates:
   - total enrollments
   - active enrollments
   - resources count
   - quizzes count
   - attempts count
   - passed attempts
   - certificates issued
   - average score
4. Backend returns stats response.

### Business Rules

- Only owner can view program stats.
- Stats are program-scoped.

### Expected Result

Owner sees program performance overview.

---

## SC-044: Owner Views Quiz Statistics

### Actor

Organization Owner

### Goal

View statistics for a quiz.

### Preconditions

- Quiz exists.
- User owns quiz program organization.

### Main Flow

1. Owner requests quiz stats.
2. Backend checks quiz ownership.
3. Backend calculates:
   - attempts count
   - submitted attempts
   - average score
   - highest score
   - lowest score
   - pass count
   - fail count
   - pass rate
4. Backend returns stats response.

### Business Rules

- Only owner can view quiz stats.
- Stats are quiz-scoped.

### Expected Result

Owner sees quiz analytics.

---

# 14. Audit Log Scenarios

---

## SC-045: System Records Audit Log for Business Action

### Actor

System

### Goal

Track important business/security actions.

### Preconditions

- A sensitive or important action occurs.

### Main Flow

1. Business action succeeds.
2. Backend creates audit log:
   - actorUserId
   - organizationId
   - action
   - entityType
   - entityId
   - ipAddress
   - userAgent
   - metadata
   - createdAt

### Business Rules

Audit logs should be created for:

- organization created
- organization updated
- member added
- member removed
- program created
- program published
- invitation created
- user joined program
- resource created
- quiz created
- quiz published
- attempt submitted
- certificate issued
- certificate revoked

Audit metadata must not include:

- raw Clerk tokens
- secrets
- API keys
- private credentials

### Expected Result

Important actions are traceable.

---

# 15. Security and Authorization Scenarios

---

## SC-046: Invalid Clerk Token Is Rejected

### Actor

Unauthenticated or Invalid User

### Goal

Access protected endpoint with invalid token.

### Preconditions

- Token is missing, expired, malformed, or invalid.

### Main Flow

1. User sends request to protected endpoint.
2. Backend attempts to verify Clerk token.
3. Verification fails.
4. Backend rejects request.

### Business Rules

- Protected endpoints require valid Clerk authentication.
- Public certificate verification does not require authentication.

### Expected Result

System returns unauthorized response.

---

## SC-047: Participant Tries to Manage Organization

### Actor

Organization Participant

### Goal

Update organization or manage members.

### Preconditions

- User is participant, not owner.

### Main Flow

1. Participant sends owner-only request.
2. Backend checks organization owner permission.
3. Permission check fails.
4. Backend rejects request.

### Business Rules

- Participants cannot manage organization.
- Owner-only actions must use `ensureOrganizationOwner`.

### Expected Result

System returns forbidden response.

---

## SC-048: Unenrolled User Tries to View Program Resources

### Actor

Authenticated User

### Goal

View resources for program they are not enrolled in.

### Preconditions

- User is authenticated.
- User is not enrolled in program.
- User is not owner.

### Main Flow

1. User requests program resources.
2. Backend checks program enrollment or ownership.
3. Check fails.
4. Backend rejects request.

### Business Rules

- Program resources are private.
- Only owners and enrolled participants can view.

### Expected Result

System returns forbidden response.

---

## SC-049: User Tries to Submit Another User's Attempt

### Actor

Authenticated User

### Goal

Submit attempt that does not belong to them.

### Preconditions

- Attempt exists.
- Attempt belongs to another user.

### Main Flow

1. User sends submit request for attemptId.
2. Backend checks attempt owner.
3. Check fails.
4. Backend rejects request.

### Business Rules

- Attempts can only be submitted by their owner.
- Owners cannot submit on behalf of participants in MVP.

### Expected Result

System returns forbidden response.

---

## SC-050: Owner Tries to Access Another Organization's Data

### Actor

Organization Owner

### Goal

Access data of organization they do not own.

### Preconditions

- User owns Organization A.
- User does not own Organization B.

### Main Flow

1. User requests owner-only data for Organization B.
2. Backend checks ownership.
3. Check fails.
4. Backend rejects request.

### Business Rules

- Ownership is organization-scoped.
- Owner in one organization is not owner everywhere.

### Expected Result

System returns forbidden or not found response.

---

# 16. Storage Scenarios

---

## SC-051: Owner Uploads Organization Logo to Cloudinary

### Actor

Organization Owner

### Goal

Upload or update organization logo.

### Preconditions

- User owns organization.
- Cloudinary is configured.

### Main Flow

1. Owner requests signed Cloudinary upload or uploads through backend.
2. Backend checks organization ownership.
3. Image is uploaded to Cloudinary.
4. Backend stores logo URL in organization.
5. Backend writes audit log.

### Business Rules

- Cloudinary is preferred for images.
- Store URL/public ID, not raw file content.

### Expected Result

Organization logo is updated.

---

## SC-052: Owner Uploads Program Cover Image to Cloudinary

### Actor

Organization Owner

### Goal

Upload program cover image.

### Preconditions

- Program exists.
- User owns organization.
- Cloudinary is configured.

### Main Flow

1. Owner uploads cover image.
2. Backend checks program ownership.
3. Image is stored in Cloudinary.
4. Backend stores `cover_image_url`.
5. Backend writes audit log.

### Business Rules

- Only owner can update program cover.
- Cloudinary handles optimization and delivery.

### Expected Result

Program cover image is updated.

---

## SC-053: Owner Uploads PDF Resource to R2

### Actor

Organization Owner

### Goal

Upload PDF resource for workshop.

### Preconditions

- Program exists.
- User owns organization.
- R2 is configured.

### Main Flow

1. Owner uploads PDF or requests pre-signed upload URL.
2. Backend checks ownership.
3. File is stored in R2.
4. Backend creates program resource:
   - type = FILE
   - storage_provider = R2
   - object_key
   - url if available
5. Backend writes audit log.

### Business Rules

- R2 is preferred for files/PDFs.
- Database stores file metadata only.

### Expected Result

PDF resource is available to enrolled participants.

---

# 17. Full Happy Path Scenario

---

## SC-054: Complete Workshop Flow From Creation to Certificate

### Actor

Organization Owner and Program Participant

### Goal

Run a full workshop and issue certificates.

### Preconditions

- Owner and participants have Clerk accounts.
- Backend user sync works.
- Neon DB is connected.
- Storage providers are configured if resources/certificates use files.

### Main Flow

1. Owner logs in through Clerk.
2. Backend syncs owner profile.
3. Owner creates organization.
4. Backend creates owner membership.
5. Owner creates program/workshop.
6. Owner publishes program.
7. Owner creates invitation link.
8. Participant logs in through Clerk.
9. Backend syncs participant profile.
10. Participant joins program using invitation link.
11. Owner adds resources.
12. Owner creates quiz.
13. Owner adds questions and options.
14. Owner publishes quiz.
15. Participant views published quiz.
16. Participant starts attempt.
17. Participant submits answers.
18. Backend calculates score.
19. Backend marks attempt passed.
20. Backend auto-issues certificate.
21. Backend stores certificate snapshots.
22. Optional: backend generates PDF/QR metadata.
23. Participant views own certificate.
24. Visitor verifies certificate publicly.

### Business Rules

- All owner actions require organization ownership.
- All participant quiz/resource actions require program enrollment.
- Backend calculates score.
- Certificate requires passing attempt.
- Public verification exposes safe data only.

### Expected Result

Workshop is completed and certificate is verifiable.

---

# 18. Edge Cases and Special Scenarios

---

## SC-055: Invitation Used After Expiration

### Actor

Authenticated User

### Goal

Join program with expired invitation.

### Expected Result

System rejects request with business rule error.

---

## SC-056: Invitation Used After Max Uses Reached

### Actor

Authenticated User

### Goal

Join program with invitation that reached max uses.

### Expected Result

System rejects request with business rule error.

---

## SC-057: User Already Enrolled Uses Invitation Again

### Actor

Program Participant

### Goal

Join same program again.

### Expected Result

System rejects duplicate active enrollment or returns existing enrollment depending on policy.

---

## SC-058: Participant Exceeds Max Quiz Attempts

### Actor

Program Participant

### Goal

Start another attempt after reaching max attempts.

### Expected Result

System rejects request with business rule error.

---

## SC-059: Quiz Is Archived Before Attempt

### Actor

Program Participant

### Goal

Start attempt for archived quiz.

### Expected Result

System rejects request.

---

## SC-060: Quiz Is Archived After Attempt Started

### Actor

Program Participant

### Goal

Submit already-started attempt after quiz archive.

### Product Policy Options

Option A:

- Allow submission if attempt started before archive.

Option B:

- Reject submission if quiz no longer active.

Recommended MVP policy:

- Allow submission for already-started attempts.
- Do not allow new attempts.

---

## SC-061: Owner Changes Organization Name After Certificate Issued

### Actor

Organization Owner

### Goal

Update organization name.

### Expected Result

Existing certificates keep old organization name snapshot.

---

## SC-062: User Changes Name After Certificate Issued

### Actor

Certificate Owner

### Goal

Change account name.

### Expected Result

Existing certificates keep old participant name snapshot.

---

## SC-063: Certificate Verification Code Collision

### Actor

System

### Goal

Generate unique verification code.

### Expected Result

System retries generation or fails safely if unique constraint is violated.

---

## SC-064: R2 Upload Fails

### Actor

Organization Owner

### Goal

Upload file resource.

### Expected Result

System returns storage error and does not create invalid resource record.

---

## SC-065: Cloudinary Upload Fails

### Actor

Organization Owner

### Goal

Upload image.

### Expected Result

System returns media upload error and does not update image URL.

---

# 19. Recommended Authorization Methods

The backend should include an `AuthorizationService` with methods such as:

```text
ensureOrganizationOwner(organizationId)
ensureOrganizationMember(organizationId)
ensureProgramOwner(programId)
ensureProgramEnrollment(programId, userId)
ensureInvitationOwner(invitationId)
ensureResourceOwner(resourceId)
ensureQuizOwner(quizId)
ensureQuizAccessible(quizId)
ensureAttemptOwner(attemptId)
ensureCertificateAccessible(certificateId)
```

---

# 20. Final Rule

The most important system rule:

```text
Authentication comes from Clerk.
Relational data is stored in Neon PostgreSQL.
Files/PDFs are stored in Cloudflare R2.
Images/media are stored in Cloudinary.
Organization permissions come from organization_memberships.
Program access comes from program_enrollments.
Scores are calculated by the backend.
Certificates are verified publicly using safe snapshot data.
```
