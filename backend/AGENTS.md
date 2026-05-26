# AGENTS.md

## Skillmark AI Agent Guide

**Read this file before writing any code.** It routes you to the correct source of truth for the Skillmark backend.

### Source of Truth Files

| File | Purpose | When to Read |
|---|---|---|
| **PRD.md** | Product scope, API design, tech stack, permissions | Always read first for any feature |
| **DB_Design.md** | Schema, tables, enums, indexes, constraints | When creating entities, repos, or migrations |
| **User_Scenarios.md** | Business logic, user flows, edge cases, auth rules | When writing service logic, validation, or tests |

---

## Core Rules (Never Violate)

**1. Authentication & Identity**
* Clerk handles all auth. Backend only verifies JWTs.
* Link local users via `users.clerk_user_id`.
* NEVER store passwords, refresh tokens, or reset tokens.

**2. Authorization (Multi-Tenancy)**
* NO global user roles (`users.role` is forbidden).
* Org permissions come strictly from `organization_memberships.role`.
* Program access comes strictly from `program_enrollments.status`.

**3. Storage Providers**
* **Neon DB (PostgreSQL)** → Relational data.
* **Cloudflare R2** → Files, PDFs, Certificates.
* **Cloudinary** → Images, logos, media.

**4. Data & Business Logic**
* All Primary Keys are `UUID`.
* Backend calculates all quiz scores. Client never sends scores.
* Capture name snapshots on certificates at issuance time.
* Use `deleted_at` for soft deletes. Never delete certificates or audit logs.

---

## Backend Architecture

**Stack:** Java 17+, Spring Boot, Spring Security, Spring Data JPA, Flyway.

**Layers:**
1. **Controller:** Validate DTOs, return standard responses. Keep thin.
2. **Service:** Enforce business rules, authorization, and transactions.
3. **Repository:** Database access, custom queries, and pagination.

**Authorization Guards:**
Always use service-level guards before executing logic:
`ensureOrganizationOwner()`, `ensureProgramEnrollment()`, `ensureAttemptOwner()`, etc.

---

## API Conventions

**Standard Response Wrapper:**
```json
{ "success": true, "message": "...", "data": {}, "timestamp": "..." }
{ "success": false, "message": "...", "errors": [], "path": "...", "timestamp": "..." }
```

**HTTP Status Codes:**
* `200/201/204`: Success
* `400`: Validation error (DTO structure)
* `401`: Invalid/missing Clerk token
* `403`: Authenticated, but lacks permission
* `404`: Not found (Use instead of 403 to hide resource existence from unauthorized users)
* `409`: Conflict (e.g., duplicate enrollment)
* `422`: Business rule violation (e.g., expired attempt, max attempts reached)

**Pagination:** Zero-based `page`, `size` (max 100), `sort`, `direction`.

---

## Out of Scope (Do Not Implement)
Full LMS courses, lessons, assignments, attendance, payments, chat, notifications, mobile app, microservices. Focus strictly on the MVP defined in the PRD.