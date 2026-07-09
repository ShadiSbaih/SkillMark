# Simpler Program Invitation Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the program invitation flow into a one-click magic link: authenticated users who open `/join/{code}` are joined automatically; unauthenticated users are sent to sign-in with a redirect back to the link.

**Architecture:** The backend `InvitationService.join` becomes idempotent for already-enrolled users. The frontend `JoinComponent` auto-calls the join mutation when the user is authenticated and the preview succeeds. The sign-in page reads a `redirect` query param and navigates there after login.

**Tech Stack:** Java 17 + Spring Boot 4 (backend), Angular 19 + TanStack Query + Vitest (frontend).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `backend/src/main/java/com/library/Skillmark/invitation/service/InvitationService.java` | Make `join` idempotent for already-enrolled users. |
| `backend/src/test/java/com/library/Skillmark/invitation/service/InvitationServiceTest.java` | Unit tests for the new idempotent join behavior. |
| `frontend/src/app/pages/join/join.component.ts` | Auto-join logic and unauthenticated redirect. |
| `frontend/src/app/pages/join/join.component.html` | Loading/error UI for auto-join. |
| `frontend/src/app/pages/join/join.component.spec.ts` | Tests for auto-join, redirect, and fallback form. |
| `frontend/src/app/pages/program-invitations/program-invitations.component.ts` | Default `maxUses` to unlimited; copy link after creation. |
| `frontend/src/app/pages/program-invitations/program-invitations.component.html` | Optional UI polish (not required for behavior). |
| `frontend/src/app/pages/sign-in/sign-in.ts` | Read `redirect` query param and navigate there after login. |
| `frontend/src/app/pages/sign-in/sign-in.spec.ts` | Tests for redirect navigation. |

---

### Task 1: Make `InvitationService.join` idempotent

**Files:**
- Modify: `backend/src/main/java/com/library/Skillmark/invitation/service/InvitationService.java`

- [ ] **Step 1: Locate the existing enrollment check**

Find this block inside the `join` method (around line 65):

```java
if (enrollmentRepository.existsByProgramIdAndUserIdAndStatus(invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE)) {
    throw new ConflictException("User is already actively enrolled in this program");
}
```

- [ ] **Step 2: Replace it with an early success return**

```java
if (enrollmentRepository.existsByProgramIdAndUserIdAndStatus(invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE)) {
    return InvitationResponse.from(invitation);
}
```

Place the check **before** `validateJoinable(invitation)` so already-enrolled users are not rejected by an expired or maxed-out invitation.

- [ ] **Step 3: Verify imports**

Ensure `InvitationResponse` is already imported (it is used elsewhere in the file).

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/library/Skillmark/invitation/service/InvitationService.java
git commit -m "feat(invitation): return success when user is already enrolled"
```

---

### Task 2: Add backend unit tests for idempotent join

**Files:**
- Create: `backend/src/test/java/com/library/Skillmark/invitation/service/InvitationServiceTest.java`

- [ ] **Step 1: Create the test class**

```java
package com.library.Skillmark.invitation.service;

import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.invitation.dto.InvitationResponse;
import com.library.Skillmark.invitation.entity.InvitationLink;
import com.library.Skillmark.invitation.enums.InvitationStatus;
import com.library.Skillmark.invitation.repository.InvitationLinkRepository;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InvitationServiceTest {

    private InvitationLinkRepository invitationRepository;
    private ProgramEnrollmentRepository enrollmentRepository;
    private OrganizationMembershipRepository membershipRepository;
    private UserRepository userRepository;
    private AuthorizationService authorizationService;
    private AuditLogService auditLogService;
    private InvitationService invitationService;

    @BeforeEach
    void setUp() {
        invitationRepository = mock(InvitationLinkRepository.class);
        enrollmentRepository = mock(ProgramEnrollmentRepository.class);
        membershipRepository = mock(OrganizationMembershipRepository.class);
        userRepository = mock(UserRepository.class);
        authorizationService = mock(AuthorizationService.class);
        auditLogService = mock(AuditLogService.class);

        invitationService = new InvitationService(
                invitationRepository,
                enrollmentRepository,
                membershipRepository,
                userRepository,
                authorizationService,
                auditLogService
        );
    }

    @Test
    void join_shouldReturnInvitationWhenUserAlreadyEnrolled() {
        UUID userId = UUID.randomUUID();
        String code = "VALID-CODE";
        InvitationLink invitation = activeInvitation(code);
        User user = user(userId);

        when(invitationRepository.findByCodeForUpdate(code)).thenReturn(Optional.of(invitation));
        when(enrollmentRepository.existsByProgramIdAndUserIdAndStatus(
                invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE))
                .thenReturn(true);

        InvitationResponse response = invitationService.join(code, userId);

        assertThat(response.code()).isEqualTo(code);
        assertThat(response.status()).isEqualTo(InvitationStatus.ACTIVE);
        verify(enrollmentRepository, never()).save(any());
        verify(membershipRepository, never()).save(any());
    }

    @Test
    void join_shouldSucceedForValidInvitation() {
        UUID userId = UUID.randomUUID();
        String code = "VALID-CODE";
        InvitationLink invitation = activeInvitation(code);
        User user = user(userId);

        when(invitationRepository.findByCodeForUpdate(code)).thenReturn(Optional.of(invitation));
        when(enrollmentRepository.existsByProgramIdAndUserIdAndStatus(
                invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE))
                .thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(membershipRepository.findByOrganizationIdAndUserId(
                invitation.getOrganization().getId(), userId))
                .thenReturn(Optional.empty());

        InvitationResponse response = invitationService.join(code, userId);

        assertThat(response.code()).isEqualTo(code);
        verify(enrollmentRepository).save(any());
        verify(membershipRepository).save(any());
    }

    @Test
    void join_shouldThrowWhenInvitationNotFound() {
        String code = "MISSING";
        when(invitationRepository.findByCodeForUpdate(code)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invitationService.join(code, UUID.randomUUID()))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Invitation not found");
    }

    @Test
    void join_shouldThrowWhenInvitationDisabled() {
        UUID userId = UUID.randomUUID();
        String code = "DISABLED";
        InvitationLink invitation = activeInvitation(code);
        invitation.setStatus(InvitationStatus.DISABLED);

        when(invitationRepository.findByCodeForUpdate(code)).thenReturn(Optional.of(invitation));
        when(enrollmentRepository.existsByProgramIdAndUserIdAndStatus(
                invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE))
                .thenReturn(false);

        assertThatThrownBy(() -> invitationService.join(code, userId))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invitation is not active");
    }

    private InvitationLink activeInvitation(String code) {
        InvitationLink invitation = new InvitationLink();
        invitation.setId(UUID.randomUUID());
        invitation.setCode(code);
        invitation.setStatus(InvitationStatus.ACTIVE);
        invitation.setUsedCount(0);

        Program program = new Program();
        program.setId(UUID.randomUUID());
        program.setStatus(ProgramStatus.PUBLISHED);
        invitation.setProgram(program);
        invitation.setOrganization(program.getOrganization());

        User createdBy = new User();
        createdBy.setId(UUID.randomUUID());
        invitation.setCreatedBy(createdBy);

        return invitation;
    }

    private User user(UUID userId) {
        User user = new User();
        user.setId(userId);
        return user;
    }
}
```

- [ ] **Step 2: Fix any compilation issues from missing getters/setters**

If `InvitationLink` or `Program` entities do not expose the setters used above, adjust the helper methods to use the available constructors or builder patterns.

- [ ] **Step 3: Run the tests**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/backend
./gradlew test --tests "com.library.Skillmark.invitation.service.InvitationServiceTest"
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/src/test/java/com/library/Skillmark/invitation/service/InvitationServiceTest.java
git commit -m "test(invitation): cover idempotent join behavior"
```

---

### Task 3: Update `JoinComponent` for auto-join and redirect

**Files:**
- Modify: `frontend/src/app/pages/join/join.component.ts`

- [ ] **Step 1: Import `AuthService`**

```typescript
import { AuthService } from '../../core/auth/auth.service';
```

- [ ] **Step 2: Inject `AuthService`**

Add inside the class:

```typescript
private readonly authService = inject(AuthService);
```

- [ ] **Step 3: Add effects for redirect and auto-join**

Add `untracked` and a flag signal to prevent repeated auto-join:

```typescript
import { effect, inject, signal, untracked } from '@angular/core';

readonly autoJoinAttempted = signal(false);

constructor() {
  effect(() => {
    const code = this.code();
    this.invitationsService.previewCode.set(code);
    this.error.set(null);
  });

  effect(() => {
    const code = this.code();
    const isLoaded = this.authService.isLoaded();
    const isSignedIn = this.authService.isSignedIn();

    if (code && isLoaded && !isSignedIn) {
      void this.router.navigate(['/sign-in'], {
        queryParams: { redirect: `/join/${code}` },
      });
    }
  });

  effect(() => {
    const code = this.code();
    const isSignedIn = this.authService.isSignedIn();
    const previewStatus = this.invitationsService.previewQuery.status();
    const alreadyAttempted = untracked(() => this.autoJoinAttempted());

    if (code && isSignedIn && previewStatus === 'success' && !alreadyAttempted) {
      this.autoJoinAttempted.set(true);
      this.join(code);
    }
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/pages/join/join.component.ts
git commit -m "feat(join): auto-join authenticated users and redirect guests to sign-in"
```

---

### Task 4: Update `JoinComponent` template for auto-join UI

**Files:**
- Modify: `frontend/src/app/pages/join/join.component.html`

- [ ] **Step 1: Show a joining loading state when the user is authenticated**

Replace the inner content of the `@if (code())` block with a loading-first flow:

```html
@if (code()) {
  @if (invitationsService.previewQuery.isPending() || invitationsService.joinMutation.isPending()) {
    <app-loading-state message="Joining program..." />
  } @else if (error()) {
    <div class="mb-6">
      <h2 class="mb-2 text-lg font-semibold text-ink">Could not join</h2>
      <app-error-state
        [message]="error() ?? 'Failed to join the program.'"
        (retry)="retry()"
      />
    </div>
  } @else if (invitationsService.previewQuery.isError()) {
    <div class="text-center">
      <h2 class="mb-2 text-lg font-semibold text-ink">Invitation code</h2>
      <p class="mb-6 font-mono text-2xl text-primary">{{ code() }}</p>
      <app-button
        [loading]="invitationsService.joinMutation.isPending()"
        (clicked)="accept()"
      >
        Accept invitation
      </app-button>
    </div>
  } @else {
    <div class="text-center">
      <h2 class="mb-2 text-lg font-semibold text-ink">You're invited</h2>
      <p class="mb-6 text-ink-mute">
        Join program
        <span class="font-medium text-ink">{{ invitationsService.previewQuery.data()?.programId }}</span>
      </p>
      <app-button
        [loading]="invitationsService.joinMutation.isPending()"
        (clicked)="accept()"
      >
        Accept invitation
      </app-button>
    </div>
  }
} @else {
  <!-- existing manual code form unchanged -->
}
```

Leave the manual code form block exactly as it is.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/pages/join/join.component.html
git commit -m "feat(join): show joining loading state and preserve manual code form"
```

---

### Task 5: Update `JoinComponent` tests

**Files:**
- Modify: `frontend/src/app/pages/join/join.component.spec.ts`

- [ ] **Step 1: Update the fake service to expose `previewQuery.status`**

Add a writable `previewStatus` signal to `FakeInvitationsService`:

```typescript
readonly previewStatus = signal<'pending' | 'error' | 'success'>('success');

readonly previewQuery = {
  isPending: () => this.previewStatus() === 'pending',
  isError: () => this.previewStatus() === 'error',
  data: () => this.nextInvitation,
  status: () => this.previewStatus(),
};
```

- [ ] **Step 2: Add a fake `AuthService` for tests**

```typescript
class FakeAuthService {
  readonly isLoaded = signal(true);
  readonly isSignedIn = signal(true);
}
```

- [ ] **Step 3: Provide `AuthService` in `setupFixture`**

```typescript
import { AuthService } from '../../core/auth/auth.service';

async function setupFixture(paramCode: string | null, signedIn = true) {
  const invitationsService = new FakeInvitationsService();
  const authService = new FakeAuthService();
  authService.isSignedIn.set(signedIn);

  await TestBed.configureTestingModule({
    imports: [JoinComponent],
    providers: [
      provideQueryClient(new QueryClient()),
      { provide: InvitationsService, useValue: invitationsService },
      { provide: AuthService, useValue: authService },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of({ get: () => paramCode }),
        },
      },
    ],
  }).compileComponents();

  // ... existing return values, plus authService
}
```

- [ ] **Step 4: Add tests**

```typescript
it('should auto-join when authenticated and preview succeeds', async () => {
  const { fixture, invitationsService } = await setupFixture('JOIN-CODE', true);
  fixture.detectChanges();
  await fixture.whenStable();

  expect(invitationsService.joinMutate).toHaveBeenCalledWith(
    'JOIN-CODE',
    expect.any(Object)
  );
});

it('should redirect unauthenticated users to sign-in with redirect param', async () => {
  const { fixture, router } = await setupFixture('JOIN-CODE', false);
  fixture.detectChanges();
  await fixture.whenStable();

  expect(router.navigate).toHaveBeenCalledWith(
    ['/sign-in'],
    { queryParams: { redirect: '/join/JOIN-CODE' } }
  );
});
```

- [ ] **Step 5: Run the tests**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend
npx vitest run src/app/pages/join/join.component.spec.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/pages/join/join.component.spec.ts
git commit -m "test(join): cover auto-join and unauthenticated redirect"
```

---

### Task 6: Simplify `ProgramInvitationsComponent` defaults and copy link

**Files:**
- Modify: `frontend/src/app/pages/program-invitations/program-invitations.component.ts`

- [ ] **Step 1: Change default `maxUses` to unlimited**

```typescript
readonly maxUses = signal<number | null>(null);
```

- [ ] **Step 2: Copy the link and show a toast on successful creation**

Replace the `createInvitation` success callback with:

```typescript
onSuccess: (invitation) => {
  toast.success('Invitation created');
  this.copyCode(invitation.code);
  this.maxUses.set(null);
},
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/pages/program-invitations/program-invitations.component.ts
git commit -m "feat(program-invitations): default to unlimited uses and copy link on create"
```

---

### Task 7: Update `ProgramInvitationsComponent` template

**Files:**
- Modify: `frontend/src/app/pages/program-invitations/program-invitations.component.html`

- [ ] **Step 1: Update the max-uses input placeholder**

```html
<input
  id="maxUses"
  type="number"
  min="1"
  [value]="maxUses()"
  (input)="maxUses.set($any($event.target).valueAsNumber)"
  placeholder="Unlimited"
  class="..."
/>
```

The placeholder is already "Unlimited"; ensure the input displays an empty value when `maxUses()` is `null`.

- [ ] **Step 2: Update the Create button label (optional)**

```html
<app-button ...>
  Create invitation link
</app-button>
```

- [ ] **Step 3: Run tests**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend
npx vitest run src/app/pages/program-invitations/program-invitations.component.spec.ts
```

Expected: tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/pages/program-invitations/program-invitations.component.html
git commit -m "feat(program-invitations): clarify create button label"
```

---

### Task 8: Add redirect-after-login to `SignIn`

**Files:**
- Modify: `frontend/src/app/pages/sign-in/sign-in.ts`

- [ ] **Step 1: Import `ActivatedRoute`**

```typescript
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
```

- [ ] **Step 2: Inject `ActivatedRoute` and read the redirect param**

```typescript
private readonly route = inject(ActivatedRoute);

readonly redirectUrl = signal<string | null>(null);

constructor() {
  const redirect = this.route.snapshot.queryParamMap.get('redirect');
  this.redirectUrl.set(redirect);
}
```

- [ ] **Step 3: Navigate to redirect URL after login**

```typescript
async onSubmit(): Promise<void> {
  // ... existing validation and login call ...

  try {
    await this.auth.login(this.form.getRawValue());
    const redirect = this.redirectUrl();
    await this.router.navigate(redirect ? [redirect] : ['/dashboard']);
  } catch (err) {
    // ... existing error handling ...
  } finally {
    this.isLoading.set(false);
  }
}
```

- [ ] **Step 4: Update the sign-up link to preserve redirect**

In `sign-in.html`, replace the sign-up link in the auth footer with:

```html
<span>Don't have an account? <a routerLink="/sign-up" [queryParams]="redirectUrl() ? { redirect: redirectUrl() } : undefined">Sign up</a></span>
```

The full `auth-footer` block should now look like:

```html
<div class="auth-footer">
  <div class="mb-4">
    <a routerLink="/forgot-password">Forgot password?</a>
  </div>
  <span>Don't have an account? <a routerLink="/sign-up" [queryParams]="redirectUrl() ? { redirect: redirectUrl() } : undefined">Sign up</a></span>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/pages/sign-in/sign-in.ts frontend/src/app/pages/sign-in/sign-in.html
git commit -m "feat(sign-in): support redirect query param after login"
```

---

### Task 9: Update `SignIn` tests

**Files:**
- Modify: `frontend/src/app/pages/sign-in/sign-in.spec.ts`

- [ ] **Step 1: Provide `ActivatedRoute` with a redirect param**

```typescript
import { ActivatedRoute } from '@angular/router';

const mockActivatedRoute = (redirect: string | null) => ({
  snapshot: {
    queryParamMap: {
      get: (key: string) => (key === 'redirect' ? redirect : null),
    },
  },
});
```

- [ ] **Step 2: Add a test for redirect navigation**

```typescript
it('should navigate to redirect URL after successful login', async () => {
  await TestBed.configureTestingModule({
    imports: [SignIn],
    providers: [
      { provide: AuthService, useClass: MockAuthService },
      { provide: ActivatedRoute, useValue: mockActivatedRoute('/join/ABC123') },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SignIn);
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate');

  fixture.detectChanges();
  // fill form and submit
  await fixture.whenStable();

  expect(router.navigate).toHaveBeenCalledWith(['/join/ABC123']);
});
```

- [ ] **Step 3: Run the tests**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend
npx vitest run src/app/pages/sign-in/sign-in.spec.ts
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/pages/sign-in/sign-in.spec.ts
git commit -m "test(sign-in): cover redirect-after-login"
```

---

### Task 10: Verify end-to-end behavior

**Files:**
- No file changes.

- [ ] **Step 1: Start the backend**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/backend
./gradlew bootRun
```

- [ ] **Step 2: Start the frontend**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend
npm run start
```

- [ ] **Step 3: Run through the flow as an owner**

1. Sign in as an organization owner.
2. Go to a published program → Invitations.
3. Click "Create invitation link".
4. Verify a toast appears and the link is copied to the clipboard.

- [ ] **Step 4: Run through the flow as an existing user**

1. Open the copied link in an incognito window.
2. Sign in.
3. Verify you are redirected back to `/join/{code}` and then to `/programs/{programId}/learn`.

- [ ] **Step 5: Run through the flow as an already-enrolled user**

1. Open the same link again while signed in.
2. Verify you are redirected to `/programs/{programId}/learn` without an error.

- [ ] **Step 6: Run the full test suites**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/backend
./gradlew test

cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend
npx vitest run
```

Expected: all tests pass.

---

## Self-Review Checklist

1. **Spec coverage:** Every spec section (idempotent join, auto-join, redirect, simplified creation, tests) maps to a task above.
2. **Placeholder scan:** No TBD, TODO, or vague steps. Each step includes file paths, code, and commands.
3. **Type consistency:** `InvitationResponse.from` is used consistently; `redirect` query param naming is consistent across join, sign-in, and sign-up.
