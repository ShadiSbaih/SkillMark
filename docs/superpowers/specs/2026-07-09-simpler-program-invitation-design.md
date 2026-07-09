# Simpler Program Invitation Flow

## Goal
Reduce the number of steps required for an existing or new user to accept a program invitation and join the organization. The current flow forces the recipient to open a link, wait for a preview, and then manually click an "Accept invitation" button. This design removes that friction while keeping the existing invitation-link data model.

## Context
- The application is **Skillmark / Cohive**.
- Invitations are currently **program-scoped**: an `InvitationLink` belongs to a `Program` and its parent `Organization`.
- Accepting a program invitation currently:
  1. Creates a `ProgramEnrollment`.
  2. Creates or reactivates an `OrganizationMembership` for the user.
- There is also a manual "Add member by user ID" flow on the organization members page, but that is **out of scope** for this change.

## Decision
Use a **one-click magic link** approach.

- The owner still creates a program invitation and shares a `/join/{code}` link.
- When a logged-in recipient opens the link, the system automatically joins them to the program and organization.
- When a non-logged-in recipient opens the link, they are redirected to sign-in/sign-up with a `redirect` parameter, then returned to the link to complete auto-join.
- The join endpoint becomes idempotent so re-clicking the same link is safe.

## Architecture

### Frontend
- **`JoinComponent`** (`frontend/src/app/pages/join/`)
  - Becomes an auto-join gateway.
  - On load, if the user is authenticated and the invitation preview succeeds, immediately call `POST /api/v1/invitations/{code}/join`.
  - On success, redirect to `/programs/{programId}/learn`.
  - If unauthenticated, redirect to `/sign-in?redirect=/join/{code}` (or `/sign-up?redirect=/join/{code}` for new users).
  - The sign-in and sign-up pages must read the `redirect` query param and navigate there after successful auth instead of always going to `/dashboard`.
  - Keep the manual code entry form as a fallback for users who only have a code.
- **`ProgramInvitationsComponent`** (`frontend/src/app/pages/program-invitations/`)
  - Keep invitation creation but optimize for "create → copy link → share".
  - Default `maxUses` to unlimited (`null`) instead of `100`.
  - Copy the full link to the clipboard immediately after creation and show a toast.

### Backend
- **`InvitationService.join`** (`backend/src/main/java/com/library/Skillmark/invitation/service/InvitationService.java`)
  - Make idempotent: if the user already has an active enrollment for the program, return the existing enrollment/invitation response instead of throwing `ConflictException`.
  - Continue to validate invitation status, expiry, usage limit, and program publish state.
  - Continue to increment `usedCount` only on a real new enrollment.
- **`InvitationController`**
  - No new endpoints; behavior changes are inside the existing `POST /api/v1/invitations/{code}/join`.

## Data Flow

1. Owner opens **Program → Invitations** and creates an invitation.
2. Frontend copies the link (`/join/{code}`) to the clipboard and shows a toast.
3. Recipient clicks the link.
   - **Not authenticated**: redirect to `/sign-in?redirect=/join/{code}` (or `/sign-up`). After auth, redirect back to `/join/{code}`.
   - **Authenticated**: `JoinComponent` calls `GET /api/v1/invitations/{code}/preview`.
4. If preview is valid, component immediately calls `POST /api/v1/invitations/{code}/join`.
5. Backend enrolls the user and creates/reactivates the organization membership.
6. Frontend redirects to `/programs/{programId}/learn`.

## UI / UX

### Join page (`/join/{code}`)
- **Loading**: show "Joining *Program Name*…" while the preview and join requests run.
- **Fallback form**: keep the manual code input for users who were given a code but not a clickable link.
- **Success**: toast "Joined successfully" and redirect.

### Program invitations page
- After creating an invitation, immediately copy the full link and show a toast.
- Simplify creation defaults: `maxUses = null` (unlimited), `expiresAt = null`.
- Show invitations as rows with a **Copy link** action and a **Disable** action.

## Error Handling

| Condition | Behavior |
|-----------|----------|
| Invalid / expired / disabled / maxed-out code | Friendly error message; keep manual code input visible. |
| Program not published or deleted | "This program is no longer accepting members" with a link back to programs. |
| Already enrolled | Backend returns success; frontend redirects to program learn page. |
| Not authenticated | Redirect to sign-in/sign-up with original join URL preserved. |
| Network failure during auto-join | Error state with a retry button. |

## Testing

### Backend unit tests (`InvitationService.join`)
- Join succeeds for a valid active invitation.
- Join is idempotent when the user is already actively enrolled.
- Disabled, expired, and maxed-out invitations are rejected.
- `usedCount` increments only on a new enrollment.

### Frontend unit tests (`JoinComponent`)
- Authenticated user with a valid code auto-calls join and redirects to the program learn page.
- Unauthenticated user is redirected to sign-in with the `redirect` query param.
- Invalid code shows the manual input form and an error message.

### Integration test
- Create an invitation → open `/join/{code}` as an authenticated user → verify the enrollment and membership exist.

## Out of Scope
- Email-based invitations.
- Organization-level invitations that are not tied to a program.
- Bulk invitation creation.
- Changes to the manual "Add member by user ID" organization flow.
