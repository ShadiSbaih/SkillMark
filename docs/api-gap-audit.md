# API Gap Audit

> Generated during Phase 1 of the full frontend/backend integration ferment.
> Compares Spring Boot controllers (`backend/src/main/java/com/library/Skillmark`) with Angular services (`frontend/src/app/services`) and core models (`frontend/src/app/core/models`).

## Backend endpoint summary

| Domain | Controller | Base path |
|--------|------------|-----------|
| Attempts | `QuizAttemptController` | `/api/v1` |
| Certificates | `CertificateController` | `/api/v1/certificates` |
| Certificates (public) | `PublicCertificateController` | `/api/v1/public/certificates` |
| Enrollments | `EnrollmentController` | `/api/v1` |
| Invitations | `InvitationController` | `/api/v1` |
| Media | `MediaController` | `/api/v1` |
| Memberships | `MembershipController` | `/api/v1/organizations/{organizationId}/members` |
| Organizations | `OrganizationController` | `/api/v1/organizations` |
| Programs | `ProgramController` | `/api/v1` |
| Quizzes | `QuizController` | `/api/v1` |
| Resources | `ResourceController` | `/api/v1` |
| Stats | `StatsController` | `/api/v1` |
| Storage | `StorageController` | `/api/v1` |
| Users (me) | `MeController` | `/api/v1/me` |
| Users | `UserController` | `/api/v1/users` |
| Webhooks | `AuthWebhookController` | `/api/v1/webhooks/auth` |

### Endpoints by domain

#### Attempts
- `POST /quizzes/{quizId}/attempts` → `StartAttemptResponse`
- `POST /quiz-attempts/{attemptId}/submit` → `AttemptResultResponse` (body: `SubmitAttemptRequest`)
- `GET /quiz-attempts/{attemptId}` → `AttemptResponse`
- `GET /quizzes/{quizId}/attempts` → `PageResponse<AttemptResponse>`
- `POST /quiz-attempts/{attemptId}/certificate` → `CertificateResponse` (body: optional `ManualCertificateRequest`)

#### Certificates
- `POST /api/v1/certificates` → `CertificateResponse` (body: `IssueCertificateRequest`)
- `GET /api/v1/certificates/{certificateId}` → `CertificateResponse`
- `PATCH /api/v1/certificates/{certificateId}/status` → `CertificateResponse` (body: `UpdateCertificateStatusRequest`)
- Public: `GET /api/v1/public/certificates/verify/{verificationCode}` → `PublicCertificateVerificationResponse`

#### Enrollments
- `POST /programs/{programId}/enrollments` → `EnrollmentResponse` (body: `CreateEnrollmentRequest`)
- `GET /programs/{programId}/enrollments` → `PageResponse<EnrollmentResponse>`
- `DELETE /programs/{programId}/enrollments/{userId}` → `Void`
- Me: `GET /me/enrollments` → `PageResponse<EnrollmentResponse>`

#### Invitations
- `POST /programs/{programId}/invitations` → `InvitationResponse` (body: `CreateInvitationRequest`)
- `GET /programs/{programId}/invitations` → `PageResponse<InvitationResponse>`
- `POST /invitations/{code}/join` → `InvitationResponse`
- `PATCH /invitations/{invitationId}/status` → `InvitationResponse` (body: `UpdateInvitationStatusRequest`)

#### Memberships
- `POST /organizations/{organizationId}/members` → `MembershipResponse` (body: `AddMemberRequest`)
- `GET /organizations/{organizationId}/members` → `PageResponse<MembershipResponse>`
- `DELETE /organizations/{organizationId}/members/{userId}` → `Void`

#### Organizations
- `POST /api/v1/organizations` → `OrganizationResponse` (body: `CreateOrganizationRequest`)
- `GET /api/v1/organizations` → `PageResponse<OrganizationResponse>`
- `GET /api/v1/organizations/{organizationId}` → `OrganizationResponse`
- `PUT /api/v1/organizations/{organizationId}` → `OrganizationResponse` (body: `UpdateOrganizationRequest`)
- `DELETE /api/v1/organizations/{organizationId}` → `Void`
- `GET /api/v1/organizations/{organizationId}/certificates` → `PageResponse<CertificateResponse>`
- `GET /api/v1/organizations/{organizationId}/audit-logs` → `PageResponse<AuditLogResponse>`

#### Programs
- `POST /organizations/{organizationId}/programs` → `ProgramResponse` (body: `CreateProgramRequest`)
- `GET /organizations/{organizationId}/programs` → `PageResponse<ProgramResponse>`
- `GET /programs/{programId}` → `ProgramResponse`
- `PUT /programs/{programId}` → `ProgramResponse` (body: `UpdateProgramRequest`)
- `PATCH /programs/{programId}/status` → `ProgramResponse` (body: `UpdateProgramStatusRequest`)
- `DELETE /programs/{programId}` → `Void`

#### Quizzes
- `POST /programs/{programId}/quizzes` → `QuizResponse` (body: `CreateQuizRequest`)
- `GET /quizzes` → `PageResponse<QuizResponse>`
- `GET /programs/{programId}/quizzes` → `PageResponse<QuizResponse>`
- `GET /quizzes/{quizId}` → `QuizResponse`
- `PUT /quizzes/{quizId}` → `QuizResponse` (body: `UpdateQuizRequest`)
- `DELETE /quizzes/{quizId}` → `Void`
- `POST /quizzes/{quizId}/questions` → `QuestionResponse` (body: `CreateQuestionRequest`)
- `PUT /quizzes/{quizId}/questions/{questionId}` → `QuestionResponse` (body: `CreateQuestionRequest`)
- `DELETE /quizzes/{quizId}/questions/{questionId}` → `Void`
- `POST /quizzes/{quizId}/questions/{questionId}/options` → `OptionResponse` (body: `CreateOptionRequest`)
- `PUT /quizzes/{quizId}/questions/{questionId}/options/{optionId}` → `OptionResponse` (body: `CreateOptionRequest`)
- `DELETE /quizzes/{quizId}/questions/{questionId}/options/{optionId}` → `Void`
- `PATCH /quizzes/{quizId}/status` → `QuizResponse` (body: `UpdateQuizStatusRequest`)
- `PATCH /quizzes/{quizId}/visibility` → `QuizResponse` (body: `UpdateQuizVisibilityRequest`)

#### Resources
- `POST /programs/{programId}/resources` → `ResourceResponse` (body: `CreateResourceRequest`)
- `GET /programs/{programId}/resources` → `PageResponse<ResourceResponse>`
- `GET /resources/{resourceId}` → `ResourceResponse`
- `PUT /resources/{resourceId}` → `ResourceResponse` (body: `CreateResourceRequest`)
- `DELETE /resources/{resourceId}` → `Void`
- `PATCH /resources/{resourceId}/visibility` → `ResourceResponse` (body: `UpdateResourceVisibilityRequest`)

#### Stats
- `GET /organizations/{organizationId}/stats` → `OrganizationStatsResponse`
- `GET /programs/{programId}/stats` → `ProgramStatsResponse`
- `GET /quizzes/{quizId}/stats` → `QuizStatsResponse`

#### Storage / Media
- `POST /storage/upload-urls` → `R2UploadUrlResponse` (body: `R2UploadUrlRequest`)
- `POST /media/signatures` → `CloudinarySignatureResponse` (body: `CloudinarySignatureRequest`)

#### Users
- `GET /users/me` → `UserResponse`
- `PATCH /users/me` → `UserResponse` (body: `UpdateUserProfileRequest`)
- Me: `GET /me/attempts` → `PageResponse<AttemptResponse>`
- Me: `GET /me/certificates` → `PageResponse<CertificateResponse>`

## Frontend service coverage

| Service | Status | Notes |
|---------|--------|-------|
| `AttemptsService` | ✅ Mostly aligned | Has mine, quiz, get, start, submit. Missing `POST /quiz-attempts/{attemptId}/certificate`. |
| `CertificatesService` | ✅ Aligned | Has get, issue, revoke, mine, org, public verify. |
| `EnrollmentsService` | ✅ Aligned | Has mine, program list, create, remove. |
| `InvitationsService` | ✅ Aligned | Has list, create, disable, updateStatus, join. |
| `MembershipsService` | ✅ Aligned | Has list, add, remove. |
| `OrganizationsService` | ✅ Aligned | Has list, get, create, update, delete. |
| `ProgramsService` | ✅ Aligned | Has list, get, create, update, publish, archive, delete. |
| `QuizzesService` | ✅ Aligned | Has extensive question/option CRUD plus status/visibility. |
| `ResourcesService` | ✅ Aligned | Has list, get, create, update, delete, visibility. |
| `StatsService` | ✅ Aligned | Has org, program, quiz stats. |
| `UsersService` | ⚠️ Minor mismatch | `searchByEmailMutation` calls `GET /users/search` which does **not** exist in `UserController`. Backend has no user search endpoint. |

## Gaps and action items

### Service gaps
1. **AttemptsService**: add `issueCertificateForAttempt(attemptId, request?: ManualCertificateRequest)` → `POST /quiz-attempts/{attemptId}/certificate`.
2. **UsersService**: `searchByEmailMutation` calls a non-existent `/users/search` endpoint. Either remove it or implement the endpoint on the backend (out of scope — remove from frontend or mark deprecated).

### Model gaps
1. **ManualCertificateRequest** model is missing in `attempt.model.ts`. Backend DTO fields unknown; inspect `ManualCertificateRequest.java`.
2. **Enrollment model**: backend returns `EnrollmentResponse` with `Instant enrolledAt`; frontend model matches. No gap.
3. **AuditLogResponse** model is missing in `frontend/src/app/core/models`; needed for organization audit-logs page.
4. **CloudinarySignatureRequest / Response** and **R2UploadUrlRequest / Response** models may be missing or unused; inspect if file/image upload components need them.

### Placeholder pages and components
Pages/components still containing `<p>.*works!</p>` or empty class bodies:
- `pages/my-enrollments/my-enrollments.ts/.html`
- `pages/organization-overview/organization-overview.ts/.html`
- `pages/organization-settings/organization-settings.ts/.html`
- `pages/profile/profile.ts` (empty class body)
- `pages/landing/landing.component.ts` (empty class body)
- `shared/components/avatar/*`
- `shared/components/chart/*`
- `shared/components/confirm-dialog/*`
- `shared/components/date-picker/*`
- `shared/components/file-upload/*`
- `shared/components/image-upload/*`
- `shared/components/status-badge/*`

### Auth
- `auth.interceptor.ts` already attaches `Authorization: Bearer <token>` from Auth session.
- `error.interceptor.ts` must be reviewed for 401/403 handling; this is tracked in Phase 2.

## Model comparison

Frontend models live in `frontend/src/app/core/models/*.model.ts` (11 files). Backend DTOs live in `backend/src/main/java/com/library/Skillmark/*/dto/*.java`.

### Aligned models (no action needed)

| Frontend model | Backend DTO | Status |
|----------------|-------------|--------|
| `attempt.model.ts` (`AttemptStatus`, `StartAttemptResponse`, `AttemptResponse`, `AttemptResultResponse`, `SubmitAnswerRequest`, `SubmitAttemptRequest`) | `attempt/dto/*.java` | ✅ Aligned |
| `certificate.model.ts` (`CertificateResponse`, `PublicCertificateVerificationResponse`, `IssueCertificateRequest`) | `certificate/dto/*.java` | ✅ Aligned |
| `enrollment.model.ts` (`Enrollment`, `CreateEnrollmentRequest`) | `enrollment/dto/*.java` | ✅ Aligned |
| `invitation.model.ts` (`Invitation`, `CreateInvitationRequest`, `UpdateInvitationStatusRequest`) | `invitation/dto/*.java` | ✅ Aligned |
| `membership.model.ts` (`MembershipResponse`, `AddMemberRequest`) | `membership/dto/*.java` | ✅ Aligned |
| `organization.model.ts` (`OrganizationResponse`, `CreateOrganizationRequest`, `UpdateOrganizationRequest`) | `organization/dto/*.java` | ✅ Aligned |
| `program.model.ts` (`ProgramResponse`, `CreateProgramRequest`, `UpdateProgramRequest`) | `program/dto/*.java` | ✅ Aligned |
| `quiz.model.ts` (`Quiz`, `Question`, `Option`, `CreateQuizRequest`, `UpdateQuizRequest`, `CreateQuestionRequest`, `CreateOptionRequest`) | `quiz/dto/*.java` | ✅ Aligned |
| `resource.model.ts` (`ResourceResponse`, `CreateResourceRequest`, `UpdateResourceVisibilityRequest`) | `resource/dto/*.java` | ✅ Aligned |

### Mismatched models (fix in Phase 2)

#### `stats.model.ts`
Backend field names differ significantly from the frontend.

**`OrganizationStatsResponse`**
- Frontend: `organizationId`, `programCount`, `memberCount`, `enrollmentCount`, `quizCount`, `certificateCount`, `averageScore`, `passRate`
- Backend: `totalPrograms`, `totalMembers`, `totalEnrolledParticipants`, `totalQuizzes`, `totalAttempts`, `totalCertificates`, `averageScore`, `passRate`
- Action: update frontend field names to match backend, or add a mapper. Prefer renaming frontend to backend names.

**`ProgramStatsResponse`**
- Frontend: `programId`, `enrollmentCount`, `resourceCount`, `quizCount`, `certificateCount`, `averageScore`, `passRate`
- Backend: `totalEnrollments`, `activeEnrollments`, `resourcesCount`, `quizzesCount`, `attemptsCount`, `passedParticipants`, `certificatesIssued`, `averageScore`
- Action: update frontend field names to match backend.

**`QuizStatsResponse`**
- Frontend: `quizId`, `attemptCount`, `averageScore`, `highestScore`, `lowestScore`, `passCount`, `failCount`, `passRate`
- Backend: `attemptsCount`, `submittedAttempts`, `averageScore`, `highestScore`, `lowestScore`, `passCount`, `failCount`, `passRate`
- Action: remove `quizId` from frontend (backend does not return it) and add `submittedAttempts`.

#### `user.model.ts`

**`UserResponse`**
- Frontend field: `authId: string`
- Backend field: `authUserId: UUID`
- Action: rename frontend `authId` → `authUserId` and treat as string.

**`UpdateUserProfileRequest`**
- Frontend: `email`, `name?`, `avatarUrl?`
- Backend: `name`, `email`, `avatarUrl`
- Action: backend obtains identity from the authenticated session; frontend sends profile fields only.

### Missing frontend models

| Backend DTO | Needed for |
|-------------|-----------|
| `attempt/dto/ManualCertificateRequest.java` (`String title`) | `AttemptsService.issueCertificateForAttempt` |
| `audit/dto/AuditLogResponse.java` | Organization audit-logs page |
| `storage/dto/R2UploadUrlRequest.java` / `R2UploadUrlResponse.java` | File upload via R2 |
| `media/dto/CloudinarySignatureRequest.java` / `CloudinarySignatureResponse.java` | Image upload via Cloudinary |

## Updated gaps and action items

### Service gaps
1. **AttemptsService**: add `issueCertificateForAttempt(attemptId, request?: ManualCertificateRequest)` → `POST /quiz-attempts/{attemptId}/certificate`.
2. **UsersService**: `searchByEmailMutation` calls a non-existent `/users/search` endpoint. Either remove it or implement the endpoint on the backend (out of scope — remove from frontend or mark deprecated).

### Model gaps
1. **ManualCertificateRequest** model is missing in `attempt.model.ts`.
2. **Stats models** (`stats.model.ts`) use wrong field names; must be updated to match backend DTOs.
3. **User model** (`user.model.ts`) uses `authId` instead of backend's `authUserId`.
4. **SyncUserRequest** includes `authId` that backend does not accept.
5. **AuditLogResponse**, **R2UploadUrlRequest/Response**, and **CloudinarySignatureRequest/Response** models are missing.

### Placeholder pages and components
Pages/components still containing `<p>.*works!</p>` or empty class bodies:
- `pages/my-enrollments/my-enrollments.ts/.html`
- `pages/organization-overview/organization-overview.ts/.html`
- `pages/organization-settings/organization-settings.ts/.html`
- `pages/profile/profile.ts` (empty class body)
- `pages/landing/landing.component.ts` (empty class body)
- `shared/components/avatar/*`
- `shared/components/chart/*`
- `shared/components/confirm-dialog/*`
- `shared/components/date-picker/*`
- `shared/components/file-upload/*`
- `shared/components/image-upload/*`
- `shared/components/status-badge/*`

### Auth
- `auth.interceptor.ts` already attaches `Authorization: Bearer <token>` from Auth session.
- `error.interceptor.ts` must be reviewed for 401/403 handling; this is tracked in Phase 2.

## Recommendations
1. Fix service and model gaps in Phase 2 before building pages.
2. Implement shared components first so pages can use them.
3. Build placeholder pages in dependency order: organizations → programs → quizzes/resources/enrollments/invitations.
4. Add loading/error/empty states using existing `LoadingStateComponent`, `ErrorStateComponent`, and `EmptyStateComponent`.
