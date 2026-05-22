# API_Design.md

# Cohive API Design

## Overview

Cohive exposes a RESTful API built with Spring Boot.

The API is designed to be:
- modular
- scalable
- secure
- frontend-friendly
- versioned

Base URL:

/api/v1

---

# API Standards

## Request Format

Requests use JSON.

Example:

```json
{
  "title": "Java Fundamentals"
}
```

---

# Response Format

All responses follow:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

# Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

# HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

# Authentication API

## Register

POST /api/v1/auth/register

### Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "OWNER"
}
```

Notes:
- `role` is optional and defaults to `STUDENT`.

### Response

```json
{
  "success": true,
  "message": "User registered successfully",
### Request

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

  "data": {
    "token": "jwt_token"
  }
}
```

---

# Login

POST /api/v1/auth/login

### Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token"
  }
}
```

---

# User API

## Get Current User

GET /api/v1/users/me

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

# Organization API

## Create Organization

POST /api/v1/organizations

### Request

```json
{
  "name": "Tech Academy"
}
```

---

## Get Organizations

GET /api/v1/organizations

---

## Get Organization By ID

GET /api/v1/organizations/{id}

---

## Delete Organization

DELETE /api/v1/organizations/{id}

---

## Add Student to Organization

POST /api/v1/organizations/{id}/students

### Request

```json
{
  "studentId": "uuid"
}
```

---

## Get Organization Students

GET /api/v1/organizations/{id}/students

---

# Course API

## Create Course

POST /api/v1/courses

### Request

```json
{
  "title": "Spring Boot Basics",
  "description": "Backend fundamentals",
  "organizationId": "uuid"
}
```

---

## Get Courses

GET /api/v1/courses

---

## Get Course By ID

GET /api/v1/courses/{id}

---

## Update Course

PUT /api/v1/courses/{id}

---

## Delete Course

DELETE /api/v1/courses/{id}

---

# Student API

## Create Student

POST /api/v1/students

---

## Get Students

GET /api/v1/students

---

## Get Student By ID

GET /api/v1/students/{id}

---

# Enrollment API

## Enroll Student

POST /api/v1/enrollments

### Request

```json
{
  "studentId": "uuid",
  "courseId": "uuid"
}
```

---

## Get Course Enrollments

GET /api/v1/enrollments/course/{courseId}

---

## Get Student Enrollments

GET /api/v1/enrollments/student/{studentId}

---

# Resource API

## Create Resource

POST /api/v1/resources

### Request

```json
{
  "title": "Spring Docs",
  "type": "LINK",
  "url": "https://spring.io",
  "courseId": "uuid"
}
```

Supported `type` values:
- LINK

---

## Get Course Resources

GET /api/v1/resources/course/{courseId}

---

# Quiz API

## Create Quiz

POST /api/v1/quizzes

### Request

```json
{
  "title": "Java Quiz",
  "courseId": "uuid"
}
```

---

## Get Course Quizzes

GET /api/v1/quizzes/course/{courseId}

---

# Certificate API

## Issue Certificate

POST /api/v1/certificates

### Request

```json
{
  "studentId": "uuid",
  "courseId": "uuid",
  "title": "Certificate of Completion"
}
```

---

## Get Student Certificates

GET /api/v1/certificates/student/{studentId}

---

# Pagination Standard

List endpoints should support:

?page=0&size=10&sort=createdAt,desc

Example:

GET /api/v1/courses?page=0&size=10

---

# Filtering Strategy

Support filtering through query params.

Example:

GET /api/v1/courses?organizationId=uuid

---

# Validation Rules

Use DTO validation.

Examples:
- @NotBlank
- @Email
- @Valid

Validation errors should return:

400 Bad Request

---

# Security Design

Authentication:
- JWT Bearer Token

Header format:

Authorization: Bearer <token>

---

# Protected Routes

All routes except:
- /auth/login
- /auth/register

require authentication.

---

# API Versioning

Current version:

/api/v1

Future versions:
- /api/v2
- /api/v3

---

# Naming Conventions

Use:
- plural resource names
- lowercase paths
- kebab-free REST endpoints

Good:
- /courses
- /students

Avoid:
- /getCourses
- /createCourse

---

# Future API Extensions

Planned APIs:
- notifications
- attendance
- assignments
- analytics
- role management
- file uploads
- mentorship sessions

---

# OpenAPI Documentation

Swagger/OpenAPI should be enabled.

Recommended endpoint:

/swagger-ui.html

---

# API Design Goals

The API should remain:
- predictable
- consistent
- scalable
- frontend-friendly
- maintainable
- secure
- modular