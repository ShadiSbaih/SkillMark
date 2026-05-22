# AGENTS.md

# Cohive Backend Engineering Guide

This repository contains the backend architecture for Cohive, a modular SaaS Training & Course Management Platform built using Spring Boot and PostgreSQL.

The backend must follow clean architecture, modular design, scalability principles, and enterprise-grade coding standards.

---

# IMPORTANT

Before generating or modifying any code, ALWAYS read:

1. docs/PRD.md
2. docs/DB_Design.md
3. docs/API_Design.md
4. docs/Architecture.md

These documents are the source of truth.

If any conflict exists:
- DB_Design.md has highest priority
- Then API_Design.md
- Then PRD.md

Never invent database entities, relationships, or business logic outside documented specifications.

---

# Backend Stack

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL (Neon)
- JWT Authentication
- Maven
- Lombok
- MapStruct
- Flyway (future-ready)

---

# Backend Architecture

The project follows:

Controller → Service → Repository → Database

Business logic MUST exist only inside services.

Controllers must remain thin.

Repositories handle persistence only.

Never place business logic inside:
- controllers
- repositories
- entities

---

# Modular Feature-Based Structure

Every feature module must follow this structure:

feature/
├── controller
├── service
├── repository
├── entity
├── dto
├── mapper
└── exception

Example:

course/
├── controller
├── service
├── repository
├── entity
├── dto
└── mapper

---

# Core Backend Rules

## Always Use DTOs

Never expose entities directly in API responses.

Use:
- Request DTOs
- Response DTOs

Example:
- CreateCourseRequest
- CourseResponse

---

# Validation Rules

Use Jakarta Validation annotations.

Examples:
- @NotBlank
- @Email
- @Size
- @Valid

Validation belongs in DTOs.

---

# Dependency Injection

Use constructor injection ONLY.

Do not use:
- field injection
- @Autowired on fields

---

# Exception Handling

Use centralized exception handling with:

@ControllerAdvice

Create custom exceptions when necessary.

Examples:
- ResourceNotFoundException
- UnauthorizedException
- BusinessException

---

# Database Rules

Database engine:
- PostgreSQL (Neon)

Use:
- UUID primary keys
- proper foreign keys
- indexing
- timestamps
- normalized schema

Every important entity should include:
- created_at
- updated_at

Optional:
- deleted_at

---

# JPA Rules

Prefer:
- LAZY loading
- explicit joins
- pagination

Avoid:
- EAGER relationships
- N+1 query problems
- unnecessary cascading

---

# Naming Conventions

## Java

Classes:
- PascalCase

Variables:
- camelCase

Constants:
- UPPER_SNAKE_CASE

Packages:
- lowercase

---

# API Rules

Base path:

/api/v1

Use:
- RESTful naming
- proper HTTP methods
- consistent responses
- pagination for lists

Examples:

GET /courses
POST /courses
GET /courses/{id}

---

# Standard API Response Format

All APIs should follow:

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

---

# Security Rules

Authentication:
- JWT-based

Authorization:
- role-based

Passwords:
- BCrypt hashing only

Never:
- store plain passwords
- expose sensitive fields
- trust client-side authorization

---

# Logging Rules

Use structured logging.

Log:
- important operations
- errors
- security events

Avoid excessive console logs.

---

# Clean Code Rules

Always prioritize:
- readability
- modularity
- maintainability
- scalability

Avoid:
- giant classes
- duplicated logic
- magic strings
- hardcoded values

---

# Performance Rules

Prefer:
- pagination
- projections
- indexed queries
- optimized joins

Avoid:
- loading unnecessary data
- returning massive collections
- blocking operations

---

# Repository Rules

Repositories should:
- extend JpaRepository
- remain simple
- avoid business logic

Complex queries should use:
- JPQL
- Specifications
- QueryDSL (future)

---

# Mapper Rules

Use MapStruct for:
- entity ↔ dto conversion

Never manually map large objects repeatedly.

---

# Transaction Rules

Use @Transactional only in service layer.

Never in controllers.

---

# Authentication Module Rules

Authentication module should contain:
- login
- register
- JWT generation
- token validation

Keep security isolated from business modules.

---

# File Structure

src/main/java/com/Cohive
│
├── config
├── common
├── security
├── auth
├── user
├── organization
├── student
├── course
├── enrollment
├── resource
├── quiz
├── certificate

---

# Documentation Rules

Whenever generating APIs:
- update API_Design.md if needed

Whenever generating entities:
- verify DB_Design.md first

Never create undocumented architecture.

---

# Future Scalability

Architecture must remain ready for:
- microservices transition
- notification system
- analytics
- file storage
- websocket communication
- role system
- audit logs

Avoid tightly coupled implementations.

---

# AI Agent Behavior

When generating code:
- follow existing architecture strictly
- prioritize maintainability
- avoid overengineering
- keep files modular
- reuse existing patterns
- maintain naming consistency

Before implementing new features:
1. Read DB_Design.md
2. Read PRD.md
3. Verify relationships
4. Verify architecture consistency

If uncertain:
- preserve existing architecture patterns
- avoid introducing new architectural styles