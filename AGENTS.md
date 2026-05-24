# AGENTS.md

# Cohive Backend Engineering Gateway

This file is the central gateway for the Cohive backend architecture and development workflow.

Every AI agent, contributor, generator, or automation tool MUST treat this document as the primary orchestration layer for:
- architecture understanding
- backend generation
- business logic consistency
- API standards
- database integrity
- development conventions
- testing expectations

This file controls how the backend should evolve.

---

# PROJECT OVERVIEW

Cohive is a modular SaaS Training & Course Management Platform built using:

- Spring Boot
- PostgreSQL (Neon)
- JWT Authentication
- Modular Feature-Based Architecture

The platform manages:
- organizations
- students
- courses
- enrollments
- resources
- quizzes
- certificates

The backend architecture prioritizes:
- modularity
- maintainability
- scalability
- clean architecture
- enterprise-grade engineering standards


# PRIMARY SOURCE OF TRUTH

Before generating, modifying, refactoring, or validating ANY backend code, ALWAYS read the following files in order:

1. docs/PRD.md
2. docs/DB_Design.md
3. docs/API_Design.md
4. docs/Architecture.md
5. docs/Backend_Business_Scenarios.md

These documents define:
- business logic
- database structure
- API contracts
- backend architecture
- testing expectations

If any conflict exists between documents, use this priority order:

1. DB_Design.md
2. API_Design.md
3. Architecture.md
4. Backend_Business_Scenarios.md
5. PRD.md

Never:
- invent entities
- invent relationships
- invent API contracts
- invent undocumented business logic
- violate documented architecture patterns

All generated code MUST remain consistent with these documents.