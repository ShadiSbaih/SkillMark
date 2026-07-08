# Skillmark Frontend Remake — Design Spec

> **Status:** Approved for implementation  
> **Scope:** Full Angular frontend remake aligned with the existing Spring Boot backend. Theme/tokens must not change.

---

## 1. Goal

Deliver a cohesive, modern SaaS-style Angular frontend for Skillmark that:

1. Is fully aligned with the existing Spring Boot API contracts documented in `backend/docs/PRD.md` and `docs/api-gap-audit.md`.
2. Replaces every placeholder page and component with a real, API-driven implementation.
3. Keeps the existing CSS design tokens in `frontend/src/styles.scss` unchanged.
4. Uses a consistent layout shell, shared component library, and responsive patterns across all user flows.

## 2. Constraints

| # | Constraint |
|---|------------|
| C1 | Keep `frontend/src/styles.scss` as the single source of styling truth. No Tailwind, no CSS-in-JS, no new theme file. |
| C2 | Stay on Angular 21, standalone components, signals, `ChangeDetectionStrategy.OnPush`, TanStack Query experimental, Clerk via `ngx-clerk`. |
| C3 | Do not modify backend code or API contracts. Only align frontend models/services to the backend. |
| C4 | Preserve the existing `ApiClientService`, response wrapper, and service/Query pattern where they already work. |
| C5 | All new components must be standalone and use signals/inputs/outputs. |
| C6 | All pages must be responsive (desktop, tablet, mobile). |
| C7 | No placeholder text such as `<p>.*works!</p>` or empty component bodies may remain. |

## 3. Current State Summary

The frontend already has a solid foundation:

- Angular 21 with standalone components and signals.
- `ApiClientService` wraps backend calls and unwraps the standard `{ success, data, timestamp }` envelope.
- TanStack Query services exist for most domains.
- Several shared components exist (`card`, `button`, `page-header`, `modal`, `empty-state`, `error-state`, `loading-state`).
- Design tokens are centralized in `src/styles.scss`.

Known problems from `docs/api-gap-audit.md`:

- Some placeholder components (avatar, chart, confirm-dialog, date-picker, file-upload, image-upload, status-badge).
- Some placeholder pages (my-enrollments, organization-overview, organization-settings, profile, landing).
- Minor model mismatches may remain (e.g., user search endpoint does not exist).
- Some components use two model directories (`core/models` and `shared/models`). `core/models` is the source of truth.

## 4. Architecture

### 4.1 High-level structure

```
frontend/src/app/
├── core/
│   ├── api/              # ApiClientService + response types
│   ├── auth/             # authGuard, authInterceptor, errorInterceptor, Clerk integration
│   ├── layout/           # PublicLayoutComponent, DashboardLayoutComponent
│   └── models/           # Single source of truth DTO models
├── services/             # One service per domain; wraps ApiClient + TanStack Query
├── shared/
│   ├── components/       # Reusable UI building blocks
│   └── directives/       # Future: click-outside, autofocus, etc.
└── pages/                # One folder per page (standalone component)
```

### 4.2 API contract layer

All backend communication goes through `ApiClientService`. Services use `injectQuery` / `injectMutation` from TanStack Query experimental.

Rules:

- Every service method must use a typed model from `core/models`.
- Every list endpoint must return `PageResponse<T>`.
- Mutations must invalidate query keys for related data.
- No service should construct raw URLs; use `ApiClientService` methods.
- Remove dead endpoints (e.g., `UsersService.searchByEmailMutation` if `/users/search` does not exist).

### 4.3 State management

- **Server state:** TanStack Query (`injectQuery`/`injectMutation`).
- **Local UI state:** Angular signals (`signal`, `computed`).
- **Form state:** Template-driven forms with `ngModel` for simple cases; reactive forms via `FormBuilder` for complex flows (quiz builder, resource uploads).
- **Global navigation state:** Computed from current route and authenticated user.

## 5. Shared Component Library

### 5.1 Final component inventory

| Component | Selector | Responsibility |
|-----------|----------|----------------|
| `ButtonComponent` | `app-button` | Styled button variants: primary, secondary, danger, ghost. Supports `loading`, `disabled`, `type`, `fullWidth`. |
| `CardComponent` | `app-card` | Bordered panel with optional `interactive` hover state. |
| `BadgeComponent` | `app-badge` | Color-coded badge: subtle/solid/outline × green/amber/red/gray/blue. |
| `StatusBadgeComponent` | `app-status-badge` | Domain-aware status mapper for program/quiz/attempt/certificate/enrollment statuses. |
| `PageHeaderComponent` | `app-page-header` | Title + subtitle + actions slot. |
| `EmptyStateComponent` | `app-empty-state` | Icon/illustration + message + optional action. |
| `ErrorStateComponent` | `app-error-state` | Error message + retry action. |
| `LoadingStateComponent` | `app-loading-state` | Centered spinner/placeholder. |
| `ModalComponent` | `app-modal` | Accessible dialog with title, body, footer actions slots. |
| `ConfirmDialogComponent` | `app-confirm-dialog` | Built on `app-modal`; confirms destructive actions. |
| `TableComponent` | `app-table` | Responsive table wrapper with loading/empty states and sortable headers. |
| `PaginationComponent` | `app-pagination` | Page controls bound to `PageResponse`. |
| `FormFieldComponent` | `app-form-field` | Label + input/textarea/select + error message. |
| `BreadcrumbComponent` | `app-breadcrumb` | Array of `{ label, route? }` items. |
| `FileUploadComponent` | `app-file-upload` | Select file, request presigned R2 URL, upload, emit resource payload. |
| `ImageUploadComponent` | `app-image-upload` | Image select + preview + upload; emits public URL. |
| `AvatarComponent` | `app-avatar` | Small user/org avatar image with fallback initials. |
| `ListItemComponents` | `app-*-list-item` | Reusable rows for organization, program, quiz, member, enrollment, resource, certificate, attempt. |

### 5.2 Components to remove

Remove placeholder components that are not implemented or are superseded:

- `chart` — use CSS chart utilities in `styles.scss` or simple inline bars.
- `date-picker` — replace with styled native `<input type="date">`.

## 6. Layout Shell

### 6.1 Public layout

Used for: landing, sign-in, sign-up, certificate verification.

- Minimal top navigation with logo and sign-in link.
- Centered content area.
- Simple footer with copyright/privacy placeholder.

### 6.2 Dashboard layout

Used for all authenticated pages.

- **Top bar (fixed height, ~64px):**
  - Brand logo + name
  - Organization switcher dropdown (for owners with multiple orgs)
  - Global search placeholder (visual only for MVP)
  - Clerk user button
- **Sidebar (240px wide, collapsible on mobile):**
  - Two nav groups: **Owner** and **Participant**
  - Links rendered based on current organization/program context and user role
  - Mobile sidebar opens as a drawer overlay
- **Main area:**
  - Breadcrumb strip
  - Page header
  - Content

### 6.3 Navigation groups

Owner links:

- Dashboard
- My Organizations
- (contextual under org): Overview, Members, Settings, Stats, Audit Logs, Certificates
- (contextual under program): Overview, Resources, Quizzes, Enrollments, Invitations, Stats, Settings
- (contextual under quiz): Overview, Builder, Attempts, Stats, Settings

Participant links:

- Dashboard
- My Programs
- My Attempts
- My Certificates

Account links:

- Profile
- Sign out

## 7. Page Domains & Flows

### 7.1 Public / auth

| Page | Purpose | Key Interactions |
|------|---------|------------------|
| `landing` | Marketing hero + CTA | Sign up / sign in buttons, feature highlights, certificate verify search. |
| `sign-in` | Clerk sign-in | Use `SignIn` component from `ngx-clerk`; redirect to `/dashboard` after auth. |
| `sign-up` | Clerk sign-up | Use `SignUp` component from `ngx-clerk`. |
| `verify-certificate` | Public certificate verification | Input verification code or route param; call `GET /api/v1/public/certificates/verify/:code`; display result card. |

### 7.2 Dashboard

| Page | Purpose | Key Data |
|------|---------|----------|
| `dashboard` | Role-aware home | Cards: organizations count, certificates count, attempts count, pass rate. Lists: recent organizations, recent certificates, recent attempts. |

### 7.3 Organizations

| Page | Purpose | Key Interactions |
|------|---------|------------------|
| `organizations` | List my organizations | Table/card list; create button. |
| `organizations/new` | Create organization | Form: name, slug, description, logo upload. |
| `organizations/:orgId` | Organization overview | Summary cards + recent programs + members preview. |
| `organizations/:orgId/members` | Manage members | Table with role, status, remove action. |
| `organizations/:orgId/settings` | Edit/delete org | Form pre-filled; archive/delete with confirm. |
| `organizations/:orgId/stats` | Org analytics | Metric grid + activity summary. |
| `organizations/:orgId/audit-logs` | Activity log | Table with action, entity, timestamp. |
| `organizations/:orgId/certificates` | Org certificates | Table with revoke/download actions. |

### 7.4 Programs

| Page | Purpose | Key Interactions |
|------|---------|------------------|
| `programs/:programId` | Program overview | Description, stats, resources preview, quizzes preview, enrollment status. |
| `programs/:programId/learn` | Participant learning view | Resources list + quiz cards with start/resume. |
| `programs/:programId/resources` | Manage resources | Add/edit/delete resource; visibility toggle; file upload. |
| `programs/:programId/quizzes` | List quizzes | Create quiz; list with status/publish. |
| `programs/:programId/enrollments` | Manage enrollments | Table; remove enrollment. |
| `programs/:programId/invitations` | Manage invitations | Create, disable, copy code. |
| `programs/:programId/stats` | Program analytics | Enrollments, completions, scores. |
| `programs/:programId/settings` | Edit program | Form: title, description, cover, schedule, status. |
| `organizations/:orgId/programs/new` | Create program | Same form as settings, empty. |

### 7.5 Quizzes

| Page | Purpose | Key Interactions |
|------|---------|------------------|
| `quizzes/:quizId` | Quiz overview | Settings summary, questions preview, stats preview. |
| `quizzes/:quizId/builder` | Build quiz | Add/edit/delete questions and options; mark correct answer; reorder. |
| `quizzes/:quizId/view` | Owner preview | Read-only participant view. |
| `quizzes/:quizId/attempt` | Take quiz | Timer, question navigation, submit. |
| `quizzes/:quizId/attempts` | List attempts | Table with owner view + participant view. |
| `quizzes/:quizId/stats` | Quiz analytics | Attempts, pass rate, score distribution. |
| `quizzes/:quizId/settings` | Edit quiz | Form: title, instructions, passing score, duration, max attempts, auto-issue. |
| `programs/:programId/quizzes/new` | Create quiz | Same form as settings, empty. |

### 7.6 Attempts & certificates

| Page | Purpose | Key Interactions |
|------|---------|------------------|
| `attempts/:attemptId/result` | Graded result | Score, pass/fail, certificate card if issued. |
| `my-attempts` | Participant attempts list | Table with quiz, score, status, date. |
| `my-certificates` | Participant certificates | Grid/list with download/view links. |
| `certificates/:certificateId` | Certificate detail | Recipient, program, quiz, score, status, verification code, download PDF. |

### 7.7 Misc

| Page | Purpose | Key Interactions |
|------|---------|------------------|
| `join/:code` | Accept invitation | Preview invitation; accept button; redirect on success. |
| `profile` | Edit profile | Display/update name, email, avatar. |

## 8. Data Flow & Error Handling

### 8.1 Query patterns

- Lists: `injectQuery(() => ({ queryKey: [domain, 'list', params], queryFn: ... }))`.
- Details: `injectQuery(() => ({ queryKey: [domain, id], queryFn: ..., enabled: !!id }))`.
- Mutations: `injectMutation(() => ({ mutationFn: ..., onSuccess: invalidate related queries }))`.

### 8.2 Error handling

- `errorInterceptor` maps HTTP errors to `ApiErrorResponse` and shows toast via `ngx-sonner`.
- Page-level errors: show `app-error-state` with retry.
- Form-level errors: display field errors returned by backend validation.
- 401: Clerk session expired → redirect to `/sign-in`.
- 403/404: show not-found/forbidden state.

### 8.3 Loading states

- Page skeleton: show `app-loading-state` while initial queries are pending.
- Inline skeletons: use CSS pulse utility for cards/lists.
- Buttons: `loading` state disables button and shows spinner.

## 9. Responsive & Accessibility

- Sidebar collapses to mobile drawer at `768px`.
- Tables wrap in `overflow-x-auto` containers.
- Form grids collapse to single column on mobile.
- Metric grids go 4 → 2 → 1 columns.
- Focus rings use existing `--primary` token.
- All interactive elements have visible focus states.
- Modal uses `role="dialog"`, `aria-modal`, and focus trap.

## 10. API Alignment Checklist

Every service must be verified against the backend controllers. Known actions:

- [ ] Verify `user.model.ts` fields match `UserResponse`.
- [ ] Remove `UsersService.searchByEmailMutation` if endpoint missing.
- [ ] Add `AuditLogResponse` model and use it in audit-logs page.
- [ ] Add `R2UploadUrlRequest/Response` and `CloudinarySignatureRequest/Response` models.
- [ ] Verify `ManualCertificateRequest` is used correctly.
- [ ] Verify all stats fields match backend DTOs.
- [ ] Verify all `PageResponse<T>` usages include pagination controls.

## 11. Testing Strategy

### 11.1 Automated

- `ng build --configuration production` exits 0 with no errors.
- `ng test` passes for all existing and new component specs.
- New specs focus on component rendering and input/output behavior, not full backend integration.

### 11.2 Manual QA flow

Minimum end-to-end validation:

1. Sign up / sign in via Clerk.
2. Create organization.
3. Create program.
4. Add a resource (link or file upload).
5. Create quiz with 3+ questions.
6. Publish quiz.
7. Copy invitation code.
8. Join program with code (second user or same user if allowed).
9. Start and submit quiz attempt.
10. View attempt result and certificate.
11. Verify certificate publicly.

## 12. Success Criteria

The remake is complete when:

1. `ng build` and `ng test` pass.
2. No placeholder pages or components remain.
3. All API service/model gaps from `docs/api-gap-audit.md` are resolved.
4. Every route in `app.routes.ts` renders a real page.
5. Key owner and participant flows are functional end-to-end.
6. Layout is responsive across desktop, tablet, and mobile.
7. `src/styles.scss` tokens remain unchanged except for additions required by new global utilities.

## 13. Open Decisions

None remaining after approval. All clarifying questions have been answered:

- Keep Angular 21 stack: yes.
- Full remake including layout shell and shared components: yes.
- Align to existing backend API, not generic adapter: yes.
- Clean modern SaaS dashboard, no external design reference: yes.
- Remove unused placeholder components: yes.
