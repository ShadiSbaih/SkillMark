# Architecture.md

# Nexora Backend Architecture

## Overview

Nexora is a modular SaaS Training & Course Management Platform built using:

- Spring Boot
- PostgreSQL (Neon)
- JWT Authentication
- Modular Feature-Based Architecture

The backend architecture prioritizes:
- scalability
- maintainability
- modularity
- clean code
- enterprise-grade structure

---

# Architectural Style

The application follows:

## Layered Modular Architecture

Flow:

Controller → Service → Repository → Database

---

# Architecture Goals

- Clean separation of concerns
- Reusable modules
- Scalable structure
- Secure authentication
- Maintainable business logic
- Feature isolation
- Production-ready organization

---

# High-Level System Architecture

```text
Client (Angular)
        ↓
REST API (Spring Boot)
        ↓
Controller Layer
        ↓
Service Layer
        ↓
Repository Layer
        ↓
PostgreSQL (Neon)
```

---

# Core Architecture Principles

## 1. Feature-Based Modularity

Every feature is isolated into its own module.

Example:

course/
├── controller
├── service
├── repository
├── entity
├── dto
├── mapper

Benefits:
- scalability
- maintainability
- team collaboration
- easier testing

---

# 2. Separation of Concerns

Each layer has a single responsibility.

| Layer | Responsibility |
|---|---|
| Controller | HTTP handling |
| Service | Business logic |
| Repository | Database access |
| Entity | Persistence model |
| DTO | API data transfer |
| Mapper | Entity ↔ DTO conversion |

---

# 3. Stateless Authentication

Authentication uses JWT.

Advantages:
- scalable
- stateless
- frontend-friendly
- API-ready

---

# Backend Modules

## Core Modules

- auth
- user
- organization
- student
- course
- enrollment
- resource
- quiz
- certificate

---

# Module Responsibilities

## Auth Module

Handles:
- login
- registration
- JWT generation
- token validation

---

## User Module

Handles:
- user accounts
- profile information
- identity management

---

## Organization Module

Handles:
- organizations
- ownership
- organization management

---

## Student Module

Handles:
- student entities
- student enrollment context

---

## Course Module

Handles:
- courses
- course management
- course metadata

---

## Enrollment Module

Handles:
- course enrollments
- student-course relationships

---

## Resource Module

Handles:
- educational resources
- course-resource linking

---

## Quiz Module

Handles:
- quizzes
- assessments

---

## Certificate Module

Handles:
- certificate issuance
- student certification

---

# Package Structure

src/main/java/com/nexora
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

# Shared Packages

## config

Contains:
- application configuration
- OpenAPI config
- security config

---

## common

Contains:
- exceptions
- utilities
- response wrappers
- constants

---

## security

Contains:
- JWT filters
- token services
- security handlers

---

# Database Architecture

Database:
- PostgreSQL (Neon)

Design principles:
- normalized schema
- UUID primary keys
- foreign key integrity
- indexing
- auditability

---

# Entity Design Rules

All major entities should contain:

- id (UUID)
- created_at
- updated_at

Optional:
- deleted_at

---

# Repository Layer

Repositories:
- extend JpaRepository
- remain lightweight
- avoid business logic

Complex querying should use:
- JPQL
- Specifications
- QueryDSL (future)

---

# Service Layer

Services contain:
- business rules
- validation
- transactional logic

Services should:
- remain modular
- avoid duplication
- avoid infrastructure coupling

---

# Controller Layer

Controllers:
- expose REST endpoints
- validate requests
- return standardized responses

Controllers should NOT:
- contain business logic
- directly access repositories

---

# DTO Strategy

All API communication uses DTOs.

Never expose entities directly.

DTO Types:
- Request DTOs
- Response DTOs

Example:
- CreateCourseRequest
- CourseResponse

---

# Validation Strategy

Validation uses:
- Jakarta Validation

Examples:
- @NotBlank
- @Email
- @Size
- @Valid

Validation belongs in DTOs.

---

# Exception Handling

Global exception handling uses:

@ControllerAdvice

Common exceptions:
- ResourceNotFoundException
- ValidationException
- UnauthorizedException
- BusinessException

---

# Security Architecture

Authentication:
- JWT-based

Authorization:
- role-based (future-ready)

Password storage:
- BCrypt hashing

Security layers:
- JWT filter
- authentication provider
- access validation

---

# API Design Principles

- RESTful APIs
- versioned endpoints
- standardized responses
- proper status codes
- pagination support

Base path:

/api/v1

---

# Response Format

All APIs should return:

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

---

# Logging Strategy

Use structured logging.

Log:
- errors
- authentication events
- important operations

Avoid:
- unnecessary logs
- sensitive data exposure

---

# Scalability Considerations

Architecture is prepared for:
- notifications
- analytics
- file storage
- websocket support
- RBAC
- microservice transition

---

# Performance Considerations

Use:
- pagination
- lazy loading
- indexed queries
- optimized joins

Avoid:
- N+1 queries
- eager loading
- large payloads

---

# Future Extensions

Planned scalable additions:
- notifications
- attendance
- assignments
- analytics
- audit logs
- team collaboration
- mentorship system

---

# Development Principles

Always prioritize:
- readability
- modularity
- scalability
- maintainability

Avoid:
- monolithic services
- duplicated logic
- tightly coupled modules