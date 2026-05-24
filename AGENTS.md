

# AGENTS.md

# Cohive Backend Engineering Gateway

This file is the entry point for all AI agents, contributors, generators, and automation tools working on the Cohive backend.

---

# Project Overview

Cohive is an API-only modular SaaS backend for training and course management.

Built with:

- Spring Boot
- PostgreSQL
- JWT Authentication
- Modular feature-based architecture

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

Frontend is out of scope for the current phase.

---

# Core Architecture Rule

A User is an identity/account, not a global role holder.

Do not use `users.role` for business permissions.

Permissions are organization-scoped through:

```text
organization_memberships
````

A single user can be:

* OWNER of one or more organizations
* STUDENT in one or more organizations
* OWNER in one organization and STUDENT in another

---

# Primary Source of Truth

Before generating or modifying backend code, read these files in order:

1. `docs/DB_Design.md`
2. `docs/API_Design.md`
3. `docs/Architecture.md`
4. `docs/Backend_Business_Scenarios.md`
5. `docs/PRD.md`

If documents conflict, follow the same priority order above.

---

# Development Rules

Always:

* keep the project as a modular Spring Boot monolith
* follow the documented database schema
* follow the documented API contracts
* enforce organization-scoped authorization
* use DTOs for API input/output
* keep business logic in services
* keep controllers thin
* preserve consistent API responses
* write or update tests for changed behavior

Never:

* invent undocumented entities
* invent undocumented API contracts
* rely on global user roles for organization permissions
* reintroduce `students`, `organization_students`, or `course_students`
* build frontend code
* split into microservices unless explicitly required

---

# Required Authorization Pattern

Repeated authorization logic should be centralized in `AuthorizationService`.

Examples:

* `ensureOrganizationOwner(organizationId)`
* `ensureOrganizationMember(organizationId)`
* `ensureActiveStudentMember(organizationId, userId)`
* `ensureCourseOwner(courseId)`
* `ensureUserEnrolledInCourse(courseId, userId)`

---

# Scope Reminder

Current phase:

* backend API only
* organization-scoped permissions
* LINK and FILE resources only
* quiz questions/options/attempts/scoring
* verifiable certificates
* refresh tokens
* email verification
* password reset


