# Skillmark Backend Implementation Plan

## Follow-up Requirements

### Publication State

- Treat `programs.status` and `quizzes.status` as the single source of truth for publishing state.
- Valid program statuses: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Valid quiz statuses: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Keep `isPublished` only as a backward-compatible DTO/database mirror derived from `status == PUBLISHED`.
- Do not add business logic that reads or writes `isPublished` as an independent state.

### Historical Quiz Structure

- Allow question/option edits and deletes only while a quiz has no submitted attempts.
- Reject destructive question/option changes with HTTP 422 once submitted attempts exist.
- Do not physically delete questions/options referenced by attempt answers.
- Use versioning or archiving for any future editing model after submitted attempts.

### Invitation Usage Concurrency

- Invitation join must be concurrency-safe.
- Check and increment `usedCount` atomically by row-level locking, optimistic locking, or conditional update.
- `usedCount` must never exceed `maxUses`.
- Duplicate active enrollments still return HTTP 409.
- Expired, disabled, archived-program, deleted-program, and maxed-out invitations return documented business errors.

### Documentation And Tests

- Keep PRD, user scenarios, DB design, OpenAPI descriptions, DTO notes, and tests synchronized with implementation.
- Add integration coverage for concurrent invitation joins with small `maxUses`.
- Add coverage that submitted attempts protect questions/options from destructive changes.
