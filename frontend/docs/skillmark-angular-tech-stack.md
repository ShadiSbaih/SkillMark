# Skillmark Frontend Tech Stack — Angular

## Goal

Build the Skillmark frontend as a modern Angular dashboard and participant portal that connects to the existing Spring Boot API-first backend.

This frontend will support:

- Authentication with Auth
- Organization owner dashboard
- Program/workshop management
- Invitation join flow
- Resources
- Quizzes and attempts
- Certificates
- Public certificate verification
- Statistics and audit logs later

---

## Core Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Angular |
| Language | TypeScript |
| App Structure | Standalone Components |
| Routing | Angular Router |
| API Calls | Angular HttpClient |
| API Middleware | Functional HTTP Interceptors |
| Local UI State | Angular Signals |
| Server State / Cache | TanStack Query for Angular |
| Styling | Custom CSS design tokens (styles.scss) |
| Forms | Angular Reactive Forms |
| Authentication | Native JWT (cookie-based, withCredentials) |
| Icons | lucide-angular |
| Toasts / Notifications | ngx-sonner or a lightweight Angular toast library |
| Charts Later | ECharts or ngx-charts |
| Date Handling | date-fns or Day.js |
| Validation | Angular Validators, optionally Zod |
| Testing | Vitest or Karma/Jasmine, plus Playwright for E2E later |

---

## Important Decision

Do not use Material UI.

Also avoid Angular Material for now unless the project later needs complex ready-made components.

The UI should be built mainly with:

```txt
Angular + custom CSS design tokens + small custom reusable components
```

This gives more control over the design and avoids making the dashboard look like a default Material dashboard.

---

## Recommended Stack

```txt
Angular
TypeScript
Standalone Components
Angular Router
Angular HttpClient
Functional Interceptors
Angular Signals
TanStack Query for Angular
Custom CSS design tokens (styles.scss)
Reactive Forms
Native JWT auth (cookie-based)
lucide-angular (installed, currently unused)
ngx-sonner
date-fns or Day.js (installed, currently unused)
Playwright later for E2E tests
```

---

## Why This Stack Fits Skillmark

Skillmark is an API-first platform. Most frontend screens will load, mutate, and refresh backend data.

Examples:

- Organizations
- Programs
- Invitations
- Resources
- Quizzes
- Attempts
- Certificates
- Audit logs
- Statistics

Because of that, the frontend needs strong server-state handling.

Use:

```txt
TanStack Query for Angular
```

for API data, caching, loading states, errors, refetching, and mutations.

Styling is implemented with custom CSS variables and utility classes in `styles.scss`, not Tailwind CSS.

Use:

```txt
Angular Signals
```

for local UI state such as:

- sidebar open/closed
- selected tab
- theme
- current filters
- dialog state
- temporary form state

Do not use NgRx at the beginning. It is too heavy for the current frontend needs.

---

## Suggested Frontend Folder Structure

```txt
frontend/
  src/
    app/
      core/
        api/
          users.api.ts
          organizations.api.ts
          programs.api.ts
          invitations.api.ts
          resources.api.ts
          quizzes.api.ts
          attempts.api.ts
          certificates.api.ts
          audit-logs.api.ts

        auth/
          auth.service.ts
          auth.guard.ts

        interceptors/
          auth.interceptor.ts
          error.interceptor.ts

        models/
          api-response.model.ts
          user.model.ts
          organization.model.ts
          program.model.ts
          quiz.model.ts
          certificate.model.ts

        constants/
          routes.constants.ts

      shared/
        components/
          button/
          input/
          card/
          modal/
          table/
          badge/
          empty-state/
          page-header/
          loading-state/
          error-state/

        pipes/
        directives/

      layouts/
        public-layout/
        dashboard-layout/

      features/
        auth/
        dashboard/
        organizations/
        programs/
        invitations/
        resources/
        quizzes/
        attempts/
        certificates/
        public-verification/
        audit-logs/

      app.routes.ts
      app.config.ts
```

---

## UI Component Strategy

Since Material UI / Angular Material will not be used, create a small internal UI kit.

Start with these shared components:

```txt
ButtonComponent
InputComponent
TextareaComponent
SelectComponent
CardComponent
ModalComponent
TableComponent
BadgeComponent
PageHeaderComponent
EmptyStateComponent
LoadingStateComponent
ErrorStateComponent
ConfirmDialogComponent
```

Style them with Tailwind CSS.

This keeps the UI consistent without depending on a heavy component library.

---

## Authentication Strategy

The backend uses native JWT auth and sets the token in an `httpOnly`, `Secure`, `SameSite=Lax` cookie on login.

Frontend flow:

1. User registers or logs in via `/api/v1/auth/register` or `/api/v1/auth/login`.
2. Backend issues a JWT and sets it as an `access_token` cookie.
3. Angular HTTP requests use `withCredentials: true` so the cookie is sent automatically.
4. Backend validates the JWT cookie (or `Authorization: Bearer <token>` fallback).
5. Backend resolves the local user from the token claims.

Create an auth interceptor only if additional header logic is needed:

```txt
auth.interceptor.ts
```

Responsibilities:

- Ensure `withCredentials: true` on API requests.
- Optionally attach `Authorization: Bearer <token>` for non-cookie flows.
- Skip auth header for public routes such as certificate verification if needed.

---

## API Response Model

The backend uses a standard response wrapper.

Create:

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: {
    field?: string;
    message: string;
  }[];
  path?: string;
  timestamp: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
};
```

---

## Main Pages

### Public Pages

```txt
/
/login
/join/:code
/verify/:verificationCode
```

### Dashboard Pages

```txt
/dashboard
/organizations
/organizations/:organizationId
/organizations/:organizationId/members
/organizations/:organizationId/programs
/organizations/:organizationId/audit-logs

/programs/:programId
/programs/:programId/resources
/programs/:programId/quizzes
/programs/:programId/enrollments
/programs/:programId/invitations

/quizzes/:quizId
/quizzes/:quizId/questions
/quizzes/:quizId/attempts

/attempts/:attemptId
/certificates
/certificates/:certificateId
```

---

## First Implementation Order

Build the frontend in this order:

### Phase 1: Project Setup

- Create Angular app
- Add Tailwind CSS
- Add routing
- Add layouts
- Add basic shared UI components
- Add environment config

### Phase 2: Auth + API Layer

- Add Auth auth
- Add auth guard
- Add HTTP interceptor
- Add API response models
- Add base API service
- Add error handling

### Phase 3: Owner Flow

- Organizations list
- Create organization
- Organization details
- Programs list
- Create program
- Publish/archive program
- Create invitation

### Phase 4: Participant Flow

- Join invitation page
- My enrollments
- Program overview
- Resources
- Published quizzes
- Start attempt
- Submit attempt
- View result

### Phase 5: Certificates

- My certificates
- Certificate details
- Public verification page

### Phase 6: Advanced Owner Pages

- Members
- Attempts review
- Statistics
- Audit logs
- Storage/media upload

---

## Packages To Install

Suggested packages:

```bash
npm install @tanstack/angular-query-experimental
npm install ngx-sonner
```

The app currently uses custom CSS in `styles.scss` instead of Tailwind CSS. `lucide-angular` and `date-fns` are present in `package.json` but not imported anywhere; install only if you actually adopt them.

Optional:

```bash
npm install zod
npm install echarts ngx-echarts
```

Do not install:

```bash
@angular/material
@mui/material
ngrx/store
```

at the beginning.

---

## Final Recommendation

Use this stack:

```txt
Angular + TypeScript + Standalone Components
Angular Router
Angular HttpClient + Functional Interceptors
Angular Signals
TanStack Query for Angular
Custom CSS design tokens (styles.scss)
Reactive Forms
Native JWT auth (cookie-based)
lucide-angular (installed, currently unused)
ngx-sonner
date-fns (installed, currently unused)
```

Avoid Material UI and avoid Angular Material for now.

Build a clean custom dashboard UI using Tailwind CSS and reusable shared components.
