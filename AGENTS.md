# AGENTS.md

## Skillmark AI Agent Guide

Before implementing or modifying anything in this project, read these three files only:

1. `PRD.md`
2. `DB_Design.md`
3. `Skillmark_User_Scenarios.md`

These files are the source of truth.

---

## Project Summary

Skillmark is a university-focused training, assessment, and certification backend platform.

It supports:

- organizations
- programs/workshops
- enrollments
- invitation links
- resources
- quizzes
- attempts/scoring
- certificates
- public certificate verification
- statistics
- audit logs

---

## Required Stack

Use:

- Clerk for authentication
- Neon DB for PostgreSQL
- Cloudflare R2 for files/PDFs
- Cloudinary for images/media

---

## Core Rules

Do not use global user roles.

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

Authentication identity comes from Clerk using:

```text
users.clerk_user_id
```

---

## Implementation Rules

- Follow the PRD for product requirements.
- Follow the ERD file for database structure.
- Follow the User Scenarios file for business logic and edge cases.
- Keep controllers thin.
- Put business logic in services.
- Put database access in repositories.
- Use DTOs for request/response.
- Use organization-scoped authorization.
- Use program enrollment checks for participant access.
- Do not implement features marked as delayed or out of scope unless requested.

---

## Most Important Rule

```text
Clerk handles authentication.
Neon stores relational data.
R2 stores files/PDFs.
Cloudinary stores images/media.
organization_memberships controls organization permissions.
program_enrollments controls program access.
```
