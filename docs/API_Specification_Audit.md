# Cohive API Specification Audit

## Scope

This document captures the currently implemented REST contract exposed by the Cohive backend under `/api/v1`.
It supplements `docs/API_Design.md` with concrete implementation details verified against the codebase.

## Cross-Cutting Contract

- Base path: `/api/v1`
- Versioning strategy: path-based versioning; future revisions should use `/api/v2`, `/api/v3`, and so on
- Authentication: JWT bearer token for every endpoint except `POST /api/v1/auth/register` and `POST /api/v1/auth/login`
- Authorization: tenant isolation is enforced in services using the authenticated user role and organization ownership or enrollment membership
- Standard success envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

- Standard error envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "field: reason"
  ]
}
```

- Common status codes:
  - `200 OK` for successful reads and most updates
  - `201 Created` for successful creates
  - `400 Bad Request` for validation, malformed JSON, invalid enum values, and invalid UUID path/query bindings
  - `401 Unauthorized` for missing or invalid JWT credentials
  - `403 Forbidden` for cross-tenant or role-restricted access
  - `404 Not Found` when the target resource is absent in the caller's authorized scope
  - `409 Conflict` for duplicate or business-rule violations such as duplicate enrollments or duplicate certificate issuance
  - `429 Too Many Requests` when the fixed-window rate limit is exceeded
  - `500 Internal Server Error` for unhandled server failures
- Rate limiting:
  - Public auth endpoints: `30` requests per minute
  - Authenticated `GET` endpoints: `120` requests per minute
  - Authenticated write endpoints: `60` requests per minute
  - Response headers: `X-Rate-Limit-Limit`, `X-Rate-Limit-Remaining`, and `Retry-After` on `429`
- Caching:
  - Authenticated `GET` endpoints return `Cache-Control: private, max-age=60, must-revalidate`
  - Authenticated `GET` endpoints return `Vary: Authorization`
  - Mutating endpoints return `Cache-Control: no-store`
- Validation:
  - DTO validation uses Jakarta Validation annotations such as `@NotBlank`, `@NotNull`, `@Email`, and `@Size`
  - Resource URLs are additionally validated against the selected `ResourceType`
- Pagination, filtering, and sorting:
  - Paginated endpoints support `page`, `size`, and `sort`
  - `GET /api/v1/courses` also supports filtering by `organizationId`
  - Course-scoped resource, quiz, enrollment, and certificate collections currently return full scoped lists without pagination
- PATCH support:
  - No `PATCH` endpoints are currently implemented in the documented backend scope

## Endpoint Inventory

| Method | Path | Auth | Request Body | Success Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | `RegisterRequest` | `201` `ApiResponse<AuthResponse>` | Creates a user and returns a JWT |
| POST | `/api/v1/auth/login` | Public | `LoginRequest` | `200` `ApiResponse<AuthResponse>` | Authenticates existing credentials |
| POST | `/api/v1/auth/logout` | Bearer JWT | None | `200` `ApiResponse<Void>` | Client-side token invalidation acknowledgement |
| GET | `/api/v1/users/me` | Bearer JWT | None | `200` `ApiResponse<UserResponse>` | Returns current authenticated user |
| POST | `/api/v1/organizations` | Bearer JWT | `CreateOrganizationRequest` | `201` `ApiResponse<OrganizationResponse>` | Owner-scoped create |
| GET | `/api/v1/organizations` | Bearer JWT | None | `200` `ApiResponse<PageResponse<OrganizationResponse>>` | Supports `page`, `size`, `sort` |
| GET | `/api/v1/organizations/{id}` | Bearer JWT | None | `200` `ApiResponse<OrganizationResponse>` | Owner or authorized member only |
| DELETE | `/api/v1/organizations/{id}` | Bearer JWT | None | `200` `ApiResponse<Void>` | Owner only |
| POST | `/api/v1/organizations/{id}/students` | Bearer JWT | `AddOrganizationStudentRequest` | `201` `ApiResponse<Void>` | Adds existing student membership |
| GET | `/api/v1/organizations/{id}/students` | Bearer JWT | None | `200` `ApiResponse<PageResponse<StudentResponse>>` | Supports `page`, `size`, `sort` |
| POST | `/api/v1/students` | Bearer JWT | `CreateStudentRequest` | `201` `ApiResponse<StudentResponse>` | Creates user + student profile |
| GET | `/api/v1/students` | Bearer JWT | None | `200` `ApiResponse<PageResponse<StudentResponse>>` | Supports `page`, `size`, `sort` |
| GET | `/api/v1/students/{id}` | Bearer JWT | None | `200` `ApiResponse<StudentResponse>` | Owner or same student only |
| POST | `/api/v1/courses` | Bearer JWT | `CreateCourseRequest` | `201` `ApiResponse<CourseResponse>` | Owner only |
| GET | `/api/v1/courses` | Bearer JWT | None | `200` `ApiResponse<PageResponse<CourseResponse>>` | Supports `page`, `size`, `sort`, `organizationId` |
| GET | `/api/v1/courses/{id}` | Bearer JWT | None | `200` `ApiResponse<CourseResponse>` | Owner or enrolled student |
| PUT | `/api/v1/courses/{id}` | Bearer JWT | `UpdateCourseRequest` | `200` `ApiResponse<CourseResponse>` | Owner only |
| DELETE | `/api/v1/courses/{id}` | Bearer JWT | None | `200` `ApiResponse<Void>` | Owner only |
| POST | `/api/v1/enrollments` | Bearer JWT | `EnrollStudentRequest` | `201` `ApiResponse<EnrollmentResponse>` | Duplicate enrollments rejected with `409` |
| GET | `/api/v1/enrollments/course/{courseId}` | Bearer JWT | None | `200` `ApiResponse<List<EnrollmentResponse>>` | Owner or enrolled student scope |
| GET | `/api/v1/enrollments/student/{studentId}` | Bearer JWT | None | `200` `ApiResponse<List<EnrollmentResponse>>` | Tenant-filtered result set |
| POST | `/api/v1/resources` | Bearer JWT | `CreateResourceRequest` | `201` `ApiResponse<ResourceResponse>` | Owner only; URL/type rules enforced |
| GET | `/api/v1/resources/course/{courseId}` | Bearer JWT | None | `200` `ApiResponse<List<ResourceResponse>>` | Owner or enrolled student scope |
| POST | `/api/v1/quizzes` | Bearer JWT | `CreateQuizRequest` | `201` `ApiResponse<QuizResponse>` | Owner only |
| GET | `/api/v1/quizzes/course/{courseId}` | Bearer JWT | None | `200` `ApiResponse<List<QuizResponse>>` | Owner or enrolled student scope |
| POST | `/api/v1/certificates` | Bearer JWT | `IssueCertificateRequest` | `201` `ApiResponse<CertificateResponse>` | Requires valid enrollment |
| GET | `/api/v1/certificates/student/{studentId}` | Bearer JWT | None | `200` `ApiResponse<List<CertificateResponse>>` | Tenant-filtered result set |

## Resource Domain Notes

- `Resource` remains intentionally URL-backed because file uploads and binary storage are outside current scope
- `ResourceType` is strongly typed and drives:
  - allowed URI scheme validation
  - user-facing display name and description
  - category grouping
  - preview and download hints
  - API documentation metadata returned by `ResourceResponse`
- `ResourceResponse` exposes both the selected enum value and its derived metadata so API consumers do not need to hard-code lookup tables
