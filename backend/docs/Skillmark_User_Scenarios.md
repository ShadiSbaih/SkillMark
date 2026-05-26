# Skillmark User Scenarios

## Full User Scenario Coverage — Version 2.0

This document describes the complete user scenarios for the expanded **Skillmark** platform.

Skillmark is a university-focused training, assessment, and certification backend platform.

It supports:

- Clerk authentication and webhook sync
- organizations and organization memberships
- programs and workshops
- program enrollments
- invitation links
- program resources
- quizzes, questions, and options
- quiz attempts with timing enforcement
- automatic scoring
- certificates with AUTO and MANUAL issuance
- public certificate verification
- statistics
- audit logs
- Cloudflare R2 file storage
- Cloudinary image and media management

---

# 1. User Types

Skillmark has four main user types:

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
3. Frontend calls:
   ```
   GET /api/v1/public/certificates/verify/{verificationCode}
   ```
4. Backend searches certificate by verification code.
5. Backend returns safe public certificate data.

### Business Rules

- No authentication is required.
- The response must not expose sensitive user data such as internal user IDs or emails.
- The response must include:
  - certificateStatus
  - participantNameSnapshot
  - quizTitleSnapshot
  - programTitleSnapshot
  - organizationNameSnapshot
  - issuedAt
  - isRevoked
  - revokedAt (if revoked)
  - revokeReason (if revoked)

### Alternative / Error Flows

- Verification code does not exist: return HTTP 404.
- Certificate is REVOKED: return certificate data with `isRevoked = true` and revocation details.

### Expected Result

Visitor can confirm whether the certificate is valid, revoked, or not found.

---

## SC-002: Visitor Tries to Access Private Endpoint

### Actor

Unauthenticated Visitor

### Goal

Access a private program, resource, or quiz endpoint without authentication.

### Preconditions

- Visitor is not logged in.
- Target endpoint requires authentication.

### Main Flow

1. Visitor sends request to a private endpoint.
2. Spring Security filter checks for Authorization header.
3. Authorization header is missing or token is absent.
4. Backend rejects the request.

### Business Rules

- All private endpoints require a valid Clerk JWT token in the Authorization header.
- The public certificate verification endpoint does not require authentication.

### Expected Result

System returns HTTP 401 Unauthorized.

---

## SC-003: Visitor Opens Invitation Link Without Login

### Actor

Unauthenticated Visitor

### Goal

Join a program through an invitation link without being logged in.

### Preconditions

- A valid invitation link exists.
- Visitor is not authenticated.

### Main Flow

1. Visitor opens the invitation link in a browser.
2. Frontend detects the user is not logged in.
3. Frontend redirects user to Clerk sign-in or sign-up page.
4. After successful Clerk authentication, user is returned to the invitation flow.
5. Frontend calls:
   ```
   POST /api/v1/invitations/{code}/join
   ```
6. Backend validates invitation and creates enrollment.

### Business Rules

- Joining a program requires a valid Clerk session.
- Invitation validation happens only after the user is authenticated.
- The invitation code must still be valid at the time of the join request.

### Expected Result

Visitor is redirected to authenticate before being allowed to join the program.

---

# 4. Authentication and User Sync Scenarios

---

## SC-004: User First Login and Backend Profile Auto-Creation

### Actor

Authenticated User

### Goal

Automatically create a local backend user profile on first authenticated API request.

### Preconditions

- User has successfully authenticated via Clerk.
- User does not yet exist in the local `users` table.

### Main Flow

1. User logs in through Clerk.
2. Frontend includes Clerk JWT token in the Authorization header.
3. Backend Spring Security filter intercepts the request.
4. Backend verifies the JWT token using Clerk JWKS endpoint.
5. Backend extracts `clerkUserId` from the token `sub` claim.
6. Backend queries local `users` table by `clerk_user_id`.
7. Local user not found.
8. Backend creates local user record from token claims:
   - `clerk_user_id` from `sub`
   - `name` from token claims
   - `email` from token claims
   - `avatar_url` from token claims if available
   - `status = ACTIVE`
9. Backend stores resolved user in Spring SecurityContext.
10. Request proceeds to the controller.

### Business Rules

- `clerk_user_id` must be unique in the local users table.
- Backend must never store passwords.
- Clerk is the source of truth for authentication identity.
- The local users table is used only for domain relationships.
- Auto-creation must be idempotent.

### Alternative / Error Flows

- Invalid or expired Clerk token: return HTTP 401.
- Clerk token missing required claims: log error and return HTTP 401.

### Expected Result

Local user profile is created automatically on first authenticated request.

---

## SC-005: Clerk Webhook Creates User on Registration

### Actor

Clerk (System)

### Goal

Proactively create a local user record when a user registers via Clerk.

### Preconditions

- Clerk webhook is configured with `CLERK_WEBHOOK_SECRET`.
- Clerk sends `user.created` event.

### Main Flow

1. User registers through Clerk.
2. Clerk sends `user.created` webhook event to:
   ```
   POST /api/v1/webhooks/clerk
   ```
3. Backend verifies webhook signature using `CLERK_WEBHOOK_SECRET`.
4. Backend parses the event payload.
5. Backend checks if user already exists by `clerk_user_id`.
6. If not found: backend creates local user record.
7. If found: backend skips creation (idempotent).

### Business Rules

- Webhook signature must be verified before processing.
- Requests with invalid or missing signatures must return HTTP 401.
- Webhook processing must be idempotent.
- Duplicate events must not create duplicate users.

### Expected Result

Local user record exists before the user makes their first API request.

---

## SC-006: Clerk Webhook Updates User Profile

### Actor

Clerk (System)

### Goal

Sync user profile changes when a user updates their Clerk account.

### Preconditions

- Clerk webhook is configured.
- Clerk sends `user.updated` event.
- Local user exists.

### Main Flow

1. User updates their name, email, or avatar in Clerk.
2. Clerk sends `user.updated` webhook event.
3. Backend verifies webhook signature.
4. Backend finds local user by `clerk_user_id`.
5. Backend updates:
   - `name`
   - `email`
   - `avatar_url`
   - `updated_at`

### Business Rules

- Certificate snapshots are NOT updated when a user renames themselves.
- Snapshots were captured at issuance time and remain as-is.

### Expected Result

Local user profile reflects the latest Clerk account data.

---

## SC-007: Clerk Webhook Deactivates Deleted User

### Actor

Clerk (System)

### Goal

Deactivate local user when their Clerk account is deleted.

### Preconditions

- Clerk webhook is configured.
- Clerk sends `user.deleted` event.
- Local user exists.

### Main Flow

1. User is deleted from Clerk.
2. Clerk sends `user.deleted` webhook event.
3. Backend verifies webhook signature.
4. Backend finds local user by `clerk_user_id`.
5. Backend sets user `status = DELETED`.
6. Backend does not hard delete the user record.
7. Historical data (attempts, certificates, enrollments) is preserved.

### Business Rules

- Soft delete only.
- Historical records must be preserved.
- Deleted user can no longer authenticate.

### Expected Result

Local user is deactivated without losing historical data.

---

## SC-008: Authenticated User Views Own Profile

### Actor

Authenticated User

### Goal

View own local backend profile.

### Preconditions

- User has a valid Clerk token.
- Local user profile exists.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/users/me
   ```
2. Backend verifies Clerk token.
3. Backend resolves local user from SecurityContext.
4. Backend returns user profile response.

### Business Rules

- Response must not expose sensitive internal data.
- User can only view their own profile.

### Expected Result

User receives their own profile data.

---

# 5. Organization Scenarios

---

## SC-009: Authenticated User Creates Organization

### Actor

Authenticated User

### Goal

Create a new organization and become its owner.

### Preconditions

- User is authenticated.
- Local user profile exists.

### Main Flow

1. User sends request:
   ```
   POST /api/v1/organizations
   ```
   with organization data (name, description, etc.).
2. Backend validates organization data.
3. Within a single transaction:
   - Backend creates organization record with `owner_id = currentUserId`.
   - Backend creates organization membership:
     - `role = OWNER`
     - `status = ACTIVE`
     - `joined_at = now`
4. Backend writes audit log entry: `ORGANIZATION_CREATED`.
5. Backend returns organization response with HTTP 201.

### Business Rules

- Any authenticated user can create an organization.
- Organization creation and owner membership must happen in one transaction.
- Creator automatically becomes the organization owner.

### Alternative / Error Flows

- Missing or invalid organization name: return HTTP 400 with field-level error.
- Transaction failure: roll back both records and return HTTP 500.

### Expected Result

Organization is created and current user is set as owner.

---

## SC-010: Owner Views Accessible Organizations

### Actor

Authenticated User

### Goal

View all organizations they own or belong to.

### Preconditions

- User is authenticated.
- User has one or more active organization memberships.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/organizations
   ```
2. Backend resolves current user.
3. Backend queries active organization memberships for current user.
4. Backend returns accessible organizations with pagination.

### Business Rules

- User must not see organizations they have no membership in.
- Soft deleted organizations must be excluded.
- Response must be paginated.

### Expected Result

User receives only organizations they can access.

---

## SC-011: Owner Views Organization Details

### Actor

Organization Owner or Organization Member

### Goal

View details of a specific organization.

### Preconditions

- Organization exists.
- User is an active member or owner.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/organizations/{organizationId}
   ```
2. Backend verifies current user is an active member.
3. Backend returns organization details.

### Business Rules

- Unrelated users receive HTTP 404, not HTTP 403, to prevent leaking organization existence.

### Expected Result

User receives organization details.

---

## SC-012: Owner Updates Organization

### Actor

Organization Owner

### Goal

Update owned organization details.

### Preconditions

- User is authenticated.
- User has OWNER role in the organization.

### Main Flow

1. Owner sends request:
   ```
   PUT /api/v1/organizations/{organizationId}
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend validates update request.
4. Backend updates organization fields.
5. Backend writes audit log entry: `ORGANIZATION_UPDATED`.
6. Backend returns updated organization.

### Business Rules

- Only the organization owner can update.
- Updating the organization name does not affect existing certificate snapshots.

### Alternative / Error Flows

- Participant tries to update: return HTTP 403.
- Unrelated user tries to update: return HTTP 404.

### Expected Result

Organization details are updated successfully.

---

## SC-013: Owner Soft Deletes Organization

### Actor

Organization Owner

### Goal

Disable or delete organization while preserving historical data.

### Preconditions

- User is owner.

### Main Flow

1. Owner sends request:
   ```
   DELETE /api/v1/organizations/{organizationId}
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend sets `status = DELETED` and `deleted_at = now`.
4. Backend writes audit log entry: `ORGANIZATION_DELETED`.
5. Backend returns HTTP 204.

### Business Rules

- Soft delete only, no hard delete.
- Child records (programs, enrollments, certificates, attempts) are preserved.
- Soft deleted organizations are excluded from all list responses.
- Soft deleted organizations cannot be restored in the MVP.

### Expected Result

Organization is soft deleted and historical data is preserved.

---

## SC-014: Owner Adds Organization Member

### Actor

Organization Owner

### Goal

Add a user as a PARTICIPANT member of the organization.

### Preconditions

- Owner is authenticated.
- Target user exists in the local users table.
- Target user is not already an active member.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/organizations/{organizationId}/members
   ```
   with `userId` in the body.
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend checks target user exists in local users table.
4. Backend checks no active membership exists for that user in that organization.
5. Backend creates membership:
   - `role = PARTICIPANT`
   - `status = ACTIVE`
   - `invited_by = currentUserId`
   - `joined_at = now`
6. Backend writes audit log entry: `MEMBER_ADDED`.
7. Backend returns membership response with HTTP 201.

### Business Rules

- Only owner can add members.
- Duplicate active membership must return HTTP 409.
- MVP supports OWNER and PARTICIPANT roles only.
- Target user must exist in the local backend users table.

### Alternative / Error Flows

- Target user not found locally: return HTTP 404.
- Duplicate active membership: return HTTP 409.
- Non-owner tries to add member: return HTTP 403.

### Expected Result

Target user becomes an organization participant.

---

## SC-015: Owner Lists Organization Members

### Actor

Organization Owner

### Goal

View all members of an owned organization.

### Preconditions

- User owns the organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/organizations/{organizationId}/members
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend returns paginated membership list.

### Business Rules

- Only owner can list all members.
- Removed members should be excluded from the default response.

### Expected Result

Owner sees a paginated list of organization members.

---

## SC-016: Owner Removes Organization Member

### Actor

Organization Owner

### Goal

Remove a participant from the organization.

### Preconditions

- Owner is authenticated.
- Target user is an active organization member.

### Main Flow

1. Owner sends request:
   ```
   DELETE /api/v1/organizations/{organizationId}/members/{userId}
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend finds active membership for target user.
4. Backend sets membership:
   - `status = REMOVED`
   - `removed_by = currentUserId`
   - `removed_at = now`
5. Backend writes audit log entry: `MEMBER_REMOVED`.
6. Backend returns HTTP 204.

### Business Rules

- Removed members immediately lose access to protected organization data.
- Historical attempts and certificates are preserved.
- Soft removal only, no hard delete.
- The owner cannot remove themselves using this endpoint in the MVP.

### Alternative / Error Flows

- Target user is not a member: return HTTP 404.
- Non-owner tries to remove: return HTTP 403.

### Expected Result

Member loses organization access and historical data is preserved.

---

# 6. Program Scenarios

---

## SC-017: Owner Creates Program

### Actor

Organization Owner

### Goal

Create a training program or workshop inside an organization.

### Preconditions

- User owns the organization.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/organizations/{organizationId}/programs
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend validates program data.
4. Backend creates program with:
   - `status = DRAFT`
   - `is_published = false` as a compatibility mirror of `status`
5. Backend writes audit log entry: `PROGRAM_CREATED`.
6. Backend returns program response with HTTP 201.

### Business Rules

- Only organization owner can create programs.
- Program belongs to exactly one organization.
- Draft programs are visible to owners only.

### Expected Result

Program is created as a draft.

---

## SC-018: Owner Updates Program

### Actor

Organization Owner

### Goal

Update program details.

### Preconditions

- Program exists.
- User owns the program's organization.

### Main Flow

1. Owner sends request:
   ```
   PUT /api/v1/programs/{programId}
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend validates the update request.
4. Backend updates program fields.
5. Backend writes audit log entry: `PROGRAM_UPDATED`.
6. Backend returns updated program.

### Business Rules

- Only owner can update.
- Archived or soft deleted programs may have restricted updates.

### Expected Result

Program details are updated.

---

## SC-019: Owner Publishes Program

### Actor

Organization Owner

### Goal

Make a program visible and active for enrolled participants.

### Preconditions

- Program exists.
- Program status is DRAFT.
- User owns the program's organization.

### Main Flow

1. Owner sends request:
   ```
   PATCH /api/v1/programs/{programId}/status
   Body: { "status": "PUBLISHED" }
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend validates required program fields are complete.
4. Backend sets:
   - `status = PUBLISHED`
   - `is_published = true` derived from `status`
5. Backend writes audit log entry: `PROGRAM_PUBLISHED`.
6. Backend returns updated program.

### Business Rules

- Only owner can publish.
- Published programs are accessible to enrolled participants.
- Program `status` is the source of truth; `is_published` must only mirror `status = PUBLISHED`.

### Expected Result

Program becomes published and accessible.

---

## SC-020: Owner Archives Program

### Actor

Organization Owner

### Goal

Archive a completed or inactive program.

### Preconditions

- Program exists.
- User owns the program's organization.

### Main Flow

1. Owner sends request:
   ```
   PATCH /api/v1/programs/{programId}/status
   Body: { "status": "ARCHIVED" }
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend sets `status = ARCHIVED`.
4. Backend writes audit log entry: `PROGRAM_ARCHIVED`.
5. Backend returns updated program.

### Business Rules

- Archived programs do not accept new enrollments.
- No new quiz attempts are allowed in archived programs.
- Historical data (enrollments, resources, attempts, certificates) is preserved.

### Expected Result

Program is archived and preserved safely.

---

## SC-021: Participant Views Enrolled Programs

### Actor

Program Participant

### Goal

View programs they are enrolled in.

### Preconditions

- User is authenticated.
- User has active program enrollments.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/enrollments/me
   ```
2. Backend resolves current user.
3. Backend queries active program enrollments for current user.
4. Backend returns enrolled programs with pagination.

### Business Rules

- User sees only their own enrollments.
- Removed enrollments are excluded from the default response.

### Expected Result

User sees a list of their enrolled programs.

---

# 7. Enrollment Scenarios

---

## SC-022: Owner Manually Enrolls a User

### Actor

Organization Owner

### Goal

Enroll a user directly into a program without an invitation link.

### Preconditions

- Owner is authenticated.
- Target user exists in local users table.
- Program exists under owned organization.
- No active enrollment exists for that user.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/programs/{programId}/enrollments
   Body: { "userId": "..." }
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend checks target user exists locally.
4. Backend checks no active enrollment exists.
5. Backend creates enrollment:
   - `status = ACTIVE`
   - `enrolled_at = now`
6. Backend adds user as PARTICIPANT organization member if not already a member.
7. Backend writes audit log entry: `USER_ENROLLED`.
8. Backend returns enrollment response with HTTP 201.

### Business Rules

- Only owner can manually enroll users.
- Duplicate active enrollment returns HTTP 409.
- Enrollment and membership creation must be transactional.

### Alternative / Error Flows

- Target user not found: return HTTP 404.
- Duplicate enrollment: return HTTP 409.
- Program is archived: return HTTP 422.

### Expected Result

Target user is enrolled in the program.

---

## SC-023: Owner Views Program Enrollments

### Actor

Organization Owner

### Goal

View all enrollments for a specific program.

### Preconditions

- Program exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/programs/{programId}/enrollments
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend returns paginated enrollment list.

### Expected Result

Owner sees a list of enrolled participants.

---

## SC-024: Owner Removes a Program Enrollment

### Actor

Organization Owner

### Goal

Remove a participant's enrollment from a program.

### Preconditions

- Enrollment exists.
- User owns the program's organization.

### Main Flow

1. Owner sends request:
   ```
   DELETE /api/v1/programs/{programId}/enrollments/{userId}
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend finds active enrollment for target user.
4. Backend sets:
   - `status = REMOVED`
   - `removed_at = now`
5. Backend writes audit log entry: `ENROLLMENT_REMOVED`.
6. Backend returns HTTP 204.

### Business Rules

- Removed participant loses access to program resources and quizzes.
- Historical attempts and certificates are preserved.

### Expected Result

Participant loses program access and historical data is preserved.

---

# 8. Invitation Link Scenarios

---

## SC-025: Owner Creates Invitation Link

### Actor

Organization Owner

### Goal

Create a shareable invitation link for a program.

### Preconditions

- Program exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/programs/{programId}/invitations
   ```
   with optional fields:
   - `description`
   - `maxUses`
   - `expiresAt`
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend generates a unique 12-character uppercase alphanumeric code using SecureRandom.
4. Backend verifies code uniqueness in the database.
5. Backend creates invitation link:
   - `status = ACTIVE`
   - `used_count = 0`
   - `created_by = currentUserId`
   - `created_at = now`
6. Backend writes audit log entry: `INVITATION_CREATED`.
7. Backend returns invitation with code and HTTP 201.

### Business Rules

- Only owner can create invitation links.
- Code must be unique across all invitation links.
- `maxUses = null` means unlimited uses.
- `expiresAt = null` means no expiry.

### Expected Result

Owner can share the invitation code with participants.

---

## SC-026: User Joins Program by Invitation Code

### Actor

Authenticated User

### Goal

Join a program using a valid invitation code.

### Preconditions

- User is authenticated.
- Invitation link exists with status ACTIVE.
- Invitation is not expired.
- Usage limit is not exceeded.

### Main Flow

1. User sends request:
   ```
   POST /api/v1/invitations/{code}/join
   ```
2. Backend verifies Clerk token and resolves current user.
3. Backend finds invitation by code (case-insensitive lookup).
4. Backend validates invitation:
   - `status = ACTIVE`
   - `expires_at` is null or in the future
   - `max_uses` is null or `used_count < max_uses`
5. Backend checks program `status = PUBLISHED` and `deleted_at` is null.
6. Backend checks no active enrollment exists for current user in program.
7. Within a single transaction with row-level locking, optimistic locking, or an atomic conditional update:
   - Backend checks and increments `used_count` atomically.
   - Backend creates program enrollment with `status = ACTIVE`.
   - Backend adds user as PARTICIPANT organization member if not already a member.
8. Backend writes audit log entry: `USER_JOINED_BY_INVITATION`.
9. Backend returns enrollment response with HTTP 201.

### Business Rules

- User must be authenticated.
- Expired invitations must be rejected with HTTP 422.
- Disabled invitations must be rejected with HTTP 422.
- Max uses must be enforced before creating enrollment.
- Concurrent joins must never allow `used_count` to exceed `max_uses`.
- Duplicate active enrollment must be rejected with HTTP 409.
- The entire join operation must be transactional.

### Alternative / Error Flows

- Invitation not found: return HTTP 404.
- Invitation is DISABLED: return HTTP 422 with message.
- Invitation is expired: return HTTP 422 with message.
- Max uses reached: return HTTP 422 with message.
- Already enrolled: return HTTP 409 with message.
- Program is archived: return HTTP 422 with message.

### Expected Result

User becomes actively enrolled in the program.

---

## SC-027: Owner Disables Invitation Link

### Actor

Organization Owner

### Goal

Prevent an invitation link from being used further.

### Preconditions

- Invitation exists.
- User owns the invitation's organization.

### Main Flow

1. Owner sends request:
   ```
   PATCH /api/v1/invitations/{invitationId}/status
   Body: { "status": "DISABLED" }
   ```
2. Backend calls `ensureInvitationOwner(invitationId)`.
3. Backend sets:
   - `status = DISABLED`
   - `disabled_at = now`
4. Backend writes audit log entry: `INVITATION_DISABLED`.
5. Backend returns updated invitation.

### Business Rules

- Disabled invitations cannot be used.
- Existing enrollments created before disabling remain active.

### Expected Result

Invitation link becomes unusable for new joins.

---

## SC-028: Owner Lists Invitation Links

### Actor

Organization Owner

### Goal

View all invitation links for a program.

### Preconditions

- Program exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/programs/{programId}/invitations
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend returns paginated invitation list.

### Expected Result

Owner sees all invitation links with their usage stats.

---

# 9. Resource Scenarios

---

## SC-029: Owner Adds External Link Resource

### Actor

Organization Owner

### Goal

Add a learning resource as an external URL link.

### Preconditions

- Program exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/programs/{programId}/resources
   ```
   with body:
   - `title`
   - `description`
   - `type = LINK`
   - `url`
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend validates URL format.
4. Backend creates resource:
   - `type = LINK`
   - `storage_provider = EXTERNAL`
   - `status = ACTIVE`
5. Backend writes audit log entry: `RESOURCE_CREATED`.
6. Backend returns resource with HTTP 201.

### Business Rules

- Only owner can create resources.
- LINK resources store only an external URL.
- No R2 or Cloudinary upload is required.

### Expected Result

External link resource is available to enrolled participants.

---

## SC-030: Owner Adds File Resource Using Cloudflare R2

### Actor

Organization Owner

### Goal

Add a downloadable file resource stored in Cloudflare R2.

### Preconditions

- Program exists under owned organization.
- R2 storage is configured.

### Main Flow

**Option A: Backend upload**

1. Owner sends file to backend upload endpoint.
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend calls `R2StorageService.uploadFile(...)`.
4. R2 returns `objectKey` and public URL.
5. Backend creates resource:
   - `type = FILE`
   - `storage_provider = R2`
   - `object_key`
   - `url`
6. Backend writes audit log entry: `RESOURCE_CREATED`.

**Option B: Presigned URL upload**

1. Owner requests presigned upload URL:
   ```
   POST /api/v1/files/r2/upload-url
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend generates presigned R2 URL.
4. Owner uploads file directly to R2 using presigned URL.
5. Owner confirms upload by creating resource with returned `objectKey`.

### Business Rules

- Storage logic must be inside `R2StorageService`.
- Controllers must not call R2 SDK directly.
- Database stores metadata only, not raw file bytes.
- If R2 upload fails, no resource record is created.

### Alternative / Error Flows

- R2 upload fails: return HTTP 500 storage error and do not create resource record.

### Expected Result

File resource is stored in R2 and linked to the program.

---

## SC-031: Owner Adds Image Resource Using Cloudinary

### Actor

Organization Owner

### Goal

Add an image resource stored in Cloudinary.

### Preconditions

- Program exists under owned organization.
- Cloudinary is configured.

### Main Flow

1. Owner sends image or requests signed Cloudinary upload:
   ```
   POST /api/v1/media/cloudinary/signature
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Owner uploads image directly to Cloudinary using the signature.
4. Owner creates resource with returned Cloudinary URL and public ID:
   ```
   POST /api/v1/programs/{programId}/resources
   ```
   with body:
   - `type = IMAGE`
   - `storage_provider = CLOUDINARY`
   - `url`
   - `object_key` (Cloudinary public ID)
5. Backend writes audit log entry: `RESOURCE_CREATED`.

### Business Rules

- Cloudinary is preferred for image assets.
- R2 is preferred for PDFs and binary files.
- Store Cloudinary URL and public ID in the database.

### Alternative / Error Flows

- Cloudinary upload fails: return media upload error and do not update resource URL.

### Expected Result

Image resource is added to the program with Cloudinary delivery URL.

---

## SC-032: Participant Views Program Resources

### Actor

Program Participant

### Goal

Access learning resources for an enrolled program.

### Preconditions

- User is authenticated.
- User has an active enrollment in the program.
- Resources exist.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/programs/{programId}/resources
   ```
2. Backend calls `ensureProgramEnrollment(programId, currentUserId)` or `ensureProgramOwner(programId)`.
3. Backend returns active resources ordered by `position`.

### Business Rules

- Unenrolled users receive HTTP 404.
- Archived resources are not returned to participants.
- Resources with `visibleToParticipants = false` are not returned to participants.
- Owners can view all resources regardless of status.

### Expected Result

Participant can access program learning materials.

---

## SC-033: Owner Updates Resource

### Actor

Organization Owner

### Goal

Update details of an existing resource.

### Preconditions

- Resource exists under owned program.

### Main Flow

1. Owner sends request:
   ```
   PUT /api/v1/resources/{resourceId}
   ```
2. Backend calls `ensureResourceOwner(resourceId)`.
3. Backend validates update.
4. Backend updates resource fields.
5. Backend writes audit log entry: `RESOURCE_UPDATED`.
6. Backend returns updated resource.

### Expected Result

Resource details are updated.

---

## SC-034: Owner Hides or Archives Resource

### Actor

Organization Owner

### Goal

Hide a resource from participants without deleting it, or archive it when it is no longer needed.

### Preconditions

- Resource exists under owned program.

### Main Flow

1. Owner sends request:
   ```
   PATCH /api/v1/resources/{resourceId}/visibility
   Body: { "visibleToParticipants": false }
   ```
2. Backend calls `ensureResourceOwner(resourceId)`.
3. Backend sets `visibleToParticipants = false`.
4. Backend writes audit log entry: `RESOURCE_UPDATED`.
5. Backend returns updated resource.

Optional archival flow:

1. Owner sends request:
   ```
   DELETE /api/v1/resources/{resourceId}
   ```
2. Backend sets `status = ARCHIVED`.
3. Backend writes audit log entry: `RESOURCE_ARCHIVED`.
4. Backend returns HTTP 204.

### Business Rules

- Prefer soft deletion (set status) for archival.
- Do not delete R2 or Cloudinary files unless explicitly required.

### Expected Result

Resource is hidden from participants or archived, depending on the chosen action.

---

# 10. Quiz Management Scenarios

---

## SC-035: Owner Creates Quiz

### Actor

Organization Owner

### Goal

Create a quiz inside a program.

### Preconditions

- Program exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/programs/{programId}/quizzes
   ```
   with body:
   - `title`
   - `description`
   - `passingScore` (1–100)
   - `durationMinutes` (minimum 1)
   - `maxAttempts` (minimum 1)
   - `certificateEnabled`
   - `certificateIssueMode` (AUTO, MANUAL, or NONE)
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend validates quiz settings.
4. Backend creates quiz:
   - `status = DRAFT`
   - `is_published = false` as a compatibility mirror of `status`
5. Backend writes audit log entry: `QUIZ_CREATED`.
6. Backend returns quiz with HTTP 201.

### Business Rules

- Only owner can create quizzes.
- `passingScore` must be between 1 and 100.
- `maxAttempts` must be at least 1.
- `durationMinutes` must be at least 1.
- Quiz `status` is the source of truth; `is_published` must only mirror `status = PUBLISHED`.

### Expected Result

Quiz is created as a draft.

---

## SC-036: Owner Adds Question to Quiz

### Actor

Organization Owner

### Goal

Add a question to a quiz.

### Preconditions

- Quiz exists under owned program.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/quizzes/{quizId}/questions
   ```
   with body:
   - `text`
   - `type` (SINGLE\_CHOICE)
   - `points` (positive integer)
   - `position`
2. Backend calls `ensureQuizOwner(quizId)`.
3. Backend validates question data.
4. Backend creates question.
5. Backend returns question with HTTP 201.

### Business Rules

- MVP supports SINGLE\_CHOICE only.
- Points must be a positive integer.
- Questions can be added only while the quiz has no submitted attempts.

### Expected Result

Question is added to the quiz.

---

## SC-037: Owner Adds Options to Question

### Actor

Organization Owner

### Goal

Add answer options to a quiz question.

### Preconditions

- Question exists under owned quiz.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/questions/{questionId}/options
   ```
   with body:
   - `text`
   - `isCorrect`
   - `position`
2. Backend calls `ensureQuizOwner` for the parent quiz.
3. Backend validates option data.
4. Backend creates option.
5. Backend returns option with HTTP 201.

### Business Rules

- A SINGLE\_CHOICE question must have exactly one `isCorrect = true` option at publish time.
- The system validates the correct-option count during quiz publishing, not necessarily at option creation time.
- Minimum two options per question are required before publishing.
- Options can be added only while the quiz has no submitted attempts.

### Expected Result

Options are added to the question.

---

## SC-038: Owner Updates Question

### Actor

Organization Owner

### Goal

Update an existing quiz question.

### Preconditions

- Question exists under owned quiz.

### Main Flow

1. Owner sends request:
   ```
   PUT /api/v1/questions/{questionId}
   ```
2. Backend calls `ensureQuizOwner` for the parent quiz.
3. Backend rejects the update with HTTP 422 if the quiz has submitted attempts.
4. Backend validates and updates question if no submitted attempts exist.
5. Backend returns updated question.

### Expected Result

Question is updated.

---

## SC-039: Owner Deletes Question

### Actor

Organization Owner

### Goal

Remove a question from a quiz.

### Preconditions

- Question exists under owned quiz.
- Quiz has no submitted attempts.

### Main Flow

1. Owner sends request:
   ```
   DELETE /api/v1/questions/{questionId}
   ```
2. Backend calls `ensureQuizOwner` for the parent quiz.
3. Backend rejects deletion with HTTP 422 if the quiz has submitted attempts.
4. Backend deletes the question and its associated options only if no submitted attempts exist.
5. Backend returns HTTP 204.

### Business Rules

- Questions/options referenced by submitted attempt answers must not be physically deleted.
- Future versioning or archiving may allow safe edits after attempts, but the MVP rejects destructive changes.

### Expected Result

Question and its options are removed only when historical submitted attempts are not affected.

---

## SC-040: Owner Updates Option

### Actor

Organization Owner

### Goal

Update an answer option.

### Preconditions

- Option exists under owned quiz question.

### Main Flow

1. Owner sends request:
   ```
   PUT /api/v1/options/{optionId}
   ```
2. Backend calls `ensureQuizOwner` for the parent quiz.
3. Backend rejects the update with HTTP 422 if the quiz has submitted attempts.
4. Backend validates and updates option if no submitted attempts exist.
5. Backend returns updated option.

### Expected Result

Option is updated.

---

## SC-041: Owner Deletes Option

### Actor

Organization Owner

### Goal

Remove an answer option from a question.

### Preconditions

- Option exists under owned quiz question.

### Main Flow

1. Owner sends request:
   ```
   DELETE /api/v1/options/{optionId}
   ```
2. Backend calls `ensureQuizOwner` for the parent quiz.
3. Backend rejects deletion with HTTP 422 if the quiz has submitted attempts.
4. Backend deletes the option only if no submitted attempts exist.
5. Backend returns HTTP 204.

### Business Rules

- Deleting the only correct option from a question invalidates the question for publishing.
- System enforces correct-option rules at publish time.
- Options referenced by submitted attempt answers must not be physically deleted.

### Expected Result

Option is removed from the question.

---

## SC-042: Owner Publishes Quiz

### Actor

Organization Owner

### Goal

Make a quiz available to enrolled participants.

### Preconditions

- Quiz exists under owned program.
- Quiz is in DRAFT status.

### Main Flow

1. Owner sends request:
   ```
   PATCH /api/v1/quizzes/{quizId}/status
   Body: { "status": "PUBLISHED" }
   ```
2. Backend calls `ensureQuizOwner(quizId)`.
3. Backend performs publish validation:
   - Quiz has at least one question.
   - Every question has at least two options.
   - Every SINGLE\_CHOICE question has exactly one `isCorrect = true` option.
   - `passingScore` is between 1 and 100.
   - `maxAttempts` is at least 1.
   - `durationMinutes` is at least 1.
4. If validation passes:
   - Backend sets `status = PUBLISHED`, `is_published = true`.
   - Backend writes audit log entry: `QUIZ_PUBLISHED`.
5. Backend returns updated quiz.

### Business Rules

- Invalid quizzes cannot be published.
- All validation must pass before status is changed.

### Alternative / Error Flows

- No questions: return HTTP 422 with message `Quiz must have at least one question`.
- SINGLE\_CHOICE question missing correct option: return HTTP 422 with message.
- SINGLE\_CHOICE question has multiple correct options: return HTTP 422 with message.
- Question has fewer than two options: return HTTP 422 with message.

### Expected Result

Quiz becomes available to enrolled participants.

---

## SC-043: Owner Hides or Archives Quiz

### Actor

Organization Owner

### Goal

Hide a quiz from participants or archive it to stop new attempts.

### Preconditions

- Quiz exists under owned program.

### Main Flow

1. Owner sends request:
   ```
   PATCH /api/v1/quizzes/{quizId}/visibility
   Body: { "visibleToParticipants": false }
   ```
2. Backend calls `ensureQuizOwner(quizId)`.
3. Backend sets `visibleToParticipants = false`.
4. Backend writes audit log entry: `QUIZ_UPDATED`.
5. Backend returns updated quiz.

Optional archival flow:

1. Owner sends request:
   ```
   PATCH /api/v1/quizzes/{quizId}/status
   Body: { "status": "ARCHIVED" }
   ```
2. Backend sets `status = ARCHIVED`.
3. Backend writes audit log entry: `QUIZ_ARCHIVED`.
4. Backend returns updated quiz.

### Business Rules

- Hidden quizzes do not appear in participant lists or direct access.
- Archived quizzes do not accept new attempts.
- Historical attempts and certificates remain consistent.
- Certificates issued before archiving remain valid unless separately revoked.

### Expected Result

Quiz is hidden from participants or archived, depending on the chosen action.

---

# 11. Quiz Attempt Scenarios

---

## SC-044: Participant Views Published Quizzes

### Actor

Program Participant

### Goal

View available quizzes inside an enrolled program.

### Preconditions

- User has an active enrollment in the program.
- Program has published quizzes.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/programs/{programId}/quizzes
   ```
2. Backend calls `ensureProgramEnrollment(programId, currentUserId)` or `ensureProgramOwner`.
3. Backend returns published quizzes that are visible to participants only.
4. Owners see all quizzes regardless of status.

### Business Rules

- Participants cannot view DRAFT or ARCHIVED quizzes.
- Participants cannot view quizzes hidden by the owner.

### Expected Result

Participant sees available published quizzes.

---

## SC-045: Participant Starts Quiz Attempt

### Actor

Program Participant

### Goal

Start a new quiz attempt.

### Preconditions

- User has an active enrollment in the program.
- Quiz is PUBLISHED.
- Quiz is visible to participants.
- User has not exceeded `maxAttempts`.
- No IN\_PROGRESS attempt exists for this user and quiz.

### Main Flow

1. User sends request:
   ```
   POST /api/v1/quizzes/{quizId}/attempts
   ```
2. Backend checks:
   - Quiz exists and `status = PUBLISHED`.
   - Quiz is visible to participants.
   - User has an active enrollment in the quiz's program.
   - Count of user's attempts for this quiz is less than `quiz.maxAttempts`.
   - No existing IN\_PROGRESS attempt for this user and quiz.
3. Backend creates attempt:
   - `status = IN_PROGRESS`
   - `started_at = now`
   - `expires_at = now + quiz.durationMinutes`
   - `attempt_number = count_of_previous_attempts + 1`
4. Backend returns attempt response with HTTP 201.

### Business Rules

- Unenrolled users receive HTTP 403.
- Quiz not published: return HTTP 404 or HTTP 422.
- Max attempts exceeded: return HTTP 422.
- Attempt timing is enforced server-side.

### Alternative / Error Flows

- Max attempts reached: return HTTP 422 with message.
- Quiz not published: return HTTP 404.
- User not enrolled: return HTTP 403.
- IN\_PROGRESS attempt already exists: return HTTP 409.

### Expected Result

Attempt is created and timing starts.

---

## SC-046: Participant Submits Quiz Attempt

### Actor

Program Participant

### Goal

Submit answers for an in-progress quiz attempt.

### Preconditions

- Attempt exists and belongs to current user.
- Attempt status is IN\_PROGRESS.
- Current time is before `attempt.expires_at`.

### Main Flow

1. User sends request:
   ```
   POST /api/v1/quiz-attempts/{attemptId}/submit
   ```
   with body:
   ```json
   {
     "answers": [
       { "questionId": "...", "selectedOptionId": "..." },
       { "questionId": "...", "selectedOptionId": "..." }
     ]
   }
   ```
2. Backend calls `ensureAttemptOwner(attemptId)`.
3. Backend checks attempt status is IN\_PROGRESS.
4. Backend checks `current time <= attempt.expires_at`.
5. Backend validates:
   - Each `questionId` belongs to the quiz.
   - Each `selectedOptionId` belongs to the corresponding question.
   - No duplicate `questionId` in answers.
6. Backend calculates score:
   - For each answer, check if `selectedOptionId.is_correct = true`.
   - Sum earned points.
   - Calculate `score_percentage = (earned_points / total_points) * 100`.
   - Set `is_passed = score_percentage >= quiz.passing_score`.
7. Backend saves attempt answers.
8. Backend updates attempt:
   - `status = SUBMITTED`
   - `submitted_at = now`
   - `total_points`
   - `earned_points`
   - `score_percentage`
   - `is_passed`
9. Backend writes audit log entry: `ATTEMPT_SUBMITTED`.
10. If `is_passed = true` and `quiz.certificate_issue_mode = AUTO`:
    - Backend triggers AUTO certificate issuance flow (SC-047).
11. Backend returns attempt result response.

### Business Rules

- Backend calculates all scores. Client score values are ignored.
- User cannot submit another user's attempt (HTTP 403).
- Already submitted attempt returns HTTP 409.
- Submission after `expires_at` returns HTTP 422.
- Invalid question or option combinations return HTTP 422.

### Alternative / Error Flows

- Attempt already submitted: return HTTP 409.
- Current time exceeds `expires_at`: return HTTP 422 with message.
- Question does not belong to quiz: return HTTP 422.
- Option does not belong to question: return HTTP 422.
- Attempt belongs to another user: return HTTP 403.

### Expected Result

Attempt is submitted and scored. Certificate may be automatically issued.

---

## SC-047: System AUTO-Issues Certificate After Passing Attempt

### Actor

System

### Goal

Automatically issue a certificate after a passing attempt when `certificateIssueMode = AUTO`.

### Preconditions

- Attempt was submitted successfully.
- `is_passed = true`.
- `quiz.certificate_enabled = true`.
- `quiz.certificate_issue_mode = AUTO`.

### Main Flow

1. Attempt submission flow completes (SC-046).
2. Backend checks certificate eligibility:
   - User has an active enrollment in the program.
   - Attempt is SUBMITTED and `is_passed = true`.
   - No ACTIVE certificate exists for this user and quiz.
3. Backend generates:
   - `certificate_number` in format `CERT-{YEAR}-{8_ALPHANUMERIC}`.
   - `verification_code` as 16-character uppercase alphanumeric using SecureRandom.
4. Backend captures snapshots at issuance time:
   - `participant_name_snapshot = user.name`
   - `quiz_title_snapshot = quiz.title`
   - `program_title_snapshot = program.title`
   - `organization_name_snapshot = organization.name`
5. Backend creates certificate record with `status = ACTIVE`.
6. Backend writes audit log entry: `CERTIFICATE_ISSUED`.
7. Attempt submission response includes certificate reference.

### Business Rules

- If certificate issuance fails: log the error, return attempt result without certificate reference, do NOT roll back the attempt submission.
- Duplicate ACTIVE certificate for same user and quiz returns HTTP 409.

### Expected Result

Certificate is issued automatically and included in the attempt response.

---

## SC-048: Participant Views Own Attempts

### Actor

Program Participant

### Goal

View own quiz attempt history.

### Preconditions

- User is authenticated.
- User has submitted at least one attempt.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/quiz-attempts/me
   ```
2. Backend resolves current user.
3. Backend returns paginated attempts where `user_id = currentUserId`.

### Business Rules

- User sees only their own attempts.
- Owners can view all attempts via the quiz-scoped endpoint.

### Expected Result

Participant sees their own quiz attempt history and scores.

---

## SC-049: Owner Views All Quiz Attempts

### Actor

Organization Owner

### Goal

View all attempts for a quiz in an owned program.

### Preconditions

- Quiz exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/quizzes/{quizId}/attempts
   ```
2. Backend calls `ensureQuizOwner(quizId)`.
3. Backend returns paginated attempts for the quiz.

### Expected Result

Owner sees all attempts with scores for the quiz.

---

# 12. Certificate Scenarios

---

## SC-050: Owner Manually Issues Certificate

### Actor

Organization Owner

### Goal

Issue a certificate manually for a passing attempt.

### Preconditions

- `quiz.certificate_issue_mode = MANUAL`.
- Attempt exists, is SUBMITTED, and `is_passed = true`.
- User owns the quiz's organization.
- No active certificate exists for this user and quiz.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/quiz-attempts/{attemptId}/certificate
   ```
2. Backend calls `ensureQuizOwner` for the attempt's quiz.
3. Backend validates eligibility:
   - Attempt is SUBMITTED.
   - `is_passed = true`.
   - No ACTIVE certificate for this user and quiz.
4. Backend generates certificate number and verification code.
5. Backend captures name snapshots.
6. Backend creates certificate with `status = ACTIVE`.
7. Backend writes audit log entry: `CERTIFICATE_ISSUED`.
8. Backend returns certificate with HTTP 201.

### Business Rules

- Failed attempts are not eligible (HTTP 422).
- Duplicate active certificate returns HTTP 409.
- Only owner can manually issue certificates.

### Expected Result

Certificate is issued manually by the owner.

---

## SC-051: Participant Views Own Certificates

### Actor

Program Participant

### Goal

View certificates issued to them.

### Preconditions

- User has at least one certificate.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/certificates/me
   ```
2. Backend resolves current user.
3. Backend returns paginated certificates where `user_id = currentUserId`.

### Business Rules

- Response may include `pdf_url` and `qr_code_url` if available.

### Expected Result

Participant sees their own certificates.

---

## SC-052: Owner Views Organization Certificates

### Actor

Organization Owner

### Goal

View all certificates issued under owned organization.

### Preconditions

- User owns the organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/certificates/organization/{organizationId}
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend returns paginated certificates for the organization.

### Expected Result

Owner sees all certificates issued under their organization.

---

## SC-053: Owner Revokes Certificate

### Actor

Organization Owner

### Goal

Revoke a certificate while preserving its history.

### Preconditions

- Certificate exists under owned organization.
- Certificate status is ACTIVE.

### Main Flow

1. Owner sends request:
   ```
   POST /api/v1/certificates/{certificateId}/revoke
   ```
   with body:
   - `revokeReason`
2. Backend calls `ensureCertificateAccessible(certificateId)` and checks ownership.
3. Backend sets:
   - `status = REVOKED`
   - `revoked_at = now`
   - `revoke_reason`
4. Backend writes audit log entry: `CERTIFICATE_REVOKED`.
5. Backend returns updated certificate.

### Business Rules

- Certificate is never deleted.
- Revoked certificate remains verifiable as REVOKED.
- Only owner can revoke certificates in their organization.

### Expected Result

Certificate is revoked and publicly verifiable as revoked.

---

## SC-054: Visitor Verifies a Revoked Certificate

### Actor

Unauthenticated Visitor

### Goal

Verify a certificate that has been revoked.

### Preconditions

- Certificate exists with `status = REVOKED`.

### Main Flow

1. Visitor sends request:
   ```
   GET /api/v1/public/certificates/verify/{verificationCode}
   ```
2. Backend finds certificate by verification code.
3. Backend returns safe public data with `isRevoked = true`.

### Business Rules

- Response clearly indicates revoked status.
- `revokedAt` and `revokeReason` are included in the response.
- Sensitive user data is not exposed.

### Expected Result

Visitor sees that the certificate is revoked.

---

## SC-055: System Stores Certificate PDF in Cloudflare R2

### Actor

System

### Goal

Store a generated certificate PDF and update the certificate record.

### Preconditions

- Certificate exists.
- PDF generation is enabled.
- R2 is configured.

### Main Flow

1. System generates certificate PDF.
2. System calls `R2StorageService.uploadFile(...)`.
3. R2 returns `objectKey` and public URL.
4. Backend updates certificate:
   - `pdf_url`
   - `pdf_object_key`

### Business Rules

- R2 is the preferred storage for certificate PDFs.
- Database stores metadata only.
- PDF generation may be deferred in the first MVP.

### Expected Result

Certificate has a downloadable PDF reference.

---

## SC-056: System Stores QR Code for Certificate

### Actor

System

### Goal

Generate and store a QR code for certificate public verification.

### Preconditions

- Certificate exists with a valid verification code.

### Main Flow

1. System generates QR code image encoding:
   ```
   https://{APP_CERTIFICATE_VERIFY_BASE_URL}/verify/{verificationCode}
   ```
2. System uploads QR image to R2 or Cloudinary.
3. Backend updates certificate:
   - `qr_code_url`
   - `qr_code_object_key`

### Business Rules

- QR code must point to the public verification URL.
- Database stores metadata only.

### Expected Result

Certificate has a QR code reference for public scanning.

---

# 13. Statistics Scenarios

---

## SC-057: Owner Views Organization Statistics

### Actor

Organization Owner

### Goal

View a high-level performance overview of the organization.

### Preconditions

- User owns the organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/organizations/{organizationId}/stats
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend calculates and returns:
   - total programs
   - total members
   - total enrolled participants
   - total quizzes
   - total attempts
   - total certificates issued
   - average score across all quizzes
   - overall pass rate

### Business Rules

- Only owner can view organization statistics.
- Statistics are scoped to the organization.

### Expected Result

Owner sees the organization performance overview.

---

## SC-058: Owner Views Program Statistics

### Actor

Organization Owner

### Goal

View statistics for a specific program.

### Preconditions

- Program exists under owned organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/programs/{programId}/stats
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend calculates and returns:
   - total enrollments
   - active enrollments
   - resources count
   - quizzes count
   - total attempts
   - passed attempts count
   - certificates issued count
   - average score

### Expected Result

Owner sees program-level statistics.

---

## SC-059: Owner Views Quiz Statistics

### Actor

Organization Owner

### Goal

View analytics for a specific quiz.

### Preconditions

- Quiz exists under owned program.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/quizzes/{quizId}/stats
   ```
2. Backend calls `ensureQuizOwner(quizId)`.
3. Backend calculates and returns:
   - total attempts
   - submitted attempts
   - average score
   - highest score
   - lowest score
   - pass count
   - fail count
   - pass rate percentage

### Expected Result

Owner sees quiz-level analytics.

---

# 14. Audit Log Scenarios

---

## SC-060: System Records Audit Log for Business Action

### Actor

System

### Goal

Track important business and security actions for traceability.

### Preconditions

- A sensitive or important business action has just succeeded.

### Main Flow

1. Business action completes successfully.
2. Backend creates audit log record:
   - `actor_user_id = currentUserId`
   - `organization_id` (if action is organization-scoped)
   - `action` (e.g., `CERTIFICATE_ISSUED`)
   - `entity_type` (e.g., `Certificate`)
   - `entity_id`
   - `ip_address` from request
   - `user_agent` from request headers
   - `metadata` as JSONB for additional context
   - `created_at = now`

### Business Rules

Audit logs must be created for the following actions:

```text
ORGANIZATION_CREATED
ORGANIZATION_UPDATED
ORGANIZATION_DELETED
MEMBER_ADDED
MEMBER_REMOVED
PROGRAM_CREATED
PROGRAM_UPDATED
PROGRAM_PUBLISHED
PROGRAM_ARCHIVED
INVITATION_CREATED
INVITATION_DISABLED
USER_JOINED_BY_INVITATION
USER_ENROLLED
ENROLLMENT_REMOVED
RESOURCE_CREATED
RESOURCE_UPDATED
RESOURCE_ARCHIVED
QUIZ_CREATED
QUIZ_UPDATED
QUIZ_PUBLISHED
QUIZ_ARCHIVED
ATTEMPT_STARTED
ATTEMPT_SUBMITTED
CERTIFICATE_ISSUED
CERTIFICATE_REVOKED
```

Audit metadata must never include:
- Raw Clerk tokens
- API secrets or keys
- Passwords or sensitive credentials

Audit logs are append-only and are never soft deleted or hard deleted.

### Expected Result

All important platform actions are traceable through audit logs.

---

## SC-061: Owner Views Organization Audit Logs

### Actor

Organization Owner

### Goal

Review audit history for an owned organization.

### Preconditions

- User owns the organization.

### Main Flow

1. Owner sends request:
   ```
   GET /api/v1/organizations/{organizationId}/audit-logs
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend returns paginated audit logs for the organization.

### Business Rules

- Only owner can read audit logs for their organization.
- Unauthenticated users receive HTTP 401.
- Non-owner members receive HTTP 403 or HTTP 404.
- Audit logs are read-only.

### Expected Result

Owner sees a paginated history of actions taken in their organization.

---

# 15. Security and Authorization Scenarios

---

## SC-062: Invalid Clerk Token Is Rejected

### Actor

Unauthenticated or Invalid User

### Goal

Access a protected endpoint with a missing, expired, or malformed Clerk token.

### Preconditions

- Token is missing, expired, malformed, or has an invalid signature.

### Main Flow

1. User sends request to a protected endpoint.
2. Spring Security filter attempts to verify the Clerk JWT.
3. Verification fails (invalid signature, expired, missing header).
4. Backend rejects the request before reaching any controller.

### Business Rules

- All protected endpoints require a valid Clerk JWT.
- The public certificate verification endpoint does not require authentication.
- Clerk webhook endpoint uses signature verification, not user JWT.

### Expected Result

System returns HTTP 401 Unauthorized.

---

## SC-063: Clerk Webhook With Invalid Signature Is Rejected

### Actor

Unknown External Caller

### Goal

Send a request to the Clerk webhook endpoint with an invalid or missing signature.

### Preconditions

- `CLERK_WEBHOOK_SECRET` is configured.
- Caller does not provide a valid Clerk webhook signature.

### Main Flow

1. Caller sends POST request to:
   ```
   POST /api/v1/webhooks/clerk
   ```
2. Backend reads the `Svix-Signature` header.
3. Backend verifies signature against `CLERK_WEBHOOK_SECRET`.
4. Signature is missing or invalid.
5. Backend rejects request without processing the payload.

### Expected Result

System returns HTTP 401 and does not process the payload.

---

## SC-064: Participant Tries to Perform Owner-Only Action

### Actor

Organization Participant

### Goal

Perform an owner-only action such as creating a program, publishing a quiz, or issuing a certificate.

### Preconditions

- User is authenticated.
- User has PARTICIPANT role in the organization.

### Main Flow

1. Participant sends owner-only request.
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Check fails because user is PARTICIPANT, not OWNER.
4. Backend rejects request.

### Business Rules

- All owner-only endpoints must use authorization guard methods.
- Participants receive HTTP 403 for clearly owner-only actions.
- For resource existence that should be hidden, return HTTP 404.

### Expected Result

System returns HTTP 403 Forbidden or HTTP 404.

---

## SC-065: Unenrolled User Tries to Access Program Resources

### Actor

Authenticated User

### Goal

View resources for a program they are not enrolled in.

### Preconditions

- User is authenticated.
- User is not enrolled in the program.
- User is not the program's organization owner.

### Main Flow

1. User sends request:
   ```
   GET /api/v1/programs/{programId}/resources
   ```
2. Backend checks program enrollment and organization ownership.
3. Both checks fail.
4. Backend rejects request.

### Business Rules

- Program resources are private to enrolled participants and organization owners.
- Unenrolled users receive HTTP 404.

### Expected Result

System returns HTTP 404.

---

## SC-066: User Tries to Submit Another User's Attempt

### Actor

Authenticated User

### Goal

Submit an attempt that belongs to another user.

### Preconditions

- Attempt exists.
- Attempt belongs to a different user.

### Main Flow

1. User sends submit request for the attempt ID.
2. Backend calls `ensureAttemptOwner(attemptId)`.
3. Check fails because `attempt.user_id != currentUserId`.
4. Backend rejects request.

### Business Rules

- Attempts can only be submitted by their owner.
- Owners cannot submit on behalf of participants in the MVP.

### Expected Result

System returns HTTP 403 Forbidden.

---

## SC-067: Owner Tries to Access Another Organization's Data

### Actor

Organization Owner

### Goal

Access owner-only data of an organization they do not own.

### Preconditions

- User owns Organization A.
- User does not own or belong to Organization B.

### Main Flow

1. User sends owner-only request for Organization B.
2. Backend calls `ensureOrganizationOwner(organizationB.id)`.
3. Check fails because user is not the owner of Organization B.
4. Backend rejects request.

### Business Rules

- Organization ownership is always scoped.
- Owning one organization does not grant access to others.
- Return HTTP 404 to avoid leaking the existence of Organization B.

### Expected Result

System returns HTTP 404.

---

# 16. Storage Scenarios

---

## SC-068: Owner Uploads Organization Logo to Cloudinary

### Actor

Organization Owner

### Goal

Upload or update the organization logo.

### Preconditions

- User owns the organization.
- Cloudinary is configured.

### Main Flow

1. Owner requests a signed Cloudinary upload signature:
   ```
   POST /api/v1/media/cloudinary/signature
   ```
2. Backend calls `ensureOrganizationOwner(organizationId)`.
3. Backend generates Cloudinary upload signature.
4. Owner uploads image directly to Cloudinary.
5. Owner updates organization with returned URL:
   ```
   PUT /api/v1/organizations/{organizationId}
   Body: { "logoUrl": "https://res.cloudinary.com/..." }
   ```
6. Backend writes audit log entry: `ORGANIZATION_UPDATED`.

### Business Rules

- Store Cloudinary URL in the database.
- Do not store raw image bytes in the database.

### Expected Result

Organization logo is updated with Cloudinary-hosted image.

---

## SC-069: Owner Uploads Program Cover Image to Cloudinary

### Actor

Organization Owner

### Goal

Upload a cover image for a program.

### Preconditions

- Program exists under owned organization.
- Cloudinary is configured.

### Main Flow

1. Owner uploads cover image through Cloudinary signed upload.
2. Backend checks program ownership.
3. Backend updates `cover_image_url` on program.
4. Backend writes audit log entry: `PROGRAM_UPDATED`.

### Business Rules

- Only owner can update the program cover image.
- Cloudinary handles optimization and CDN delivery.

### Expected Result

Program cover image is updated.

---

## SC-070: Owner Uploads PDF Resource to R2

### Actor

Organization Owner

### Goal

Upload a PDF workshop resource to Cloudflare R2.

### Preconditions

- Program exists under owned organization.
- R2 is configured.

### Main Flow

1. Owner requests presigned R2 upload URL:
   ```
   POST /api/v1/files/r2/upload-url
   ```
2. Backend calls `ensureProgramOwner(programId)`.
3. Backend generates presigned R2 upload URL.
4. Owner uploads PDF directly to R2.
5. Owner creates resource:
   ```
   POST /api/v1/programs/{programId}/resources
   Body: {
     "type": "FILE",
     "storageProvider": "R2",
     "objectKey": "...",
     "url": "...",
     "title": "Workshop Slides"
   }
   ```
6. Backend writes audit log entry: `RESOURCE_CREATED`.

### Business Rules

- R2 is preferred for binary files and PDFs.
- Database stores file metadata only.
- If R2 upload fails, no resource record is created.

### Expected Result

PDF resource is stored in R2 and available to enrolled participants.

---

# 17. Edge Case Scenarios

---

## SC-071: Invitation Used After Expiration

### Actor

Authenticated User

### Goal

Join a program using an expired invitation code.

### Expected Result

System returns HTTP 422 with message indicating the invitation has expired.

---

## SC-072: Invitation Used After Max Uses Reached

### Actor

Authenticated User

### Goal

Join a program using an invitation that has reached its maximum use count.

### Expected Result

System returns HTTP 422 with message indicating the invitation usage limit has been reached.

---

## SC-073: User Already Enrolled Uses Invitation Again

### Actor

Program Participant

### Goal

Attempt to join the same program a second time using an invitation link.

### Expected Result

System returns HTTP 409 Conflict. Existing enrollment is preserved.

---

## SC-074: Participant Exceeds Max Quiz Attempts

### Actor

Program Participant

### Goal

Start another quiz attempt after reaching the `maxAttempts` limit.

### Expected Result

System returns HTTP 422 with message indicating the maximum number of attempts has been reached.

---

## SC-075: Quiz Is Archived Before Attempt Is Started

### Actor

Program Participant

### Goal

Start an attempt for a quiz that has been archived.

### Expected Result

System returns HTTP 422. Archived quizzes do not accept new attempts.

---

## SC-076: Quiz Is Archived After Attempt Is Already Started

### Actor

Program Participant

### Goal

Submit an attempt that was started before the quiz was archived.

### MVP Policy

Allow submission for already-started (IN\_PROGRESS) attempts even if the quiz is now ARCHIVED.

Do not allow new attempts to be started on ARCHIVED quizzes.

### Expected Result

Submission is accepted because the attempt was started before archiving. Score is calculated normally.

---

## SC-077: Attempt Submitted After Time Expires

### Actor

Program Participant

### Goal

Submit a quiz attempt after `attempt.expires_at` has passed.

### Expected Result

System returns HTTP 422 with message indicating the attempt time limit has expired.

---

## SC-078: Organization Name Changed After Certificates Issued

### Actor

Organization Owner

### Goal

Rename the organization after certificates have been issued.

### Expected Result

Existing certificates retain the `organization_name_snapshot` captured at issuance time. The public verification response continues to show the original organization name.

---

## SC-079: User Changes Name After Certificate Is Issued

### Actor

Certificate Owner

### Goal

Update their Clerk profile name after receiving a certificate.

### Expected Result

Existing certificates retain the `participant_name_snapshot` captured at issuance time. Public verification continues to show the original name.

---

## SC-080: Verification Code Collision During Certificate Generation

### Actor

System

### Goal

Generate a unique verification code when a collision occurs.

### Main Flow

1. System generates a 16-character verification code using SecureRandom.
2. System checks uniqueness in the `certificates` table.
3. If a collision is detected, system regenerates and checks again.
4. If unique: proceed with certificate creation.
5. If repeated collisions occur: log error and return HTTP 500.

### Expected Result

Certificate is generated with a unique verification code, or the system fails safely with an error.

---

## SC-081: R2 Upload Fails During Resource Creation

### Actor

Organization Owner

### Goal

Upload a file resource when R2 is unavailable.

### Expected Result

System returns HTTP 500 storage error. No resource record is created in the database. The operation is rolled back.

---

## SC-082: Cloudinary Upload Fails During Image Resource Creation

### Actor

Organization Owner

### Goal

Upload an image resource when Cloudinary is unavailable.

### Expected Result

System returns a media upload error. No resource record is created with an invalid or empty URL.

---

## SC-083: AUTO Certificate Issuance Fails After Passing Attempt

### Actor

System

### Goal

Handle AUTO certificate issuance failure gracefully.

### Preconditions

- Attempt submission succeeds.
- `is_passed = true`.
- `certificateIssueMode = AUTO`.
- Certificate creation fails due to an internal error.

### Expected Result

- The attempt submission is NOT rolled back.
- The attempt result is returned to the user.
- Certificate reference is omitted from the response.
- Error is logged for investigation.
- Owner can manually issue the certificate afterward.

---

# 18. Full Happy Path Scenario

---

## SC-084: Complete Workshop Flow From Creation to Certificate Verification

### Actor

Organization Owner and Program Participant

### Goal

Run a complete workshop lifecycle and issue a publicly verifiable certificate.

### Preconditions

- Owner and participant have Clerk accounts.
- Backend is running with Neon DB, R2, and Cloudinary configured.

### Main Flow

```text
1.  Owner logs in through Clerk.
2.  Clerk webhook fires user.created → local owner profile created.
3.  Owner creates organization.
    → Organization created, owner membership created in one transaction.
    → Audit log: ORGANIZATION_CREATED.

4.  Owner creates program under organization.
    → Program created with status = DRAFT.
    → Audit log: PROGRAM_CREATED.

5.  Owner publishes program.
    → Status = PUBLISHED.
    → Audit log: PROGRAM_PUBLISHED.

6.  Owner creates invitation link with maxUses = 50, expiresAt = 30 days from now.
    → 12-char uppercase code generated.
    → Audit log: INVITATION_CREATED.

7.  Owner uploads program cover image to Cloudinary.
    → cover_image_url updated on program.

8.  Owner adds external link resource (Git slides URL).
    → Resource created with type = LINK.
    → Audit log: RESOURCE_CREATED.

9.  Owner uploads PDF resource to R2 (workshop notes PDF).
    → Presigned URL generated.
    → PDF uploaded to R2.
    → Resource created with type = FILE, storage_provider = R2.
    → Audit log: RESOURCE_CREATED.

10. Owner creates quiz inside program.
    → Quiz created with status = DRAFT.
    → Audit log: QUIZ_CREATED.

11. Owner adds 5 questions.
12. Owner adds options to each question (4 options per question, 1 correct each).

13. Owner publishes quiz.
    → Publish validation passes.
    → Status = PUBLISHED.
    → Audit log: QUIZ_PUBLISHED.

14. Participant opens invitation link.
    → Participant is not logged in.
    → Frontend redirects to Clerk sign-in.
    → Participant registers via Clerk.
    → Clerk webhook fires user.created → local participant profile created.

15. Participant joins program using invitation code.
    → Invitation validated (ACTIVE, not expired, max_uses not reached).
    → Enrollment created with status = ACTIVE.
    → used_count incremented to 1.
    → Participant added as PARTICIPANT organization member.
    → Audit log: USER_JOINED_BY_INVITATION.

16. Participant views program resources.
    → Enrollment verified.
    → Resources returned: Git slides link + PDF file.

17. Participant views published quiz.
    → Enrollment verified.
    → Quiz returned.

18. Participant starts quiz attempt.
    → attempt_number = 1.
    → started_at = now.
    → expires_at = now + quiz.duration_minutes.
    → Status = IN_PROGRESS.

19. Participant submits answers before expires_at.
    → All answers validated.
    → Scores calculated.
    → is_passed = true.
    → Status = SUBMITTED.
    → Audit log: ATTEMPT_SUBMITTED.

20. System auto-issues certificate.
    → Eligibility verified.
    → certificate_number = CERT-2024-AX93KL2P (generated).
    → verification_code = A3FX9KL2MN8PQR7Z (generated).
    → Snapshots captured.
    → Certificate created with status = ACTIVE.
    → Audit log: CERTIFICATE_ISSUED.

21. Optional: System generates QR code → stored in R2.
    Optional: System generates PDF → stored in R2.

22. Participant views own certificates.
    → Certificate returned with pdf_url, qr_code_url.

23. Visitor scans QR code or enters verification code.
    → GET /api/v1/public/certificates/verify/A3FX9KL2MN8PQR7Z
    → Certificate found, status = ACTIVE.
    → Public safe data returned.

24. Owner views organization statistics.
    → 1 program, 1 member, 1 enrolled, 1 quiz, 1 attempt, 1 certificate.
```

### Expected Result

Full workshop lifecycle is completed. Certificate is publicly verifiable.

---

# 19. Authorization Guard Methods

The backend shall include an `AuthorizationService` with the following guard methods:

| Method | Description |
| --- | --- |
| `ensureOrganizationOwner(organizationId)` | Verify current user is OWNER of the organization |
| `ensureOrganizationMember(organizationId)` | Verify current user is an active member |
| `ensureProgramOwner(programId)` | Verify current user owns the program's organization |
| `ensureProgramEnrollment(programId, userId)` | Verify user has an active enrollment in the program |
| `ensureInvitationOwner(invitationId)` | Verify current user owns the invitation's organization |
| `ensureResourceOwner(resourceId)` | Verify current user owns the resource's program organization |
| `ensureQuizOwner(quizId)` | Verify current user owns the quiz's program organization |
| `ensureQuizAccessible(quizId)` | Verify current user can access quiz (enrolled or owner) |
| `ensureAttemptOwner(attemptId)` | Verify current user owns the attempt |
| `ensureCertificateAccessible(certificateId)` | Verify current user can access the certificate |

All guard methods shall:

- Throw a specific exception if the check fails.
- Be handled by a global exception handler (`@ControllerAdvice`).
- Return HTTP 403 or HTTP 404 depending on the security policy for that resource.

---

# 20. Final Rules

```text
1.  Authentication comes from Clerk.
    The backend verifies Clerk JWT tokens on every protected request.

2.  User sync happens via Clerk webhooks and auto-creation on first request.
    Both strategies complement each other.

3.  Organization permissions come from organization_memberships.role.
    There are no global user roles on the users table.

4.  Program access comes from program_enrollments.
    A user must have an ACTIVE enrollment to access resources, quizzes, and attempts.

5.  All primary keys are UUIDs.
    This is safe for public APIs and prevents enumeration attacks.

6.  Scores are calculated entirely by the backend on submission.
    Clients never send or control score values.

7.  Certificate snapshots capture names at issuance time.
    Future renames do not affect existing certificate data.

8.  AUTO certificate issuance failures do not roll back the attempt submission.
    The attempt result is returned regardless of certificate issuance success.

9.  Audit logs are append-only.
    They are never updated, soft deleted, or hard deleted.

10. Soft deleted records are excluded from all API responses and permission checks.
    Children of soft deleted parents are preserved for historical integrity.

11. Files are stored in Cloudflare R2.
    Images and media are stored in Cloudinary.
    The database stores metadata only: url, storage_provider, object_key.

12. Public certificate verification requires no authentication.
    It exposes only safe snapshot data and status information.
```
