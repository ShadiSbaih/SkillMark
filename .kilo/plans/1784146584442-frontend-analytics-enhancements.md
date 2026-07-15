# Skillmark Enhancement Plan: Frontend UX & Analytics

## Goal
Deliver full-stack enhancements that improve the participant and organizer experience in Skillmark, with a strong focus on **frontend UX & features** and **analytics & reporting**, supported by the minimal necessary backend changes.

## Context

### Current Stack
- **Backend:** Spring Boot 3.x, Java 17, Spring Security (native JWT), Spring Data JPA, Flyway, PostgreSQL (Neon in prod, H2 local/test).
- **Frontend:** Angular 21 standalone, TanStack Query experimental, RxJS, lucide-angular, ngx-sonner, Vitest.
- **Storage:** Cloudflare R2 (files/PDFs), Cloudinary (images/logos).
- **Auth:** Native JWT (cookie + Bearer fallback); roles are `OWNER` or `PARTICIPANT` at organization-membership level.

### Existing Feature Surface
- Auth (register/login/email verification/password reset).
- Organization and member management.
- Program creation, publishing, archiving, invitations, enrollments.
- Program resources (links/files/videos/documents) with visibility toggles.
- Quizzes with single-choice questions, batch question creation, publish/archive.
- Quiz attempts with timed duration, max attempts, auto-grading, pass/fail.
- Certificates auto-issued or manually issued, public verification, revocation.
- Basic stats endpoints for organization, program, and quiz.
- Audit log stream for owners.

### Key Gaps Identified
1. **Analytics are shallow:** only aggregate counts/averages; no per-question breakdowns, cohort trends, score distribution, or exportable reports.
2. **Certificate PDF generation is not implemented:** the `Certificate` entity has `pdf_url`/`pdf_object_key`, but no PDF generation service exists.
3. **Quiz timer is client-trust-based:** `expires_at` is enforced on submit, but there is no server-side auto-expiration of abandoned `IN_PROGRESS` attempts.
4. **Participant UX lacks progress signals:** no completion percentage per program, no visible skill tracking, no "next recommended resource/quiz" flow.
5. **Owner dashboard is minimal:** stats cards only; no charts, no enrollment funnels, no certificate issuance timelines.
6. **No bulk/invite management tools:** invitations cannot be filtered, searched, or limited.
7. **No search/filter/sort on most list views:** frontend does not expose query parameters from the API.
8. **Accessibility and mobile responsiveness are untested:** shared components are custom-built with no a11y annotations.

## Decisions

1. **Scope prioritization:** Focus first on analytics/reporting because it unlocks the most value for organizers and participants, then wrap the results in richer frontend dashboards and flows.
2. **Full-stack delivery:** Every frontend enhancement that needs a new backend contract will include the corresponding API/DTO/migration changes.
3. **Keep MVP boundaries:** Do not add payments, forums, video hosting, mobile apps, or public marketplace features.
4. **Reuse existing patterns:** Use current Angular standalone components, TanStack Query signals, and Spring service/repository/controller layers; do not introduce new state-management or CSS frameworks.
5. **Charts:** Add a lightweight charting library (`chart.js` + `ng2-charts` or a small D3-based component) only for analytics views; keep bundle impact low.
6. **PDF generation:** Use OpenPDF or Flying Saucer (iText open-source alternatives) for certificate PDFs; render QR code as Base64 data URL and embed in template.
7. **Timer hardening:** Add a server-side scheduled task (Spring `@Scheduled`) that expires stale `IN_PROGRESS` attempts based on `expires_at`.

## Plan

### Phase 1 — Analytics Foundation
1. **Extend quiz attempt analytics**
   - Add repository methods in `QuizAttemptRepository` for:
     - score distribution histogram (0-10, 11-20, ... 91-100).
     - attempts over time (daily/weekly buckets).
     - per-question correct/incorrect counts.
   - Create `QuizQuestionStatsResponse` DTO and add `GET /api/v1/quizzes/{id}/questions/stats` endpoint (owner only).
   - Create `QuizAttemptTimelineResponse` DTO and add `GET /api/v1/quizzes/{id}/attempts/timeline` endpoint.
2. **Extend program analytics**
   - Add `ProgramEnrollmentTimelineResponse` and `GET /api/v1/programs/{id}/enrollments/timeline`.
   - Add `ProgramCompletionStatsResponse` with enrollment → attempt → certificate funnel counts.
3. **Extend organization analytics**
   - Add `OrganizationCertificatesTimelineResponse` and `GET /api/v1/organizations/{id}/certificates/timeline`.
   - Add top programs by enrollments/certificates in `OrganizationStatsResponse`.
4. **Frontend analytics pages**
   - Build `quiz-analytics` page for owners with score distribution chart, attempts timeline, and per-question heatmap.
   - Build `program-analytics` page with enrollment/completion funnel and certificate timeline.
   - Enhance organization overview with certificates-over-time chart and top-programs table.
5. **Validation:** Unit tests for new repository aggregations; integration tests for new endpoints; manual UI verification that charts render with empty/zero states.

### Phase 2 — Certificate Experience
6. **Certificate PDF generation (backend)**
   - Add `CertificatePdfGenerator` service using OpenPDF/Flying Saucer with an HTML template (A4 landscape) including recipient name, program/quiz/organization snapshots, score, certificate number, issue date, and QR code.
   - Generate QR code pointing to `/verify/{verificationCode}`; upload PDF and QR PNG to R2.
   - Update `CertificateService.issueAutomaticallyIfEligible` and `createCertificate` to trigger async PDF generation via `@Async` or a lightweight job table.
   - Add `GET /api/v1/certificates/{id}/download` that returns a short-lived presigned R2 URL.
7. **Certificate sharing/UX (frontend)**
   - Redesign `certificate-detail` page to show certificate preview, download button, copy verification link, and social-share buttons (LinkedIn/Twitter/email).
   - Add public `/verify/:code` page with branded verification card and optional PDF preview.
8. **Validation:** Verify PDF contents with manual inspection; ensure revoked certificates cannot be downloaded; test async failures do not break attempt submission.

### Phase 3 — Quiz & Learning UX
9. **Server-side attempt expiration**
   - Add `AttemptExpirationJob` Spring component that runs every minute and marks `IN_PROGRESS` attempts with `expires_at < now()` as `EXPIRED`.
   - Update `QuizAttemptService.start` to auto-expire stale attempts before checking `maxAttempts`.
10. **Progress tracking**
    - Add backend computed fields to `ProgramResponse`: `completedResourcesCount`, `availableQuizzesCount`, `passedQuizzesCount`, `overallProgressPercent`.
    - Add `GET /api/v1/programs/{id}/progress` endpoint returning per-resource and per-quiz completion status.
    - Build `program-learn` participant view showing a checklist/timeline of resources and quizzes with next-action call-to-action.
11. **Quiz taking improvements**
    - Add persistent local-storage answer draft so a page refresh does not lose progress.
    - Show a visible countdown timer and warning at 1 minute remaining.
    - Add per-question flagging/bookmarking and a question navigator.
    - Show explanations for incorrect answers on the `attempt-result` page.
12. **Validation:** Integration tests for expiration job; unit tests for progress calculations; manual quiz-flow testing across desktop and mobile.

### Phase 4 — Owner Productivity
13. **List view enhancements**
    - Add search, status filters, and sorting to organizations, programs, quizzes, members, enrollments, and invitations pages.
    - Expose existing backend pagination/sort/filter query params in the frontend services.
14. **Invitation management**
    - Add invitation status filter, copy-link button, and disable/delete actions on `program-invitations` and organization-level invitations.
    - Add bulk-create invitations endpoint if not present.
15. **Dashboard upgrades**
    - Replace static stat cards with summary cards + sparklines on the owner dashboard.
    - Add "recent activity" feed and "pending actions" list (e.g., unpublished quizzes, draft programs).
16. **Validation:** Verify filtered list API calls in network tab; ensure filters handle empty states and errors gracefully.

### Phase 5 — Accessibility & Polish
17. **Accessibility pass**
    - Add `aria-label`, focus management, and keyboard navigation to shared components (modal, table, form-field, pagination).
    - Ensure color contrast meets WCAG 2.1 AA on status badges and buttons.
18. **Mobile responsiveness**
    - Audit dashboard layout, quiz attempt, and certificate pages on narrow viewports.
    - Add responsive tables/cards for member/enrollment lists.
19. **Error & empty states**
    - Standardize empty-state illustrations and retry flows across all list pages.
    - Add skeleton loaders for async TanStack Query views.
20. **Validation:** Run automated a11y checks (Axe or Lighthouse); manual mobile smoke test.

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| PDF generation blocks request/response if done synchronously | Generate PDF asynchronously and expose a polling/download endpoint. |
| Heavy analytics queries slow production Postgres | Use read-only transactions, materialized views if needed, and cap date ranges. |
| New charting library bloats bundle | Use tree-shakeable charting and lazy-load analytics routes. |
| Timer expiration job changes attempt semantics | Clearly document behavior and add integration tests around `maxAttempts` and expiration. |
| Frontend service changes break existing tests | Update Vitest specs and run `ng test` after each phase. |

## Validation Plan

- **Backend:** `gradlew test` must pass; add new tests for new endpoints, aggregations, PDF generation, and expiration job.
- **Frontend:** `ng test` must pass; add component tests for new analytics and learn pages.
- **Integration:** Run local end-to-end smoke tests for: publish program → invite → enroll → attempt → certificate → verify.
- **Manual QA:** Verify charts on real demo data, test certificate PDF download, test mobile quiz attempt, verify a11y with Lighthouse.

## Open Questions

1. Should the certificate PDF be generated automatically on every passing attempt, or on first download to save storage/R2 costs?
2. Should analytics be real-time or cached? What is the expected data volume per organization?
3. Do you want to keep the current custom component library, or are you open to introducing a lightweight UI kit (e.g., Angular Material CDK) for tables/forms?

## Recommended Next Step

Begin **Phase 1 — Analytics Foundation**. It delivers immediate organizer value, requires only additive backend changes, and provides the data needed for subsequent dashboard and certificate UX improvements.
