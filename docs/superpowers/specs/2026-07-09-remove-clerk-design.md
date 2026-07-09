# Remove Clerk Integration — Design Spec

## Goal
Eliminate all Clerk-specific concepts, configuration, code, tests, and documentation from Skillmark. The application already uses native JWT auth; this work cleans up the remaining Clerk residue.

## Approved Scope
- Remove the `clerk_user_id` column from the `users` table.
- Remove all Clerk-related fields, repository methods, DTO mappings, and API references in the backend.
- Remove the `clerkUserId` field from the frontend user model.
- Remove Clerk configuration from properties files and environment examples.
- Update or remove Clerk-named integration tests, seed data, and webhook tests.
- Scrub Clerk references from documentation.

## Key Constraints
- No Clerk SDK is currently declared as a dependency, so only code/model/config cleanup is required.
- A new Flyway migration (`V11__remove_clerk_user_id.sql`) must drop the column and any surviving Clerk index.
- Existing native auth flows (registration, login, JWT cookie, `/auth/me`) remain unchanged.

## Acceptance Criteria
1. `grep -Ri clerk backend/src frontend/src docs --include='*.{ts,java,md,properties,sql}'` returns no matches (except historical docs if explicitly preserved).
2. Backend tests pass.
3. Frontend build/tests pass.
4. Application starts and native auth still works.
