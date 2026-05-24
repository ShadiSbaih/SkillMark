# Cohive Backend Architecture

## Overview

Cohive is a modular Spring Boot backend for a multi-organization training platform.

Core stack:
- Java 17
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL (Neon)

Core priorities:
- keep feature modules isolated
- keep the API contract stable
- keep business rules in services
- keep infrastructure lightweight

---

# Request Flow

```text
Client
  -> Controller
  -> Service
  -> Repository
  -> Database
```

Controllers handle HTTP concerns, services enforce business rules, repositories handle persistence, and entities stay inside the persistence layer.

---

# Module Structure

Each feature keeps its own package:

- auth
- user
- organization
- student
- course
- enrollment
- resource
- quiz
- certificate

Shared packages:

- config
- common
- security

Typical feature layout:

```text
course/
  controller/
  dto/
  entity/
  repository/
  service/
```

Mapper packages are no longer part of the design. Simple entity-to-response conversion lives in response DTO factories.

---

# Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Controller | Accept requests, trigger validation, return standardized responses |
| Service | Apply authorization, tenancy rules, and business logic |
| Repository | Execute persistence operations and required query methods |
| Entity | Represent database state and relationships |
| DTO | Define API request and response shapes |

Rules:

- controllers do not contain business logic
- controllers do not access repositories directly
- services do not expose entities to the API
- repositories stay thin and contain only persistence-oriented methods

---

# DTO Strategy

All external API input and output uses DTOs.

Request DTO rules:
- keep validation annotations on the DTO
- merge request classes only when the shape and validation rules are truly identical
- keep API field names unchanged

Response DTO rules:
- map directly from entities through DTO static factories such as `fromEntity(...)`
- keep mapping logic close to the response shape when the mapping is trivial
- avoid a separate mapper abstraction for one-to-one field copies

This keeps simple mappings local without introducing another layer.

---

# Repository Strategy

Repositories extend `JpaRepository` and remain feature-specific.

Guidelines:
- keep one repository interface per aggregate when query methods are needed
- do not introduce empty repository abstractions just for structure
- do not move repository access into controllers
- keep custom methods focused on query intent, not business decisions

Direct `JpaRepository<Entity, UUID>` injection is not used as a general pattern because several features rely on entity-specific query methods.

---

# Pagination Strategy

List endpoints that are already paginated return:

- `ApiResponse<PageResponse<T>>`

Implementation guidelines:
- controllers use `PageResponse.from(Page<T>)`
- services may build `Page<T>` from repository output or from filtered in-memory lists
- shared pagination helpers belong in `common`

Endpoints that currently return plain lists keep their existing response shape to preserve the API contract.

---

# Security Architecture

Authentication is stateless and JWT-based.

Current structure:
- `auth` contains authentication use cases and auth DTOs
- `security` contains JWT parsing, filter integration, user details loading, and access handlers
- `config` wires the security filter chain and related beans

Security rules:
- `/api/v1/auth/register` and `/api/v1/auth/login` are public
- Swagger and health endpoints are public
- all other API routes require authentication

Implementation guidelines:
- password hashing uses BCrypt
- JWT generation and parsing stay centralized
- exception handlers return the standard API error format

---

# Configuration Strategy

Configuration stays small and explicit.

Current responsibilities:
- `SecurityConfig` wires the security filter chain, authentication provider, and password encoder
- `OpenApiConfig` defines the OpenAPI metadata
- Neon datasource URL normalization runs before datasource auto-configuration so Spring Boot can keep its default pooled datasource

The datasource setup intentionally avoids constructing a manual `DataSource` bean because that bypasses Boot-managed pooling.

---

# Validation And Errors

Validation uses Jakarta Validation on DTOs.

Common annotations:
- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Valid`

Global exception handling uses `@ControllerAdvice` and keeps responses consistent with the API design.

---

# Multi-Tenant Rules

Tenant isolation is enforced in services.

Key rules:
- owners manage only their own organizations and related data
- students access only their own profile and authorized course data
- cross-organization access is rejected

Authorization checks stay close to the business action that requires them.

---

# Database Notes

Persistence uses PostgreSQL with UUID primary keys and Flyway migrations.

Design expectations:
- normalized relationships
- explicit ownership and membership checks
- audit timestamps on major entities

---

# Development Principles

Prefer:
- small configs
- explicit service logic
- feature-local repositories
- DTO factories for simple mappings
- shared helpers only when duplication is repeated

Avoid:
- extra abstraction layers for trivial field mapping
- empty interfaces with no behavior or query intent
- API shape changes during internal refactoring
- moving business logic out of services just to reduce file size
