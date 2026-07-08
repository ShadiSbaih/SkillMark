# Skillmark Frontend Remake — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Skillmark Angular frontend into a cohesive, API-aligned SaaS dashboard while preserving the existing theme tokens in `src/styles.scss`.

**Architecture:** Standalone Angular 21 components, signals for local state, TanStack Query for server state, Clerk via `ngx-clerk` for auth, a shared component library, and a responsive dashboard layout shell. All backend calls go through `ApiClientService` and typed `core/models`.

**Tech Stack:** Angular 21, TypeScript 5.9, TanStack Query experimental, `ngx-clerk`, `ngx-sonner`, `lucide-angular`, SCSS, Vitest.

---

## File Structure

```
frontend/src/app/
├── core/
│   ├── api/
│   │   ├── api-client.service.ts
│   │   └── api-response.model.ts
│   ├── auth/
│   │   ├── auth.guard.ts
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── layout/
│   │   ├── dashboard-layout/
│   │   └── public-layout/
│   └── models/              # single source of truth
│       ├── attempt.model.ts
│       ├── audit-log.model.ts
│       ├── certificate.model.ts
│       ├── enrollment.model.ts
│       ├── invitation.model.ts
│       ├── media.model.ts
│       ├── membership.model.ts
│       ├── organization.model.ts
│       ├── program.model.ts
│       ├── quiz.model.ts
│       ├── resource.model.ts
│       ├── stats.model.ts
│       ├── storage.model.ts
│       └── user.model.ts
├── services/                # one per domain
├── shared/
│   ├── components/          # reusable UI
│   └── directives/          # optional future
└── pages/                   # one folder per route
```

---

## Task 1: Foundation — API Contract & Core Components

**Goal:** Ensure the API layer and shared components are solid before rebuilding pages.

---

### Task 1.1: Audit and align models with backend DTOs

**Files:**
- Modify: `frontend/src/app/core/models/user.model.ts`
- Modify: `frontend/src/app/core/models/stats.model.ts`
- Modify: `frontend/src/app/core/models/attempt.model.ts`
- Modify: `frontend/src/app/core/models/certificate.model.ts`
- Create: `frontend/src/app/core/models/audit-log.model.ts`
- Modify: `frontend/src/app/services/users.service.ts`
- Modify: `frontend/src/app/services/stats.service.ts`

- [ ] **Step 1: Verify user model fields**

Ensure `frontend/src/app/core/models/user.model.ts` matches the backend `UserResponse`:

```typescript
export interface UserResponse {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface SyncUserRequest {
  email: string;
  name?: string;
  avatarUrl?: string;
}
```

- [ ] **Step 2: Remove dead search endpoint**

Edit `frontend/src/app/services/users.service.ts` and remove the `searchByEmailMutation` if it calls `/users/search` which does not exist:

```typescript
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly meQuery = injectQuery(() => ({
    queryKey: ['users', 'me'] as const,
    queryFn: () => lastValueFrom(this.api.get<UserResponse>('users/me')),
  }));

  readonly syncMutation = injectMutation(() => ({
    mutationFn: (request: SyncUserRequest) =>
      lastValueFrom(this.api.post<UserResponse>('users/sync', request)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  }));

  readonly updateMeMutation = injectMutation(() => ({
    mutationFn: (request: Partial<SyncUserRequest>) =>
      lastValueFrom(this.api.patch<UserResponse>('users/me', request)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  }));
}
```

- [ ] **Step 3: Create audit log model**

Create `frontend/src/app/core/models/audit-log.model.ts`:

```typescript
export interface AuditLogResponse {
  id: string;
  organizationId: string | null;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
```

- [ ] **Step 4: Add storage/media models**

Create `frontend/src/app/core/models/storage.model.ts`:

```typescript
export interface R2UploadUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface R2UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  storageKey: string;
}
```

Create `frontend/src/app/core/models/media.model.ts`:

```typescript
export interface CloudinarySignatureRequest {
  folder?: string;
  publicId?: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}
```

- [ ] **Step 5: Verify stats models match backend**

Ensure `frontend/src/app/core/models/stats.model.ts`:

```typescript
export interface OrganizationStatsResponse {
  totalPrograms: number;
  totalMembers: number;
  totalEnrolledParticipants: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalCertificates: number;
  averageScore: number;
  passRate: number;
}

export interface ProgramStatsResponse {
  totalEnrollments: number;
  activeEnrollments: number;
  resourcesCount: number;
  quizzesCount: number;
  attemptsCount: number;
  passedParticipants: number;
  certificatesIssued: number;
  averageScore: number;
}

export interface QuizStatsResponse {
  attemptsCount: number;
  submittedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}
```

- [ ] **Step 6: Run build**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/core/models frontend/src/app/services/users.service.ts
git commit -m "feat(frontend): align models and remove dead user search endpoint"
```

---

### Task 1.2: Finalize shared component library

**Files:**
- Modify: `frontend/src/app/shared/components/button/button.component.ts`
- Create: `frontend/src/app/shared/components/badge/badge.component.ts`
- Modify: `frontend/src/app/shared/components/status-badge/status-badge.ts` and `.html`
- Modify: `frontend/src/app/shared/components/confirm-dialog/confirm-dialog.ts` and `.html`
- Create: `frontend/src/app/shared/components/table/table.component.ts`
- Create: `frontend/src/app/shared/components/pagination/pagination.component.ts`
- Create: `frontend/src/app/shared/components/form-field/form-field.component.ts`
- Create: `frontend/src/app/shared/components/breadcrumb/breadcrumb.component.ts`
- Create: `frontend/src/app/shared/components/avatar/avatar.component.ts`
- Remove: `frontend/src/app/shared/components/chart/`
- Remove: `frontend/src/app/shared/components/date-picker/`

- [ ] **Step 1: Implement ButtonComponent**

Replace `frontend/src/app/shared/components/button/button.component.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingStateComponent } from '../loading-state/loading-state.component';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <app-loading-state inline />
      } @else {
        <ng-content />
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: var(--radius-pill);
      font-weight: 500;
      line-height: 1;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .primary { background: var(--primary); color: white; }
    .primary:hover:not(:disabled) { background: var(--primary-deep); }
    .secondary { border-color: var(--primary); background: var(--canvas); color: var(--primary); }
    .secondary:hover:not(:disabled) { background: var(--primary-bg-subdued-hover); }
    .danger { background: var(--danger); color: white; }
    .danger:hover:not(:disabled) { background: #b91c1c; }
    .ghost { border-color: var(--hairline); background: var(--canvas); color: var(--ink-secondary); }
    .ghost:hover:not(:disabled) { background: var(--canvas-soft); }
    .sm { min-height: 32px; padding: 6px 12px; font-size: 13px; }
    .md { min-height: 40px; padding: 8px 16px; font-size: 15px; }
    .lg { min-height: 48px; padding: 12px 24px; font-size: 16px; }
    .full { width: 100%; }
  `],
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly onClick = output<Event>();

  classes() {
    return [
      this.variant(),
      this.size(),
      this.fullWidth() ? 'full' : '',
    ].join(' ');
  }
}
```

- [ ] **Step 2: Implement BadgeComponent**

Create `frontend/src/app/shared/components/badge/badge.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeColor = 'green' | 'amber' | 'red' | 'gray' | 'blue';
type BadgeStyle = 'subtle' | 'solid' | 'outline';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="classes()"><ng-content /></span>`,
  styles: [`
    span {
      display: inline-flex;
      align-items: center;
      width: max-content;
      border-radius: var(--radius-pill);
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .subtle-green { background: var(--success-bg); color: var(--success); }
    .subtle-amber { background: var(--warning-bg); color: var(--warning); }
    .subtle-red { background: var(--danger-bg); color: var(--danger); }
    .subtle-gray { background: var(--gray-bg); color: var(--ink-mute); }
    .subtle-blue { background: var(--blue-bg); color: var(--blue); }
    .solid-green { background: var(--success); color: white; }
    .solid-amber { background: var(--warning); color: white; }
    .solid-red { background: var(--danger); color: white; }
    .solid-gray { background: var(--ink-mute); color: white; }
    .solid-blue { background: var(--blue); color: white; }
    .outline-green { border: 1px solid var(--success); color: var(--success); }
    .outline-amber { border: 1px solid var(--warning); color: var(--warning); }
    .outline-red { border: 1px solid var(--danger); color: var(--danger); }
    .outline-gray { border: 1px solid var(--hairline-input); color: var(--ink-mute); }
    .outline-blue { border: 1px solid var(--blue); color: var(--blue); }
  `],
})
export class BadgeComponent {
  readonly color = input<BadgeColor>('gray');
  readonly style = input<BadgeStyle>('subtle');

  classes() {
    return `${this.style()}-${this.color()}`;
  }
}
```

- [ ] **Step 3: Implement StatusBadgeComponent**

Create `frontend/src/app/shared/components/status-badge/status-badge.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';

export type StatusBadgeEntity = 'program' | 'quiz' | 'attempt' | 'certificate' | 'enrollment' | 'invitation' | 'membership';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `<app-badge [color]="mapped().color" [style]="mapped().style">{{ mapped().label }}</app-badge>`,
})
export class StatusBadgeComponent {
  readonly entity = input.required<StatusBadgeEntity>();
  readonly status = input.required<string>();

  mapped() {
    return mapStatus(this.entity(), this.status());
  }
}

function mapStatus(entity: StatusBadgeEntity, status: string): { label: string; color: 'green' | 'amber' | 'red' | 'gray' | 'blue'; style: 'subtle' | 'solid' | 'outline' } {
  const s = status.toUpperCase();

  if (entity === 'program' || entity === 'quiz') {
    if (s === 'PUBLISHED') return { label: 'Published', color: 'blue', style: 'subtle' };
    if (s === 'DRAFT') return { label: 'Draft', color: 'gray', style: 'subtle' };
    if (s === 'ARCHIVED') return { label: 'Archived', color: 'amber', style: 'subtle' };
  }

  if (entity === 'attempt') {
    if (s === 'SUBMITTED') return { label: 'Submitted', color: 'blue', style: 'subtle' };
    if (s === 'IN_PROGRESS') return { label: 'In Progress', color: 'amber', style: 'subtle' };
    if (s === 'EXPIRED') return { label: 'Expired', color: 'red', style: 'subtle' };
  }

  if (entity === 'certificate') {
    if (s === 'ACTIVE') return { label: 'Active', color: 'green', style: 'subtle' };
    if (s === 'REVOKED') return { label: 'Revoked', color: 'red', style: 'subtle' };
  }

  if (entity === 'enrollment') {
    if (s === 'ACTIVE') return { label: 'Enrolled', color: 'green', style: 'subtle' };
  }

  if (entity === 'invitation') {
    if (s === 'ACTIVE') return { label: 'Active', color: 'green', style: 'subtle' };
    if (s === 'DISABLED') return { label: 'Disabled', color: 'gray', style: 'subtle' };
    if (s === 'EXPIRED') return { label: 'Expired', color: 'red', style: 'subtle' };
  }

  if (entity === 'membership') {
    if (s === 'OWNER') return { label: 'Owner', color: 'blue', style: 'subtle' };
    if (s === 'PARTICIPANT') return { label: 'Participant', color: 'gray', style: 'subtle' };
  }

  return { label: status, color: 'gray', style: 'subtle' };
}
```

- [ ] **Step 4: Implement ConfirmDialogComponent**

Create `frontend/src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <app-modal [open]="open()" [title]="title()" (close)="cancel.emit()">
      <p>{{ message() }}</p>
      <div actions class="button-row">
        <app-button variant="ghost" (onClick)="cancel.emit()">{{ cancelText() }}</app-button>
        <app-button [variant]="confirmVariant()" (onClick)="confirm.emit()">{{ confirmText() }}</app-button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  readonly open = input.required<boolean>();
  readonly title = input('Confirm');
  readonly message = input.required<string>();
  readonly confirmText = input('Confirm');
  readonly cancelText = input('Cancel');
  readonly confirmVariant = input<'primary' | 'danger'>('primary');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
```

- [ ] **Step 5: Implement TableComponent**

Create `frontend/src/app/shared/components/table/table.component.ts`:

```typescript
import { Component, input, output, TemplateRef, ContentChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingStateComponent } from '../loading-state/loading-state.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    <div class="table-wrap">
      @if (loading()) {
        <app-loading-state [message]="loadingMessage()" />
      } @else if (error()) {
        <app-error-state [message]="error()" (retry)="retry.emit()" />
      } @else if (items().length === 0) {
        <app-empty-state [message]="emptyMessage()" />
      } @else {
        <table>
          <thead>
            <tr>
              @for (header of headers(); track header) {
                <th>{{ header }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track trackByFn()(item, $index)) {
              <tr>
                @for (col of columns(); track col) {
                  <td>
                    <ng-container *ngTemplateOutlet="col; context: { $implicit: item }" />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class TableComponent<T> {
  readonly headers = input.required<string[]>();
  readonly items = input.required<T[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly loadingMessage = input('Loading...');
  readonly emptyMessage = input('No items found.');
  readonly retry = output<void>();
  readonly trackByFn = input<(item: T, index: number) => unknown>((item: T) => (item as { id?: unknown }).id ?? item);

  @ContentChildren(TemplateRef, { descendants: false }) columns!: QueryList<TemplateRef<{ $implicit: T }>>;
}
```

- [ ] **Step 6: Implement PaginationComponent**

Create `frontend/src/app/shared/components/pagination/pagination.component.ts`:

```typescript
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Pagination">
        <app-button variant="ghost" size="sm" [disabled]="!hasPrevious()" (onClick)="pageChange.emit(page() - 1)">Previous</app-button>
        @for (p of pages(); track p) {
          @if (p === page()) {
            <strong>{{ p + 1 }}</strong>
          } @else {
            <app-button variant="ghost" size="sm" (onClick)="pageChange.emit(p)">{{ p + 1 }}</app-button>
          }
        }
        <app-button variant="ghost" size="sm" [disabled]="!hasNext()" (onClick)="pageChange.emit(page() + 1)">Next</app-button>
      </nav>
    }
  `,
  styles: [`
    nav { display: flex; justify-content: flex-end; gap: 8px; padding-top: 16px; }
    strong {
      display: inline-grid; min-width: 34px; min-height: 34px;
      place-items: center; border: 1px solid var(--primary);
      border-radius: var(--radius-pill); background: var(--primary); color: white;
    }
  `],
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly size = input.required<number>();
  readonly totalElements = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly hasNext = input.required<boolean>();
  readonly hasPrevious = input.required<boolean>();
  readonly pageChange = output<number>();

  pages = computed(() => {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages(); i++) pages.push(i);
    return pages;
  });
}
```

- [ ] **Step 7: Implement FormFieldComponent**

Create `frontend/src/app/shared/components/form-field/form-field.component.ts`:

```typescript
import { Component, input, contentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label>
      <span>{{ label() }}</span>
      @if (hint()) {
        <small>{{ hint() }}</small>
      }
      <ng-content />
      @if (error()) {
        <span class="error">{{ error() }}</span>
      }
    </label>
  `,
  styles: [`
    label { display: grid; gap: 7px; }
    span { color: var(--ink); font-size: 14px; font-weight: 500; }
    small { color: var(--ink-mute); font-size: 12px; font-weight: 400; }
    .error { color: var(--danger); font-size: 12px; }
  `],
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
}
```

- [ ] **Step 8: Implement BreadcrumbComponent**

Create `frontend/src/app/shared/components/breadcrumb/breadcrumb.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string[];
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (item of items(); track item.label; let last = $last) {
        @if (!last && item.route) {
          <a [routerLink]="item.route">{{ item.label }}</a>
          <span>/</span>
        } @else {
          <span>{{ item.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    nav { display: flex; align-items: center; gap: 8px; color: var(--ink-mute); font-size: 11px; text-transform: uppercase; font-weight: 500; }
    a { color: var(--primary); }
    a:hover { text-decoration: underline; }
  `],
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
```

- [ ] **Step 9: Implement AvatarComponent**

Create `frontend/src/app/shared/components/avatar/avatar.component.ts`:

```typescript
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="alt()" [class]="classes()" />
    } @else {
      <span [class]="classes() + ' fallback'">{{ initials() }}</span>
    }
  `,
  styles: [`
    img, .fallback {
      display: inline-grid; place-items: center;
      border-radius: 50%; object-fit: cover;
      background: var(--primary-bg-subdued-hover); color: var(--primary-deep);
      font-weight: 600; text-transform: uppercase;
    }
    .sm { width: 24px; height: 24px; font-size: 10px; }
    .md { width: 32px; height: 32px; font-size: 12px; }
    .lg { width: 48px; height: 48px; font-size: 16px; }
    .xl { width: 64px; height: 64px; font-size: 20px; }
  `],
})
export class AvatarComponent {
  readonly src = input<string | null>();
  readonly alt = input('');
  readonly name = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  initials = computed(() => {
    const name = this.name() || this.alt() || '?';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  });

  classes() {
    return this.size();
  }
}
```

- [ ] **Step 10: Remove unused placeholder components**

Delete directories:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend/src/app/shared/components
rm -rf chart date-picker
```

- [ ] **Step 11: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Expected: build succeeds (components may not yet be used by pages, but must compile).

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/shared/components
git commit -m "feat(frontend): finalize shared component library"
```

---

### Task 1.3: Refactor layout shell

**Files:**
- Modify: `frontend/src/app/core/layout/dashboard-layout/dashboard-layout.component.ts` and `.html` and `.scss`
- Modify: `frontend/src/app/core/layout/public-layout/public-layout.component.ts` and `.html` and `.scss`

- [ ] **Step 1: Implement PublicLayoutComponent**

Create `frontend/src/app/core/layout/public-layout/public-layout.component.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {}
```

Create `frontend/src/app/core/layout/public-layout/public-layout.component.html`:

```html
<header class="public-header">
  <div class="public-header-inner">
    <a class="brand" routerLink="/">
      <span class="brand-mark">S</span>
      <span>Skillmark</span>
    </a>
    <nav>
      <a routerLink="/sign-in">Sign in</a>
      <a class="button button-primary" routerLink="/sign-up">Get started</a>
    </nav>
  </div>
</header>

<main class="public-main">
  <router-outlet />
</main>

<footer class="public-footer">
  <p>&copy; {{ currentYear }} Skillmark. All rights reserved.</p>
</footer>
```

Create `frontend/src/app/core/layout/public-layout/public-layout.component.scss`:

```scss
.public-header {
  border-bottom: 1px solid var(--hairline);
  background: var(--canvas);
}

.public-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 16px 0;
}

.public-header nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.public-main {
  min-height: calc(100vh - 140px);
}

.public-footer {
  border-top: 1px solid var(--hairline);
  padding: 24px 0;
  text-align: center;
  color: var(--ink-mute);
  font-size: 13px;
}
```

- [ ] **Step 2: Implement DashboardLayoutComponent**

Create `frontend/src/app/core/layout/dashboard-layout/dashboard-layout.component.ts`:

```typescript
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ClerkService, ClerkUserButtonComponent } from 'ngx-clerk';
import { OrganizationsService } from '../../../services/organizations.service';
import { CommonModule } from '@angular/common';

interface NavGroup {
  label: string;
  links: NavLink[];
}

interface NavLink {
  label: string;
  route: string[];
  icon?: string;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ClerkUserButtonComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  readonly clerk = inject(ClerkService);
  private readonly organizationsService = inject(OrganizationsService);

  readonly mobileOpen = signal(false);
  readonly userName = computed(() => {
    const user = this.clerk.user();
    return user?.firstName ?? user?.username ?? 'User';
  });

  readonly orgs = computed(() => this.organizationsService.organizationsQuery.data()?.items ?? []);
  readonly currentOrgId = computed(() => {
    const match = this.router.url.match(/\/organizations\/([^\/]+)/);
    return match?.[1] ?? null;
  });

  readonly navGroups = computed<NavGroup[]>(() => {
    const orgId = this.currentOrgId();
    const orgPrefix = orgId ? ['/organizations', orgId] : null;
    const programId = this.router.url.match(/\/programs\/([^\/]+)/)?.[1] ?? null;
    const quizId = this.router.url.match(/\/quizzes\/([^\/]+)/)?.[1] ?? null;

    const owner: NavLink[] = [
      { label: 'Dashboard', route: ['/dashboard'], exact: true },
      { label: 'My Organizations', route: ['/organizations'] },
    ];

    if (orgPrefix) {
      owner.push(
        { label: 'Overview', route: [...orgPrefix] },
        { label: 'Members', route: [...orgPrefix, 'members'] },
        { label: 'Stats', route: [...orgPrefix, 'stats'] },
        { label: 'Certificates', route: [...orgPrefix, 'certificates'] },
        { label: 'Audit Logs', route: [...orgPrefix, 'audit-logs'] },
        { label: 'Settings', route: [...orgPrefix, 'settings'] }
      );
    }

    if (programId) {
      const programPrefix = ['/programs', programId];
      owner.push(
        { label: 'Program Overview', route: [...programPrefix] },
        { label: 'Resources', route: [...programPrefix, 'resources'] },
        { label: 'Quizzes', route: [...programPrefix, 'quizzes'] },
        { label: 'Enrollments', route: [...programPrefix, 'enrollments'] },
        { label: 'Invitations', route: [...programPrefix, 'invitations'] },
        { label: 'Stats', route: [...programPrefix, 'stats'] },
        { label: 'Settings', route: [...programPrefix, 'settings'] }
      );
    }

    if (quizId) {
      const quizPrefix = ['/quizzes', quizId];
      owner.push(
        { label: 'Quiz Overview', route: [...quizPrefix] },
        { label: 'Builder', route: [...quizPrefix, 'builder'] },
        { label: 'Attempts', route: [...quizPrefix, 'attempts'] },
        { label: 'Stats', route: [...quizPrefix, 'stats'] },
        { label: 'Settings', route: [...quizPrefix, 'settings'] }
      );
    }

    const participant: NavLink[] = [
      { label: 'Dashboard', route: ['/dashboard'] },
      { label: 'My Programs', route: ['/my-enrollments'] },
      { label: 'My Attempts', route: ['/my-attempts'] },
      { label: 'My Certificates', route: ['/my-certificates'] },
    ];

    return [
      { label: 'Owner', links: owner },
      { label: 'Participant', links: participant },
    ];
  });

  constructor() {
    effect(() => {
      // Prefetch organizations for the switcher
      this.organizationsService.organizationsQuery.refetch();
    });
  }

  toggleMobile() {
    this.mobileOpen.update(o => !o);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  onOrgChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    if (id) this.router.navigate(['/organizations', id]);
  }
}
```

Create `frontend/src/app/core/layout/dashboard-layout/dashboard-layout.component.html`:

```html
<header class="dash-header">
  <div class="dash-header-inner">
    <div class="dash-header-left">
      <button class="mobile-toggle" (click)="toggleMobile()" aria-label="Toggle menu">☰</button>
      <a class="brand" routerLink="/dashboard">
        <span class="brand-mark">S</span>
        <span>Skillmark</span>
      </a>
      @if (orgs().length > 0) {
        <select class="org-switcher" [value]="currentOrgId() ?? ''" (change)="onOrgChange($event)">
          <option value="">Select organization</option>
          @for (org of orgs(); track org.id) {
            <option [value]="org.id">{{ org.name }}</option>
          }
        </select>
      }
    </div>
    <div class="dash-header-right">
      <clerk-user-button />
    </div>
  </div>
</header>

<div class="dash-shell">
  <aside class="dash-sidebar" [class.open]="mobileOpen()">
    <nav class="dash-nav">
      @for (group of navGroups(); track group.label) {
        <div class="nav-group">
          <span class="nav-group-label">{{ group.label }}</span>
          @for (link of group.links; track link.label) {
            <a
              [routerLink]="link.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
              (click)="closeMobile()"
            >{{ link.label }}</a>
          }
        </div>
      }
    </nav>
  </aside>

  @if (mobileOpen()) {
    <div class="sidebar-backdrop" (click)="closeMobile()"></div>
  }

  <main class="dash-main">
    <router-outlet />
  </main>
</div>
```

Create `frontend/src/app/core/layout/dashboard-layout/dashboard-layout.component.scss`:

```scss
.dash-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--hairline);
  background: var(--canvas);
}

.dash-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 12px 0;
}

.dash-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-toggle {
  display: inline-flex;
  width: 38px; height: 38px;
  align-items: center; justify-content: center;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--canvas);
  font-size: 18px;
}

.org-switcher {
  width: auto;
  min-height: 36px;
  padding: 6px 32px 6px 12px;
  font-size: 14px;
}

.dash-shell {
  display: flex;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  gap: 24px;
}

.dash-sidebar {
  position: fixed;
  top: 65px; left: 0; bottom: 0;
  width: 260px;
  border-right: 1px solid var(--hairline);
  background: var(--canvas);
  padding: 20px 0;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  z-index: 30;
}

.dash-sidebar.open {
  transform: translateX(0);
}

.dash-nav {
  display: grid;
  gap: 24px;
}

.nav-group {
  display: grid;
  gap: 4px;
  padding: 0 16px;
}

.nav-group-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--ink-mute);
  padding: 0 12px;
  margin-bottom: 4px;
}

.nav-group a {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--ink-secondary);
  font-size: 14px;
  font-weight: 500;
}

.nav-group a:hover {
  background: var(--canvas-soft);
  color: var(--ink);
}

.nav-group a.active {
  background: var(--primary-bg-subdued-hover);
  color: var(--primary-deep);
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20;
}

.dash-main {
  flex: 1;
  min-width: 0;
  padding: 24px 0 64px;
}

@media (min-width: 1024px) {
  .dash-shell {
    width: min(1180px, calc(100% - 40px));
  }

  .mobile-toggle,
  .sidebar-backdrop {
    display: none;
  }

  .dash-sidebar {
    position: static;
    transform: none;
    flex-shrink: 0;
  }
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Expected: build succeeds.

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/core/layout
git commit -m "feat(frontend): implement public and dashboard layout shells"
```

---

## Task 2: Public & Auth Pages

### Task 2.1: Landing page

**Files:**
- Modify: `frontend/src/app/pages/landing/landing.component.ts`
- Modify: `frontend/src/app/pages/landing/landing.component.html`
- Modify: `frontend/src/app/pages/landing/landing.component.scss`

- [ ] **Step 1: Replace landing component template**

Edit `frontend/src/app/pages/landing/landing.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly certificatesService = inject(CertificatesService);
  readonly code = signal('');
  readonly result = this.certificatesService.verifyQuery(() => this.code().trim() || null);
}
```

Create `frontend/src/app/pages/landing/landing.component.html`:

```html
<section class="hero">
  <div class="hero-content">
    <h1>Create programs, assess skills, issue certificates</h1>
    <p class="hero-subtitle">
      Skillmark helps universities, student clubs, and training organizations run certification programs and verify achievements.
    </p>
    <div class="hero-actions">
      <a class="button button-primary" routerLink="/sign-up">Get started for free</a>
      <a class="button button-secondary" routerLink="/sign-in">Sign in</a>
    </div>
  </div>
</section>

<section class="verify-section">
  <div class="verify-card">
    <h2>Verify a certificate</h2>
    <p>Enter a certificate verification code to check its authenticity.</p>
    <app-form-field label="Verification code" hint="e.g. VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0">
      <div class="verify-input-row">
        <input type="text" [ngModel]="code()" (ngModelChange)="code.set($event)" placeholder="Enter verification code" />
      </div>
    </app-form-field>

    @if (result.isPending()) {
      <app-loading-state message="Verifying..." />
    } @else if (result.error()) {
      <div class="verify-result error">
        <p>{{ result.error().message }}</p>
      </div>
    } @else if (result.data()) {
      <div class="verify-result success">
        <p><strong>{{ result.data().recipientName }}</strong> completed <strong>{{ result.data().workshopTitle }}</strong></p>
        <p>Score: {{ result.data().score }}% — Status: {{ result.data().status }}</p>
      </div>
    }
  </div>
</section>

<section class="features">
  <div class="feature">
    <h3>Program Management</h3>
    <p>Create programs, add resources, and invite participants with codes.</p>
  </div>
  <div class="feature">
    <h3>Quizzes & Grading</h3>
    <p>Build multiple-choice quizzes and let the system grade attempts automatically.</p>
  </div>
  <div class="feature">
    <h3>Digital Certificates</h3>
    <p>Issue verifiable certificates with unique codes and public verification.</p>
  </div>
</section>
```

Create `frontend/src/app/pages/landing/landing.component.scss`:

```scss
.hero {
  padding: 80px 0 64px;
  text-align: center;
}

.hero-content {
  width: min(720px, calc(100% - 40px));
  margin: 0 auto;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--ink-mute);
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.verify-section {
  padding: 40px 0;
}

.verify-card {
  width: min(560px, calc(100% - 40px));
  margin: 0 auto;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--canvas);
  padding: 28px;
}

.verify-input-row {
  display: flex;
  gap: 12px;
}

.verify-result {
  margin-top: 16px;
  padding: 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
}

.verify-result.success {
  background: var(--success-bg);
  color: var(--success);
}

.verify-result.error {
  background: var(--danger-bg);
  color: var(--danger);
}

.features {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3, 1fr);
  width: min(1180px, calc(100% - 40px));
  margin: 64px auto;
}

.feature {
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--canvas);
  padding: 24px;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/landing
git commit -m "feat(frontend): implement landing page"
```

---

### Task 2.2: Sign-in and sign-up pages

**Files:**
- Modify: `frontend/src/app/pages/sign-in/sign-in.ts`
- Modify: `frontend/src/app/pages/sign-in/sign-in.html`
- Modify: `frontend/src/app/pages/sign-up/sign-up.ts`
- Modify: `frontend/src/app/pages/sign-up/sign-up.html`

- [ ] **Step 1: Implement SignIn page**

Edit `frontend/src/app/pages/sign-in/sign-in.ts`:

```typescript
import { Component } from '@angular/core';
import { SignInComponent as ClerkSignIn } from 'ngx-clerk';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ClerkSignIn],
  templateUrl: './sign-in.html',
})
export class SignIn {}
```

Edit `frontend/src/app/pages/sign-in/sign-in.html`:

```html
<div class="auth-page">
  <div class="auth-card">
    <h1>Welcome back</h1>
    <p class="auth-subtitle">Sign in to your Skillmark account</p>
    <clerk-sign-in after-sign-in-url="/dashboard" sign-up-url="/sign-up" />
  </div>
</div>
```

- [ ] **Step 2: Implement SignUp page**

Edit `frontend/src/app/pages/sign-up/sign-up.ts`:

```typescript
import { Component } from '@angular/core';
import { SignUpComponent as ClerkSignUp } from 'ngx-clerk';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ClerkSignUp],
  templateUrl: './sign-up.html',
})
export class SignUp {}
```

Edit `frontend/src/app/pages/sign-up/sign-up.html`:

```html
<div class="auth-page">
  <div class="auth-card">
    <h1>Create your account</h1>
    <p class="auth-subtitle">Start creating programs and issuing certificates</p>
    <clerk-sign-up after-sign-up-url="/dashboard" sign-in-url="/sign-in" />
  </div>
</div>
```

- [ ] **Step 3: Add shared auth styles**

Append to `frontend/src/styles.scss` (allowed because this is a global utility addition, not a token change):

```scss
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
}

.auth-card {
  width: min(420px, 100%);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--canvas);
  padding: 32px;
  text-align: center;
}

.auth-subtitle {
  color: var(--ink-mute);
  margin-bottom: 24px;
}
```

- [ ] **Step 4: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/sign-in frontend/src/app/pages/sign-up frontend/src/styles.scss
git commit -m "feat(frontend): implement sign-in and sign-up pages"
```

---

### Task 2.3: Verify certificate page

**Files:**
- Modify: `frontend/src/app/pages/verify-certificate/verify-certificate.component.ts`
- Modify: `frontend/src/app/pages/verify-certificate/verify-certificate.component.html`
- Modify: `frontend/src/app/pages/verify-certificate/verify-certificate.component.scss`

- [ ] **Step 1: Implement component**

Edit `frontend/src/app/pages/verify-certificate/verify-certificate.component.ts`:

```typescript
import { Component, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [ButtonComponent, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent],
  templateUrl: './verify-certificate.component.html',
  styleUrl: './verify-certificate.component.scss',
})
export class VerifyCertificateComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly certificatesService = inject(CertificatesService);

  readonly codeFromRoute = input<string | undefined>(undefined, { alias: 'verificationCode' });
  readonly codeInput = signal('');

  readonly code = () => this.codeFromRoute() ?? this.codeInput().trim();
  readonly result = this.certificatesService.verifyQuery(() => this.code() || null);

  verify() {
    this.route.paramMap.subscribe(params => {
      const c = this.codeInput().trim();
      if (c) this.router.navigate(['/verify', c]);
    });
  }
}
```

Edit `frontend/src/app/pages/verify-certificate/verify-certificate.component.html`:

```html
<div class="verify-page">
  <div class="page">
    <app-card>
      <h1>Verify Certificate</h1>
      <p class="text-ink-mute">Enter a verification code to check certificate authenticity.</p>

      <div class="verify-form">
        <input type="text" [value]="codeInput()" (input)="codeInput.set($any($event.target).value)" placeholder="Verification code" />
        <app-button (onClick)="verify()">Verify</app-button>
      </div>
    </app-card>

    @if (result.isPending()) {
      <app-loading-state message="Verifying..." />
    } @else if (result.error()) {
      <app-error-state [message]="result.error().message" (retry)="result.refetch()" />
    } @else if (result.data()) {
      <app-card>
        <div class="verify-result-card">
          <app-badge color="green" style="subtle">Valid</app-badge>
          <h2>{{ result.data().recipientName }}</h2>
          <p>{{ result.data().workshopTitle }}</p>
          <p>{{ result.data().workspaceName }}</p>
          <div class="verify-meta">
            <span>Score: {{ result.data().score }}%</span>
            <span>Status: {{ result.data().status }}</span>
            <span>Issued: {{ result.data().issuedAt | date:'mediumDate' }}</span>
          </div>
        </div>
      </app-card>
    }
  </div>
</div>
```

Note: Add `BadgeComponent` to imports. The snippet uses `app-badge`.

Create `frontend/src/app/pages/verify-certificate/verify-certificate.component.scss`:

```scss
.verify-page {
  padding: 40px 0;
}

.verify-form {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.verify-result-card {
  display: grid;
  gap: 12px;
}

.verify-meta {
  display: flex;
  gap: 16px;
  color: var(--ink-mute);
  font-size: 14px;
}
```

- [ ] **Step 2: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/verify-certificate
git commit -m "feat(frontend): implement certificate verification page"
```

---

## Task 3: Dashboard & Organization Owner Pages

### Task 3.1: Dashboard page

**Files:**
- Modify: `frontend/src/app/pages/dashboard/dashboard.component.ts`
- Modify: `frontend/src/app/pages/dashboard/dashboard.component.html`
- Modify: `frontend/src/app/pages/dashboard/dashboard.component.scss`

- [ ] **Step 1: Refactor dashboard component**

Edit `frontend/src/app/pages/dashboard/dashboard.component.ts`:

```typescript
import { Component, computed, inject } from '@angular/core';
import { RouterLink, DatePipe, DecimalPipe } from '@angular/router';
import { OrganizationsService } from '../../services/organizations.service';
import { CertificatesService } from '../../services/certificates.service';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink, DatePipe, DecimalPipe,
    CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, ButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly organizationsService = inject(OrganizationsService);
  private readonly certificatesService = inject(CertificatesService);
  private readonly attemptsService = inject(AttemptsService);

  readonly orgsQuery = this.organizationsService.organizationsQuery;
  readonly certsQuery = this.certificatesService.myCertificatesQuery;
  readonly attemptsQuery = this.attemptsService.myAttemptsQuery;

  readonly organizations = computed(() => this.orgsQuery.data()?.items ?? []);
  readonly certificates = computed(() => this.certsQuery.data()?.items ?? []);
  readonly attempts = computed(() => this.attemptsQuery.data()?.items ?? []);

  readonly stats = computed(() => {
    const attempts = this.attempts();
    const submitted = attempts.filter(a => a.status === 'SUBMITTED');
    const passed = submitted.filter(a => a.passed);
    const passRate = submitted.length ? (passed.length / submitted.length) * 100 : 0;
    return {
      organizations: this.organizations().length,
      certificates: this.certificates().length,
      attempts: attempts.length,
      passRate,
    };
  });
}
```

Edit `frontend/src/app/pages/dashboard/dashboard.component.html`:

```html
@if (orgsQuery.error() || certsQuery.error() || attemptsQuery.error()) {
  <app-error-state
    [message]="(orgsQuery.error() ?? certsQuery.error() ?? attemptsQuery.error())?.message ?? 'Failed to load dashboard'"
    (retry)="orgsQuery.refetch(); certsQuery.refetch(); attemptsQuery.refetch()"
  />
}

@if (orgsQuery.isPending() && certsQuery.isPending() && attemptsQuery.isPending()) {
  <app-loading-state message="Loading dashboard..." />
}

@if (!orgsQuery.error() && !certsQuery.error() && !attemptsQuery.error()) {
  <app-page-header title="Dashboard" subtitle="Track your organizations, attempts, and certificates.">
    <a actions class="button button-primary" routerLink="/organizations/new">Create organization</a>
  </app-page-header>

  <div class="metric-grid">
    <app-card>
      <p class="metric-label">Organizations</p>
      <p class="metric-value">{{ stats().organizations }}</p>
    </app-card>
    <app-card>
      <p class="metric-label">Certificates</p>
      <p class="metric-value">{{ stats().certificates }}</p>
    </app-card>
    <app-card>
      <p class="metric-label">Attempts</p>
      <p class="metric-value">{{ stats().attempts }}</p>
    </app-card>
    <app-card>
      <p class="metric-label">Pass rate</p>
      <p class="metric-value">{{ stats().passRate | number:'1.0-1' }}%</p>
    </app-card>
  </div>

  <div class="dashboard-grid">
    <app-card>
      <div class="panel-header">
        <h2>Your organizations</h2>
        <a routerLink="/organizations" class="link">View all</a>
      </div>
      @if (organizations().length === 0) {
        <app-empty-state message="No organizations yet." />
      } @else {
        <div class="stack">
          @for (org of organizations().slice(0, 5); track org.id) {
            <a [routerLink]="['/organizations', org.id]" class="list-row-link">
              <div>
                <p class="font-medium">{{ org.name }}</p>
                @if (org.description) {
                  <p class="text-sm text-ink-mute">{{ org.description }}</p>
                }
              </div>
            </a>
          }
        </div>
      }
    </app-card>

    <app-card>
      <div class="panel-header">
        <h2>Recent certificates</h2>
        <a routerLink="/my-certificates" class="link">View all</a>
      </div>
      @if (certificates().length === 0) {
        <app-empty-state message="No certificates yet." />
      } @else {
        <div class="stack">
          @for (cert of certificates().slice(0, 5); track cert.id) {
            <a [routerLink]="['/certificates', cert.id]" class="list-row-link">
              <div>
                <p class="font-medium">{{ cert.certificateNumber }}</p>
                <p class="text-sm text-ink-mute">{{ cert.workshopTitleSnapshot }} / {{ cert.quizTitleSnapshot }}</p>
              </div>
              <app-status-badge entity="certificate" [status]="cert.status" />
            </a>
          }
        </div>
      }
    </app-card>
  </div>

  <app-card>
    <div class="panel-header">
      <h2>Recent attempts</h2>
      <a routerLink="/my-attempts" class="link">View all</a>
    </div>
    @if (attempts().length === 0) {
      <app-empty-state message="No attempts yet." />
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Score</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            @for (attempt of attempts().slice(0, 5); track attempt.attemptId) {
              <tr>
                <td>{{ attempt.quizTitleSnapshot ?? attempt.quizId }}</td>
                <td>
                  @if (attempt.status === 'SUBMITTED') {
                    {{ attempt.scorePercentage | number:'1.0-1' }}%
                  } @else { - }
                </td>
                <td><app-status-badge entity="attempt" [status]="attempt.status" /></td>
                <td>{{ attempt.submittedAt ? (attempt.submittedAt | date:'mediumDate') : '-' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </app-card>
}
```

Create `frontend/src/app/pages/dashboard/dashboard.component.scss`:

```scss
.metric-label {
  font-size: 13px;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-value {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
}

.dashboard-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 20px 0;
}

.list-row-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  padding: 12px;
  transition: all 0.2s ease;
}

.list-row-link:hover {
  background: var(--canvas-soft);
  border-color: var(--primary-bg-subdued-hover);
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/dashboard
git commit -m "feat(frontend): implement role-aware dashboard"
```

---

### Task 3.2: Organizations list & create

**Files:**
- Modify: `frontend/src/app/pages/organizations/organizations.component.ts`
- Modify: `frontend/src/app/pages/organizations/organizations.component.html`
- Modify: `frontend/src/app/pages/organizations/create-organization/create-organization.component.ts`
- Modify: `frontend/src/app/pages/organizations/create-organization/create-organization.component.html`

- [ ] **Step 1: Implement Organizations list page**

Edit `frontend/src/app/pages/organizations/organizations.component.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationsService } from '../../services/organizations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, ButtonComponent, PaginationComponent, StatusBadgeComponent,
  ],
  templateUrl: './organizations.component.html',
})
export class OrganizationsComponent {
  private readonly organizationsService = inject(OrganizationsService);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly query = this.organizationsService.getOrganizationsQuery(() => ({
    page: this.page(),
    size: this.size(),
  }));

  readonly data = computed(() => this.query.data());

  onPageChange(p: number) {
    this.page.set(p);
  }
}
```

Note: If `organizationsService.getOrganizationsQuery` does not exist, use `organizationsService.organizationsQuery` and adjust. Check the service.

Create `frontend/src/app/pages/organizations/organizations.component.html`:

```html
<app-page-header title="My Organizations" subtitle="Organizations you own or participate in.">
  <a actions class="button button-primary" routerLink="/organizations/new">Create organization</a>
</app-page-header>

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading organizations..." />
} @else if (data().items.length === 0) {
  <app-empty-state message="No organizations yet." />
} @else {
  <app-card>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          @for (org of data().items; track org.id) {
            <tr>
              <td><a class="link" [routerLink]="['/organizations', org.id]">{{ org.name }}</a></td>
              <td>{{ org.slug }}</td>
              <td><app-status-badge entity="membership" status="OWNER" /></td>
              <td>{{ org.createdAt | date:'mediumDate' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <app-pagination
      [page]="data().page"
      [size]="data().size"
      [totalElements]="data().totalElements"
      [totalPages]="data().totalPages"
      [hasNext]="data().hasNext"
      [hasPrevious]="data().hasPrevious"
      (pageChange)="onPageChange($event)"
    />
  </app-card>
}
```

- [ ] **Step 2: Implement Create organization page**

Edit `frontend/src/app/pages/organizations/create-organization/create-organization.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationsService } from '../../../services/organizations.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-organization',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent, FormFieldComponent, PageHeaderComponent],
  templateUrl: './create-organization.component.html',
})
export class CreateOrganizationComponent {
  private readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);

  readonly name = signal('');
  readonly slug = signal('');
  readonly description = signal('');
  readonly logoUrl = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly createMutation = this.organizationsService.createMutation;

  generateSlug() {
    this.slug.set(this.name().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50));
  }

  submit(event: Event) {
    event.preventDefault();
    this.submitting.set(true);
    this.createMutation.mutate(
      {
        name: this.name(),
        slug: this.slug(),
        description: this.description() || undefined,
        logoUrl: this.logoUrl() ?? undefined,
      },
      {
        onSuccess: (data) => {
          this.router.navigate(['/organizations', data.id]);
        },
        onSettled: () => this.submitting.set(false),
      }
    );
  }
}
```

Note: Check exact field names in `CreateOrganizationRequest` model.

Create `frontend/src/app/pages/organizations/create-organization/create-organization.component.html`:

```html
<app-page-header title="Create organization" subtitle="Set up a new organization for your programs." />

<form (submit)="submit($event)">
  <app-card>
    <div class="form-grid">
      <app-form-field label="Name">
        <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event); generateSlug()" name="name" required />
      </app-form-field>
      <app-form-field label="Slug" hint="URL-friendly identifier.">
        <input type="text" [ngModel]="slug()" (ngModelChange)="slug.set($event)" name="slug" required />
      </app-form-field>
      <app-form-field label="Description">
        <input type="text" [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" />
      </app-form-field>
    </div>

    <div class="button-row mt-4">
      <a class="button button-secondary" routerLink="/organizations">Cancel</a>
      <app-button type="submit" [loading]="submitting()">Create organization</app-button>
    </div>
  </app-card>
</form>
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/organizations
git commit -m "feat(frontend): implement organizations list and create"
```

---

### Task 3.3: Organization overview, settings, members

**Files:**
- Modify: `frontend/src/app/pages/organization-overview/organization-overview.ts` and `.html`
- Modify: `frontend/src/app/pages/organization-settings/organization-settings.ts` and `.html`
- Modify: `frontend/src/app/pages/organization-members/organization-members.component.ts` and `.html`

- [ ] **Step 1: Implement Organization overview**

Edit `frontend/src/app/pages/organization-overview/organization-overview.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramsService } from '../../services/programs.service';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-organization-overview',
  standalone: true,
  imports: [
    RouterLink, DatePipe, CardComponent, EmptyStateComponent, ErrorStateComponent,
    LoadingStateComponent, PageHeaderComponent, ButtonComponent, BreadcrumbComponent,
  ],
  templateUrl: './organization-overview.html',
})
export class OrganizationOverview {
  private readonly organizationsService = inject(OrganizationsService);
  private readonly programsService = inject(ProgramsService);
  private readonly statsService = inject(StatsService);

  readonly orgId = input.required<string>({ alias: 'orgId' });

  readonly orgQuery = this.organizationsService.getOrganizationQuery(() => this.orgId());
  readonly programsQuery = this.programsService.getProgramsQuery(() => this.orgId());
  readonly statsQuery = this.statsService.getOrganizationStatsQuery(() => this.orgId());

  readonly org = computed(() => this.orgQuery.data());
  readonly programs = computed(() => this.programsQuery.data()?.items ?? []);
  readonly stats = computed(() => this.statsQuery.data());
}
```

Note: Verify actual service method names (e.g., `getOrganizationQuery`, `getProgramsQuery`). Adjust if different.

Create `frontend/src/app/pages/organization-overview/organization-overview.html`:

```html
@if (orgQuery.error()) {
  <app-error-state [message]="orgQuery.error().message" (retry)="orgQuery.refetch()" />
} @else if (orgQuery.isPending()) {
  <app-loading-state message="Loading organization..." />
} @else {
  <app-breadcrumb [items]="[
    { label: 'Organizations', route: ['/organizations'] },
    { label: org().name }
  ]" />

  <app-page-header [title]="org().name" [subtitle]="org().description || 'Organization overview'">
    <div actions class="button-row">
      <a class="button button-secondary" [routerLink]="['/organizations', orgId(), 'settings']">Settings</a>
      <a class="button button-primary" [routerLink]="['/organizations', orgId(), 'programs', 'new']">New program</a>
    </div>
  </app-page-header>

  @if (stats()) {
    <div class="metric-grid compact">
      <app-card><p class="metric-label">Members</p><p class="metric-value">{{ stats().totalMembers }}</p></app-card>
      <app-card><p class="metric-label">Programs</p><p class="metric-value">{{ stats().totalPrograms }}</p></app-card>
      <app-card><p class="metric-label">Certificates</p><p class="metric-value">{{ stats().totalCertificates }}</p></app-card>
    </div>
  }

  <div class="two-column mt-6">
    <app-card>
      <div class="panel-header">
        <h2>Programs</h2>
        <a class="link" [routerLink]="['/organizations', orgId(), 'programs']">View all</a>
      </div>
      @if (programs().length === 0) {
        <app-empty-state message="No programs yet." />
      } @else {
        <div class="stack">
          @for (p of programs().slice(0, 5); track p.id) {
            <a [routerLink]="['/programs', p.id]" class="list-row-link">
              <div>
                <p class="font-medium">{{ p.title }}</p>
                <p class="text-sm text-ink-mute">{{ p.status }}</p>
              </div>
            </a>
          }
        </div>
      }
    </app-card>

    <app-card>
      <h2>Details</h2>
      <dl class="detail-grid single">
        <div><dt>Slug</dt><dd>{{ org().slug }}</dd></div>
        <div><dt>Created</dt><dd>{{ org().createdAt | date:'medium' }}</dd></div>
        <div><dt>Created by</dt><dd>{{ org().createdBy }}</dd></div>
      </dl>
    </app-card>
  </div>
}
```

- [ ] **Step 2: Implement Organization settings**

Edit `frontend/src/app/pages/organization-settings/organization-settings.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationsService } from '../../services/organizations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [
    FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent,
    ConfirmDialogComponent, LoadingStateComponent, ErrorStateComponent, BreadcrumbComponent,
  ],
  templateUrl: './organization-settings.html',
})
export class OrganizationSettings {
  private readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);

  readonly orgId = input.required<string>({ alias: 'orgId' });
  readonly query = this.organizationsService.getOrganizationQuery(() => this.orgId());

  readonly name = signal('');
  readonly description = signal('');
  readonly logoUrl = signal<string | null>(null);
  readonly showDelete = signal(false);

  constructor() {
    effect(() => {
      const org = this.query.data();
      if (org) {
        this.name.set(org.name);
        this.description.set(org.description ?? '');
        this.logoUrl.set(org.logoUrl ?? null);
      }
    });
  }

  submit(event: Event) {
    event.preventDefault();
    this.organizationsService.updateMutation.mutate({
      id: this.orgId(),
      request: {
        name: this.name(),
        description: this.description() || undefined,
        logoUrl: this.logoUrl() ?? undefined,
      },
    });
  }

  delete() {
    this.organizationsService.deleteMutation.mutate(this.orgId(), {
      onSuccess: () => this.router.navigate(['/organizations']),
    });
  }
}
```

Note: Verify exact mutation signatures in `OrganizationsService`.

Create `frontend/src/app/pages/organization-settings/organization-settings.html`:

```html
@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading organization..." />
} @else {
  <app-breadcrumb [items]="[
    { label: 'Organizations', route: ['/organizations'] },
    { label: query.data().name, route: ['/organizations', orgId()] },
    { label: 'Settings' }
  ]" />

  <app-page-header title="Organization settings" subtitle="Update details or delete this organization." />

  <form (submit)="submit($event)">
    <app-card>
      <div class="form-grid">
        <app-form-field label="Name">
          <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required />
        </app-form-field>
        <app-form-field label="Description">
          <input type="text" [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" />
        </app-form-field>
      </div>
      <div class="button-row mt-4">
        <app-button type="submit">Save changes</app-button>
      </div>
    </app-card>
  </form>

  <app-card>
    <h2>Danger zone</h2>
    <p class="text-ink-mute">Deleting an organization cannot be undone.</p>
    <div class="button-row mt-4">
      <app-button variant="danger" (onClick)="showDelete.set(true)">Delete organization</app-button>
    </div>
  </app-card>

  <app-confirm-dialog
    [open]="showDelete()"
    title="Delete organization?"
    [message]="'This will permanently delete ' + query.data().name + ' and all its data.'"
    confirmText="Delete"
    confirmVariant="danger"
    (confirm)="delete(); showDelete.set(false)"
    (cancel)="showDelete.set(false)"
  />
}
```

- [ ] **Step 3: Implement Organization members**

Edit `frontend/src/app/pages/organization-members/organization-members.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MembershipsService } from '../../services/memberships.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-organization-members',
  standalone: true,
  imports: [
    FormsModule, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, ButtonComponent, FormFieldComponent, PaginationComponent,
    AvatarComponent, StatusBadgeComponent,
  ],
  templateUrl: './organization-members.component.html',
})
export class OrganizationMembersComponent {
  private readonly membershipsService = inject(MembershipsService);

  readonly orgId = input.required<string>({ alias: 'orgId' });
  readonly page = signal(0);
  readonly size = signal(10);
  readonly email = signal('');

  readonly query = this.membershipsService.getMembersQuery(() => ({
    organizationId: this.orgId(),
    page: this.page(),
    size: this.size(),
  }));

  readonly addMutation = this.membershipsService.addMutation;

  add(event: Event) {
    event.preventDefault();
    if (!this.email()) return;
    this.addMutation.mutate({
      organizationId: this.orgId(),
      request: { email: this.email(), role: 'PARTICIPANT' },
    }, {
      onSuccess: () => this.email.set(''),
    });
  }

  remove(userId: string) {
    this.membershipsService.removeMutation.mutate({
      organizationId: this.orgId(),
      userId,
    });
  }
}
```

Create `frontend/src/app/pages/organization-members/organization-members.component.html`:

```html
<app-page-header title="Members" subtitle="Manage organization members." />

<form (submit)="add($event)" class="inline-form">
  <app-form-field label="Email address" hint="Invite a new member by email.">
    <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" required />
  </app-form-field>
  <app-button type="submit" [loading]="addMutation.isPending()">Add member</app-button>
</form>

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading members..." />
} @else if (query.data().items.length === 0) {
  <app-empty-state message="No members yet." />
} @else {
  <app-card>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (member of query.data().items; track member.userId) {
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <app-avatar [src]="member.avatarUrl" [name]="member.name ?? member.email" size="sm" />
                  <div>
                    <p class="font-medium">{{ member.name ?? member.email }}</p>
                    <p class="text-sm text-ink-mute">{{ member.email }}</p>
                  </div>
                </div>
              </td>
              <td><app-status-badge entity="membership" [status]="member.role" /></td>
              <td><app-status-badge entity="membership" [status]="member.status" /></td>
              <td>
                <app-button variant="ghost" size="sm" (onClick)="remove(member.userId)">Remove</app-button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <app-pagination
      [page]="query.data().page"
      [size]="query.data().size"
      [totalElements]="query.data().totalElements"
      [totalPages]="query.data().totalPages"
      [hasNext]="query.data().hasNext"
      [hasPrevious]="query.data().hasPrevious"
      (pageChange)="page.set($event)"
    />
  </app-card>
}
```

- [ ] **Step 4: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/organization-overview frontend/src/app/pages/organization-settings frontend/src/app/pages/organization-members
git commit -m "feat(frontend): implement organization overview, settings, and members"
```

---

### Task 3.4: Organization stats, audit logs, certificates

**Files:**
- Modify: `frontend/src/app/pages/organization-stats/organization-stats.component.ts` and `.html`
- Modify: `frontend/src/app/pages/audit-logs/audit-logs.component.ts` and `.html`
- Modify: `frontend/src/app/pages/organization-certificates/organization-certificates.component.ts` and `.html`

- [ ] **Step 1: Implement Organization stats**

Edit `frontend/src/app/pages/organization-stats/organization-stats.component.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-organization-stats',
  standalone: true,
  imports: [DecimalPipe, CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, BreadcrumbComponent],
  templateUrl: './organization-stats.component.html',
})
export class OrganizationStatsComponent {
  private readonly statsService = inject(StatsService);
  readonly orgId = input.required<string>({ alias: 'orgId' });
  readonly query = this.statsService.getOrganizationStatsQuery(() => this.orgId());
  readonly stats = computed(() => this.query.data());
}
```

Create `frontend/src/app/pages/organization-stats/organization-stats.component.html`:

```html
<app-breadcrumb [items]="[
  { label: 'Organizations', route: ['/organizations'] },
  { label: 'Organization', route: ['/organizations', orgId()] },
  { label: 'Stats' }
]" />

<app-page-header title="Organization stats" subtitle="High-level activity and performance." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading stats..." />
} @else {
  <div class="metric-grid">
    <app-card><p class="metric-label">Programs</p><p class="metric-value">{{ stats().totalPrograms }}</p></app-card>
    <app-card><p class="metric-label">Members</p><p class="metric-value">{{ stats().totalMembers }}</p></app-card>
    <app-card><p class="metric-label">Enrolled</p><p class="metric-value">{{ stats().totalEnrolledParticipants }}</p></app-card>
    <app-card><p class="metric-label">Quizzes</p><p class="metric-value">{{ stats().totalQuizzes }}</p></app-card>
    <app-card><p class="metric-label">Attempts</p><p class="metric-value">{{ stats().totalAttempts }}</p></app-card>
    <app-card><p class="metric-label">Certificates</p><p class="metric-value">{{ stats().totalCertificates }}</p></app-card>
    <app-card><p class="metric-label">Avg score</p><p class="metric-value">{{ stats().averageScore | number:'1.0-1' }}%</p></app-card>
    <app-card><p class="metric-label">Pass rate</p><p class="metric-value">{{ stats().passRate | number:'1.0-1' }}%</p></app-card>
  </div>
}
```

- [ ] **Step 2: Implement Audit logs**

Edit `frontend/src/app/pages/audit-logs/audit-logs.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { OrganizationsService } from '../../services/organizations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [DatePipe, JsonPipe, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent {
  private readonly organizationsService = inject(OrganizationsService);
  readonly orgId = input.required<string>({ alias: 'orgId' });
  readonly page = signal(0);
  readonly size = signal(20);

  readonly query = this.organizationsService.getAuditLogsQuery(() => ({
    organizationId: this.orgId(),
    page: this.page(),
    size: this.size(),
  }));
}
```

Create `frontend/src/app/pages/audit-logs/audit-logs.component.html`:

```html
<app-page-header title="Audit logs" subtitle="Organization activity trail." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading audit logs..." />
} @else if (query.data().items.length === 0) {
  <app-empty-state message="No activity yet." />
} @else {
  <app-card>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Entity</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          @for (log of query.data().items; track log.id) {
            <tr>
              <td>{{ log.createdAt | date:'medium' }}</td>
              <td>{{ log.action }}</td>
              <td>{{ log.entityType }} {{ log.entityId }}</td>
              <td>{{ log.userId ?? 'System' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <app-pagination
      [page]="query.data().page"
      [size]="query.data().size"
      [totalElements]="query.data().totalElements"
      [totalPages]="query.data().totalPages"
      [hasNext]="query.data().hasNext"
      [hasPrevious]="query.data().hasPrevious"
      (pageChange)="page.set($event)"
    />
  </app-card>
}
```

- [ ] **Step 3: Implement Organization certificates**

Edit `frontend/src/app/pages/organization-certificates/organization-certificates.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, DatePipe } from '@angular/common';
import { OrganizationsService } from '../../services/organizations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-organization-certificates',
  standalone: true,
  imports: [
    RouterLink, DatePipe, CardComponent, EmptyStateComponent, ErrorStateComponent,
    LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent, ButtonComponent,
  ],
  templateUrl: './organization-certificates.component.html',
})
export class OrganizationCertificates {
  private readonly organizationsService = inject(OrganizationsService);
  readonly orgId = input.required<string>({ alias: 'orgId' });
  readonly page = signal(0);
  readonly size = signal(10);

  readonly query = this.organizationsService.getOrganizationCertificatesQuery(() => ({
    organizationId: this.orgId(),
    page: this.page(),
    size: this.size(),
  }));
}
```

Create `frontend/src/app/pages/organization-certificates/organization-certificates.component.html`:

```html
<app-page-header title="Certificates" subtitle="Certificates issued by this organization." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading certificates..." />
} @else if (query.data().items.length === 0) {
  <app-empty-state message="No certificates issued yet." />
} @else {
  <app-card>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Recipient</th>
            <th>Program</th>
            <th>Score</th>
            <th>Status</th>
            <th>Issued</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (cert of query.data().items; track cert.id) {
            <tr>
              <td><a class="link" [routerLink]="['/certificates', cert.id]">{{ cert.certificateNumber }}</a></td>
              <td>{{ cert.recipientName }}</td>
              <td>{{ cert.workshopTitleSnapshot }}</td>
              <td>{{ cert.score }}%</td>
              <td><app-status-badge entity="certificate" [status]="cert.status" /></td>
              <td>{{ cert.issuedAt | date:'mediumDate' }}</td>
              <td><a class="link" [href]="cert.pdfUrl" target="_blank">PDF</a></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <app-pagination
      [page]="query.data().page"
      [size]="query.data().size"
      [totalElements]="query.data().totalElements"
      [totalPages]="query.data().totalPages"
      [hasNext]="query.data().hasNext"
      [hasPrevious]="query.data().hasPrevious"
      (pageChange)="page.set($event)"
    />
  </app-card>
}
```

- [ ] **Step 4: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/organization-stats frontend/src/app/pages/audit-logs frontend/src/app/pages/organization-certificates
git commit -m "feat(frontend): implement organization stats, audit logs, and certificates"
```

---

## Task 4: Program Pages

### Task 4.1: Program overview & learn

**Files:**
- Modify: `frontend/src/app/pages/program-overview/program-overview.ts` and `.html`
- Modify: `frontend/src/app/pages/program-learn/program-learn.ts` and `.html`

- [ ] **Step 1: Implement Program overview**

Edit `frontend/src/app/pages/program-overview/program-overview.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, DatePipe } from '@angular/common';
import { ProgramsService } from '../../services/programs.service';
import { ResourcesService } from '../../services/resources.service';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { EnrollmentsService } from '../../services/enrollments.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-program-overview',
  standalone: true,
  imports: [
    RouterLink, DatePipe, CardComponent, EmptyStateComponent, LoadingStateComponent,
    ErrorStateComponent, PageHeaderComponent, ButtonComponent, StatusBadgeComponent, BreadcrumbComponent,
  ],
  templateUrl: './program-overview.html',
})
export class ProgramOverview {
  private readonly programsService = inject(ProgramsService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly quizzesService = inject(QuizzesService);
  private readonly statsService = inject(StatsService);
  private readonly enrollmentsService = inject(EnrollmentsService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly resourcesQuery = this.resourcesService.getResourcesQuery(() => this.programId());
  readonly quizzesQuery = this.quizzesService.getProgramQuizzesQuery(() => this.programId());
  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());
  readonly enrollmentQuery = this.enrollmentsService.getMyEnrollmentQuery(() => this.programId());

  readonly program = computed(() => this.programQuery.data());
  readonly resources = computed(() => this.resourcesQuery.data()?.items ?? []);
  readonly quizzes = computed(() => this.quizzesQuery.data()?.items ?? []);
  readonly stats = computed(() => this.statsQuery.data());

  enroll() {
    this.enrollmentsService.enrollMutation.mutate({ programId: this.programId() });
  }
}
```

Note: Verify exact service method names.

Create `frontend/src/app/pages/program-overview/program-overview.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-breadcrumb [items]="[
    { label: 'Organizations', route: ['/organizations'] },
    { label: program().organizationName ?? 'Organization', route: ['/organizations', program().organizationId] },
    { label: program().title }
  ]" />

  <app-page-header [title]="program().title" [subtitle]="program().description || 'Program overview'">
    <div actions class="button-row">
      <a class="button button-secondary" [routerLink]="['/programs', programId(), 'settings']">Settings</a>
      <a class="button button-primary" [routerLink]="['/programs', programId(), 'learn']">Start learning</a>
    </div>
  </app-page-header>

  <div class="metric-grid compact">
    <app-card><p class="metric-label">Status</p><p class="metric-value"><app-status-badge entity="program" [status]="program().status" /></p></app-card>
    <app-card><p class="metric-label">Resources</p><p class="metric-value">{{ stats()?.resourcesCount ?? resources().length }}</p></app-card>
    <app-card><p class="metric-label">Quizzes</p><p class="metric-value">{{ stats()?.quizzesCount ?? quizzes().length }}</p></app-card>
  </div>

  <div class="two-column mt-6">
    <app-card>
      <div class="panel-header"><h2>Resources</h2><a class="link" [routerLink]="['/programs', programId(), 'resources']">View all</a></div>
      @if (resources().length === 0) { <app-empty-state message="No resources yet." /> }
      @else {
        <div class="stack">
          @for (r of resources().slice(0, 5); track r.id) {
            <div class="list-row-link">
              <div>
                <p class="font-medium">{{ r.title }}</p>
                <p class="text-sm text-ink-mute">{{ r.type }}</p>
              </div>
            </div>
          }
        </div>
      }
    </app-card>

    <app-card>
      <div class="panel-header"><h2>Quizzes</h2><a class="link" [routerLink]="['/programs', programId(), 'quizzes']">View all</a></div>
      @if (quizzes().length === 0) { <app-empty-state message="No quizzes yet." /> }
      @else {
        <div class="stack">
          @for (q of quizzes().slice(0, 5); track q.id) {
            <a [routerLink]="['/quizzes', q.id]" class="list-row-link">
              <div>
                <p class="font-medium">{{ q.title }}</p>
                <p class="text-sm text-ink-mute">Passing: {{ q.passingScore }}%</p>
              </div>
              <app-status-badge entity="quiz" [status]="q.status" />
            </a>
          }
        </div>
      }
    </app-card>
  </div>
}
```

- [ ] **Step 2: Implement Program learn page**

Edit `frontend/src/app/pages/program-learn/program-learn.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { ResourcesService } from '../../services/resources.service';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-program-learn',
  standalone: true,
  imports: [RouterLink, CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, ButtonComponent, StatusBadgeComponent],
  templateUrl: './program-learn.html',
})
export class ProgramLearn {
  private readonly programsService = inject(ProgramsService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly quizzesService = inject(QuizzesService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly resourcesQuery = this.resourcesService.getResourcesQuery(() => this.programId());
  readonly quizzesQuery = this.quizzesService.getProgramQuizzesQuery(() => this.programId());

  readonly resources = computed(() => this.resourcesQuery.data()?.items?.filter(r => r.isVisible) ?? []);
  readonly quizzes = computed(() => this.quizzesQuery.data()?.items?.filter(q => q.status === 'PUBLISHED') ?? []);
}
```

Create `frontend/src/app/pages/program-learn/program-learn.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-page-header [title]="'Learn: ' + programQuery.data().title" subtitle="Resources and quizzes for this program." />

  <app-card>
    <h2>Resources</h2>
    @if (resources().length === 0) { <app-empty-state message="No resources available." /> }
    @else {
      <div class="stack">
        @for (r of resources(); track r.id) {
          <div class="list-row-link">
            <div>
              <p class="font-medium">{{ r.title }}</p>
              <p class="text-sm text-ink-mute">{{ r.description }}</p>
            </div>
            <a class="button button-secondary" [href]="r.url" target="_blank">Open</a>
          </div>
        }
      </div>
    }
  </app-card>

  <app-card>
    <h2>Quizzes</h2>
    @if (quizzes().length === 0) { <app-empty-state message="No quizzes available." /> }
    @else {
      <div class="stack">
        @for (q of quizzes(); track q.id) {
          <div class="list-row-link">
            <div>
              <p class="font-medium">{{ q.title }}</p>
              <p class="text-sm text-ink-mute">Duration: {{ q.durationMinutes }} min | Passing: {{ q.passingScore }}%</p>
            </div>
            <a class="button button-primary" [routerLink]="['/quizzes', q.id, 'attempt']">Start</a>
          </div>
        }
      </div>
    }
  </app-card>
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/program-overview frontend/src/app/pages/program-learn
git commit -m "feat(frontend): implement program overview and learn pages"
```

---

### Task 4.2: Program resources

**Files:**
- Modify: `frontend/src/app/pages/program-resources/program-resources.component.ts` and `.html`
- Modify: `frontend/src/app/services/resources.service.ts`

- [ ] **Step 1: Add upload helpers to ResourcesService**

Edit `frontend/src/app/services/resources.service.ts` to add presigned URL support. Verify current contents first, then append:

```typescript
import { Injectable, inject } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { ResourceResponse, CreateResourceRequest, UpdateResourceVisibilityRequest } from '../core/models/resource.model';
import { R2UploadUrlRequest, R2UploadUrlResponse } from '../core/models/storage.model';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  getResourcesQuery(programId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['resources', programId()] as const,
      queryFn: () => lastValueFrom(this.api.getPage<ResourceResponse>(`programs/${programId()}/resources`)),
      enabled: !!programId(),
    }));
  }

  getResourceQuery(resourceId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['resource', resourceId()] as const,
      queryFn: () => lastValueFrom(this.api.get<ResourceResponse>(`resources/${resourceId()}`)),
      enabled: !!resourceId(),
    }));
  }

  readonly createMutation = injectMutation(() => ({
    mutationFn: ({ programId, request }: { programId: string; request: CreateResourceRequest }) =>
      lastValueFrom(this.api.post<ResourceResponse>(`programs/${programId}/resources`, request)),
    onSuccess: (_, vars) => {
      this.queryClient.invalidateQueries({ queryKey: ['resources', vars.programId] });
    },
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: ({ resourceId, request }: { resourceId: string; request: CreateResourceRequest }) =>
      lastValueFrom(this.api.put<ResourceResponse>(`resources/${resourceId}`, request)),
    onSuccess: (_, vars) => {
      this.queryClient.invalidateQueries({ queryKey: ['resource', vars.resourceId] });
    },
  }));

  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (resourceId: string) => lastValueFrom(this.api.delete<void>(`resources/${resourceId}`)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  }));

  readonly visibilityMutation = injectMutation(() => ({
    mutationFn: ({ resourceId, request }: { resourceId: string; request: UpdateResourceVisibilityRequest }) =>
      lastValueFrom(this.api.patch<ResourceResponse>(`resources/${resourceId}/visibility`, request)),
    onSuccess: (_, vars) => {
      this.queryClient.invalidateQueries({ queryKey: ['resources'] });
      this.queryClient.invalidateQueries({ queryKey: ['resource', vars.resourceId] });
    },
  }));

  readonly uploadUrlMutation = injectMutation(() => ({
    mutationFn: (request: R2UploadUrlRequest) =>
      lastValueFrom(this.api.post<R2UploadUrlResponse>('storage/upload-urls', request)),
  }));
}
```

- [ ] **Step 2: Implement Program resources page**

Edit `frontend/src/app/pages/program-resources/program-resources.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramsService } from '../../services/programs.service';
import { ResourcesService } from '../../services/resources.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-program-resources',
  standalone: true,
  imports: [
    FormsModule, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, ButtonComponent, FormFieldComponent, StatusBadgeComponent,
  ],
  templateUrl: './program-resources.component.html',
})
export class ProgramResourcesComponent {
  private readonly programsService = inject(ProgramsService);
  private readonly resourcesService = inject(ResourcesService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly resourcesQuery = this.resourcesService.getResourcesQuery(() => this.programId());

  readonly adding = signal(false);
  readonly title = signal('');
  readonly description = signal('');
  readonly type = signal<'LINK' | 'FILE' | 'VIDEO' | 'DOCUMENT'>('LINK');
  readonly url = signal('');

  readonly resources = computed(() => this.resourcesQuery.data()?.items ?? []);

  create(event: Event) {
    event.preventDefault();
    this.resourcesService.createMutation.mutate({
      programId: this.programId(),
      request: {
        title: this.title(),
        description: this.description() || undefined,
        type: this.type(),
        url: this.url(),
        isVisible: true,
      },
    }, {
      onSuccess: () => {
        this.title.set('');
        this.description.set('');
        this.url.set('');
        this.adding.set(false);
      },
    });
  }

  toggleVisibility(resource: ResourceResponse) {
    this.resourcesService.visibilityMutation.mutate({
      resourceId: resource.id,
      request: { isVisible: !resource.isVisible },
    });
  }

  delete(resourceId: string) {
    this.resourcesService.deleteMutation.mutate(resourceId);
  }
}
```

Create `frontend/src/app/pages/program-resources/program-resources.component.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-page-header [title]="'Resources: ' + programQuery.data().title" subtitle="Manage learning resources.">
    <app-button actions (onClick)="adding.set(true)">Add resource</app-button>
  </app-page-header>

  @if (adding()) {
    <app-card>
      <form (submit)="create($event)">
        <div class="form-grid">
          <app-form-field label="Title"><input type="text" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required /></app-form-field>
          <app-form-field label="Type">
            <select [ngModel]="type()" (ngModelChange)="type.set($event)" name="type">
              <option value="LINK">Link</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="FILE">File</option>
            </select>
          </app-form-field>
          <app-form-field label="URL"><input type="url" [ngModel]="url()" (ngModelChange)="url.set($event)" name="url" required /></app-form-field>
        </div>
        <div class="button-row mt-4">
          <app-button variant="ghost" (onClick)="adding.set(false)">Cancel</app-button>
          <app-button type="submit" [loading]="resourcesService.createMutation.isPending()">Save resource</app-button>
        </div>
      </form>
    </app-card>
  }

  @if (resourcesQuery.error()) {
    <app-error-state [message]="resourcesQuery.error().message" (retry)="resourcesQuery.refetch()" />
  } @else if (resourcesQuery.isPending()) {
    <app-loading-state message="Loading resources..." />
  } @else if (resources().length === 0) {
    <app-empty-state message="No resources yet." />
  } @else {
    <app-card>
      <div class="stack">
        @for (r of resources(); track r.id) {
          <div class="list-row-link">
            <div>
              <p class="font-medium">{{ r.title }}</p>
              <p class="text-sm text-ink-mute">{{ r.type }} · {{ r.isVisible ? 'Visible' : 'Hidden' }}</p>
            </div>
            <div class="button-row">
              <app-button variant="ghost" size="sm" (onClick)="toggleVisibility(r)">{{ r.isVisible ? 'Hide' : 'Show' }}</app-button>
              <a class="button button-secondary" [href]="r.url" target="_blank" size="sm">Open</a>
              <app-button variant="danger" size="sm" (onClick)="delete(r.id)">Delete</app-button>
            </div>
          </div>
        }
      </div>
    </app-card>
  }
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/program-resources frontend/src/app/services/resources.service.ts
git commit -m "feat(frontend): implement program resources management"
```

---

### Task 4.3: Program quizzes list & create

**Files:**
- Modify: `frontend/src/app/pages/program-quizzes/program-quizzes.ts` and `.html`
- Modify: `frontend/src/app/pages/create-quiz/create-quiz.ts` and `.html`

- [ ] **Step 1: Implement Program quizzes list**

Edit `frontend/src/app/pages/program-quizzes/program-quizzes.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-program-quizzes',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, LoadingStateComponent,
    ErrorStateComponent, PageHeaderComponent, ButtonComponent, StatusBadgeComponent,
  ],
  templateUrl: './program-quizzes.html',
})
export class ProgramQuizzes {
  private readonly programsService = inject(ProgramsService);
  private readonly quizzesService = inject(QuizzesService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly quizzesQuery = this.quizzesService.getProgramQuizzesQuery(() => this.programId());
  readonly quizzes = computed(() => this.quizzesQuery.data()?.items ?? []);
}
```

Create `frontend/src/app/pages/program-quizzes/program-quizzes.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-page-header [title]="'Quizzes: ' + programQuery.data().title" subtitle="Quizzes in this program.">
    <a actions class="button button-primary" [routerLink]="['/programs', programId(), 'quizzes', 'new']">Create quiz</a>
  </app-page-header>

  @if (quizzesQuery.error()) {
    <app-error-state [message]="quizzesQuery.error().message" (retry)="quizzesQuery.refetch()" />
  } @else if (quizzesQuery.isPending()) {
    <app-loading-state message="Loading quizzes..." />
  } @else if (quizzes().length === 0) {
    <app-empty-state message="No quizzes yet." />
  } @else {
    <app-card>
      <div class="stack">
        @for (q of quizzes(); track q.id) {
          <a [routerLink]="['/quizzes', q.id]" class="list-row-link">
            <div>
              <p class="font-medium">{{ q.title }}</p>
              <p class="text-sm text-ink-mute">{{ q.questionCount ?? 0 }} questions · {{ q.durationMinutes }} min</p>
            </div>
            <app-status-badge entity="quiz" [status]="q.status" />
          </a>
        }
      </div>
    </app-card>
  }
}
```

- [ ] **Step 2: Implement Create quiz page**

Edit `frontend/src/app/pages/create-quiz/create-quiz.ts`:

```typescript
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent],
  templateUrl: './create-quiz.html',
})
export class CreateQuiz {
  private readonly router = inject(Router);
  private readonly quizzesService = inject(QuizzesService);

  readonly programId = input.required<string>({ alias: 'programId' });

  readonly title = signal('');
  readonly description = signal('');
  readonly instructions = signal('');
  readonly passingScore = signal(70);
  readonly durationMinutes = signal(15);
  readonly maxAttempts = signal(3);
  readonly autoIssueCertificate = signal(true);
  readonly submitting = signal(false);

  readonly createMutation = this.quizzesService.createMutation;

  submit(event: Event) {
    event.preventDefault();
    this.submitting.set(true);
    this.createMutation.mutate({
      programId: this.programId(),
      request: {
        title: this.title(),
        description: this.description() || undefined,
        instructions: this.instructions() || undefined,
        passingScore: this.passingScore(),
        durationMinutes: this.durationMinutes(),
        maxAttempts: this.maxAttempts(),
        autoIssueCertificate: this.autoIssueCertificate(),
      },
    }, {
      onSuccess: (data) => {
        this.router.navigate(['/quizzes', data.id, 'builder']);
      },
      onSettled: () => this.submitting.set(false),
    });
  }
}
```

Create `frontend/src/app/pages/create-quiz/create-quiz.html`:

```html
<app-page-header title="Create quiz" subtitle="Add a new quiz to this program." />

<form (submit)="submit($event)">
  <app-card>
    <div class="form-grid">
      <app-form-field label="Title"><input type="text" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required /></app-form-field>
      <app-form-field label="Passing score %"><input type="number" [ngModel]="passingScore()" (ngModelChange)="passingScore.set(+$event)" name="passingScore" min="1" max="100" required /></app-form-field>
      <app-form-field label="Duration (minutes)"><input type="number" [ngModel]="durationMinutes()" (ngModelChange)="durationMinutes.set(+$event)" name="durationMinutes" min="1" required /></app-form-field>
      <app-form-field label="Max attempts"><input type="number" [ngModel]="maxAttempts()" (ngModelChange)="maxAttempts.set(+$event)" name="maxAttempts" min="1" required /></app-form-field>
      <app-form-field label="Description" hint="Optional">
        <textarea [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" rows="3"></textarea>
      </app-form-field>
      <app-form-field label="Instructions" hint="Optional">
        <textarea [ngModel]="instructions()" (ngModelChange)="instructions.set($event)" name="instructions" rows="3"></textarea>
      </app-form-field>
    </div>

    <label class="flex items-center gap-2 mt-4">
      <input type="checkbox" [ngModel]="autoIssueCertificate()" (ngModelChange)="autoIssueCertificate.set($event)" name="autoIssueCertificate" />
      <span>Auto-issue certificate on passing attempt</span>
    </label>

    <div class="button-row mt-6">
      <a class="button button-secondary" [routerLink]="['/programs', programId(), 'quizzes']">Cancel</a>
      <app-button type="submit" [loading]="submitting()">Create quiz</app-button>
    </div>
  </app-card>
</form>
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/program-quizzes frontend/src/app/pages/create-quiz
git commit -m "feat(frontend): implement program quizzes list and create quiz"
```

---

### Task 4.4: Program enrollments & invitations

**Files:**
- Modify: `frontend/src/app/pages/program-enrollments/program-enrollments.component.ts` and `.html`
- Modify: `frontend/src/app/pages/program-invitations/program-invitations.component.ts` and `.html`

- [ ] **Step 1: Implement Program enrollments**

Edit `frontend/src/app/pages/program-enrollments/program-enrollments.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { ProgramsService } from '../../services/programs.service';
import { EnrollmentsService } from '../../services/enrollments.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-program-enrollments',
  standalone: true,
  imports: [
    CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, ButtonComponent, PaginationComponent, AvatarComponent,
  ],
  templateUrl: './program-enrollments.component.html',
})
export class ProgramEnrollmentsComponent {
  private readonly programsService = inject(ProgramsService);
  private readonly enrollmentsService = inject(EnrollmentsService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly page = signal(0);
  readonly size = signal(10);

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly query = this.enrollmentsService.getProgramEnrollmentsQuery(() => ({
    programId: this.programId(),
    page: this.page(),
    size: this.size(),
  }));

  remove(userId: string) {
    this.enrollmentsService.removeMutation.mutate({ programId: this.programId(), userId });
  }
}
```

Create `frontend/src/app/pages/program-enrollments/program-enrollments.component.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-page-header [title]="'Enrollments: ' + programQuery.data().title" subtitle="Participants enrolled in this program." />

  @if (query.error()) {
    <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
  } @else if (query.isPending()) {
    <app-loading-state message="Loading enrollments..." />
  } @else if (query.data().items.length === 0) {
    <app-empty-state message="No enrollments yet." />
  } @else {
    <app-card>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Participant</th><th>Enrolled</th><th></th></tr></thead>
          <tbody>
            @for (e of query.data().items; track e.userId) {
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <app-avatar [name]="e.userName ?? e.userEmail" size="sm" />
                    <div>
                      <p class="font-medium">{{ e.userName ?? e.userEmail }}</p>
                      <p class="text-sm text-ink-mute">{{ e.userEmail }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ e.enrolledAt | date:'mediumDate' }}</td>
                <td><app-button variant="ghost" size="sm" (onClick)="remove(e.userId)">Remove</app-button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination
        [page]="query.data().page"
        [size]="query.data().size"
        [totalElements]="query.data().totalElements"
        [totalPages]="query.data().totalPages"
        [hasNext]="query.data().hasNext"
        [hasPrevious]="query.data().hasPrevious"
        (pageChange)="page.set($event)"
      />
    </app-card>
  }
}
```

- [ ] **Step 2: Implement Program invitations**

Edit `frontend/src/app/pages/program-invitations/program-invitations.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramsService } from '../../services/programs.service';
import { InvitationsService } from '../../services/invitations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-program-invitations',
  standalone: true,
  imports: [
    FormsModule, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, ButtonComponent, FormFieldComponent, PaginationComponent, StatusBadgeComponent,
  ],
  templateUrl: './program-invitations.component.html',
})
export class ProgramInvitationsComponent {
  private readonly programsService = inject(ProgramsService);
  private readonly invitationsService = inject(InvitationsService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly page = signal(0);
  readonly size = signal(10);
  readonly maxUses = signal<number | undefined>(undefined);

  readonly query = this.invitationsService.getInvitationsQuery(() => ({
    programId: this.programId(),
    page: this.page(),
    size: this.size(),
  }));

  create(event: Event) {
    event.preventDefault();
    this.invitationsService.createMutation.mutate({
      programId: this.programId(),
      request: { role: 'PARTICIPANT', maxUses: this.maxUses() },
    }, {
      onSuccess: () => this.maxUses.set(undefined),
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
  }

  disable(id: string) {
    this.invitationsService.updateStatusMutation.mutate({
      invitationId: id,
      request: { status: 'DISABLED' },
    });
  }
}
```

Create `frontend/src/app/pages/program-invitations/program-invitations.component.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-page-header [title]="'Invitations: ' + programQuery.data().title" subtitle="Invite participants with codes." />

  <form (submit)="create($event)" class="inline-form">
    <app-form-field label="Max uses" hint="Leave empty for unlimited">
      <input type="number" [ngModel]="maxUses()" (ngModelChange)="maxUses.set($event ? +$event : undefined)" name="maxUses" min="1" />
    </app-form-field>
    <app-button type="submit" [loading]="invitationsService.createMutation.isPending()">Create invitation</app-button>
  </form>

  @if (query.error()) {
    <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
  } @else if (query.isPending()) {
    <app-loading-state message="Loading invitations..." />
  } @else if (query.data().items.length === 0) {
    <app-empty-state message="No invitations yet." />
  } @else {
    <app-card>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Uses</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>
            @for (i of query.data().items; track i.id) {
              <tr>
                <td><code>{{ i.code }}</code></td>
                <td>{{ i.usesCount }} / {{ i.maxUses ?? '∞' }}</td>
                <td><app-status-badge entity="invitation" [status]="i.status" /></td>
                <td>{{ i.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="button-row">
                    <app-button variant="ghost" size="sm" (onClick)="copyCode(i.code)">Copy</app-button>
                    @if (i.status === 'ACTIVE') {
                      <app-button variant="ghost" size="sm" (onClick)="disable(i.id)">Disable</app-button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination
        [page]="query.data().page"
        [size]="query.data().size"
        [totalElements]="query.data().totalElements"
        [totalPages]="query.data().totalPages"
        [hasNext]="query.data().hasNext"
        [hasPrevious]="query.data().hasPrevious"
        (pageChange)="page.set($event)"
      />
    </app-card>
  }
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/program-enrollments frontend/src/app/pages/program-invitations
git commit -m "feat(frontend): implement program enrollments and invitations"
```

---

### Task 4.5: Program stats & settings

**Files:**
- Modify: `frontend/src/app/pages/program-stats/program-stats.ts` and `.html`
- Modify: `frontend/src/app/pages/program-settings/program-settings.ts` and `.html`
- Modify: `frontend/src/app/pages/programs/programs.component.ts` and `.html`

- [ ] **Step 1: Implement Program stats**

Edit `frontend/src/app/pages/program-stats/program-stats.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProgramsService } from '../../services/programs.service';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-program-stats',
  standalone: true,
  imports: [DecimalPipe, CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, BreadcrumbComponent],
  templateUrl: './program-stats.html',
})
export class ProgramStats {
  private readonly programsService = inject(ProgramsService);
  private readonly statsService = inject(StatsService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());
  readonly stats = computed(() => this.statsQuery.data());
}
```

Create `frontend/src/app/pages/program-stats/program-stats.html`:

```html
@if (programQuery.error()) {
  <app-error-state [message]="programQuery.error().message" (retry)="programQuery.refetch()" />
} @else if (programQuery.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-breadcrumb [items]="[
    { label: 'Organizations', route: ['/organizations'] },
    { label: programQuery.data().organizationName ?? 'Organization', route: ['/organizations', programQuery.data().organizationId] },
    { label: programQuery.data().title, route: ['/programs', programId()] },
    { label: 'Stats' }
  ]" />

  <app-page-header title="Program stats" subtitle="Enrollment and quiz performance." />

  @if (statsQuery.error()) {
    <app-error-state [message]="statsQuery.error().message" (retry)="statsQuery.refetch()" />
  } @else if (statsQuery.isPending()) {
    <app-loading-state message="Loading stats..." />
  } @else {
    <div class="metric-grid">
      <app-card><p class="metric-label">Enrollments</p><p class="metric-value">{{ stats().totalEnrollments }}</p></app-card>
      <app-card><p class="metric-label">Active</p><p class="metric-value">{{ stats().activeEnrollments }}</p></app-card>
      <app-card><p class="metric-label">Resources</p><p class="metric-value">{{ stats().resourcesCount }}</p></app-card>
      <app-card><p class="metric-label">Quizzes</p><p class="metric-value">{{ stats().quizzesCount }}</p></app-card>
      <app-card><p class="metric-label">Attempts</p><p class="metric-value">{{ stats().attemptsCount }}</p></app-card>
      <app-card><p class="metric-label">Passed</p><p class="metric-value">{{ stats().passedParticipants }}</p></app-card>
      <app-card><p class="metric-label">Certificates</p><p class="metric-value">{{ stats().certificatesIssued }}</p></app-card>
      <app-card><p class="metric-label">Avg score</p><p class="metric-value">{{ stats().averageScore | number:'1.0-1' }}%</p></app-card>
    </div>
  }
}
```

- [ ] **Step 2: Implement Program settings**

Edit `frontend/src/app/pages/program-settings/program-settings.ts`:

```typescript
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-program-settings',
  standalone: true,
  imports: [
    FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent,
    LoadingStateComponent, ErrorStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './program-settings.html',
})
export class ProgramSettings {
  private readonly router = inject(Router);
  private readonly programsService = inject(ProgramsService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly query = this.programsService.getProgramQuery(() => this.programId());

  readonly title = signal('');
  readonly description = signal('');
  readonly status = signal<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  readonly startsAt = signal<string>('');
  readonly endsAt = signal<string>('');
  readonly showDelete = signal(false);

  constructor() {
    effect(() => {
      const p = this.query.data();
      if (p) {
        this.title.set(p.title);
        this.description.set(p.description ?? '');
        this.status.set(p.status);
        this.startsAt.set(p.startsAt ? p.startsAt.slice(0, 16) : '');
        this.endsAt.set(p.endsAt ? p.endsAt.slice(0, 16] : '');
      }
    });
  }

  submit(event: Event) {
    event.preventDefault();
    this.programsService.updateMutation.mutate({
      id: this.programId(),
      request: {
        title: this.title(),
        description: this.description() || undefined,
        status: this.status(),
        startsAt: this.startsAt() || undefined,
        endsAt: this.endsAt() || undefined,
      },
    });
  }

  delete() {
    this.programsService.deleteMutation.mutate(this.programId(), {
      onSuccess: () => this.router.navigate(['/organizations']),
    });
  }
}
```

Create `frontend/src/app/pages/program-settings/program-settings.html`:

```html
@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading program..." />
} @else {
  <app-page-header title="Program settings" subtitle="Update or delete this program." />

  <form (submit)="submit($event)">
    <app-card>
      <div class="form-grid">
        <app-form-field label="Title"><input type="text" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required /></app-form-field>
        <app-form-field label="Status">
          <select [ngModel]="status()" (ngModelChange)="status.set($event)" name="status">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </app-form-field>
        <app-form-field label="Starts at"><input type="datetime-local" [ngModel]="startsAt()" (ngModelChange)="startsAt.set($event)" name="startsAt" /></app-form-field>
        <app-form-field label="Ends at"><input type="datetime-local" [ngModel]="endsAt()" (ngModelChange)="endsAt.set($event)" name="endsAt" /></app-form-field>
        <app-form-field label="Description"><textarea [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" rows="3"></textarea></app-form-field>
      </div>
      <div class="button-row mt-6">
        <app-button type="submit">Save changes</app-button>
      </div>
    </app-card>
  </form>

  <app-card>
    <h2>Danger zone</h2>
    <p class="text-ink-mute">Deleting a program cannot be undone.</p>
    <div class="button-row mt-4">
      <app-button variant="danger" (onClick)="showDelete.set(true)">Delete program</app-button>
    </div>
  </app-card>

  <app-confirm-dialog
    [open]="showDelete()"
    title="Delete program?"
    [message]="'This will permanently delete ' + query.data().title + '.'"
    confirmText="Delete"
    confirmVariant="danger"
    (confirm)="delete(); showDelete.set(false)"
    (cancel)="showDelete.set(false)"
  />
}
```

- [ ] **Step 3: Implement Programs list page**

Edit `frontend/src/app/pages/programs/programs.component.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramsService } from '../../services/programs.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, PaginationComponent, StatusBadgeComponent,
  ],
  templateUrl: './programs.component.html',
})
export class ProgramsComponent {
  private readonly organizationsService = inject(OrganizationsService);
  private readonly programsService = inject(ProgramsService);

  readonly selectedOrg = signal<string>('');
  readonly page = signal(0);
  readonly size = signal(10);

  readonly orgs = computed(() => this.organizationsService.organizationsQuery.data()?.items ?? []);

  readonly query = this.programsService.getProgramsQuery(() => this.selectedOrg() || null, () => ({
    page: this.page(),
    size: this.size(),
  }));
}
```

Create `frontend/src/app/pages/programs/programs.component.html`:

```html
<app-page-header title="Programs" subtitle="All programs across your organizations." />

<div class="filter-bar">
  <app-form-field label="Organization">
    <select [ngModel]="selectedOrg()" (ngModelChange)="selectedOrg.set($event); page.set(0)">
      <option value="">All organizations</option>
      @for (org of orgs(); track org.id) {
        <option [value]="org.id">{{ org.name }}</option>
      }
    </select>
  </app-form-field>
</div>

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading programs..." />
} @else if (query.data().items.length === 0) {
  <app-empty-state message="No programs found." />
} @else {
  <app-card>
    <div class="stack">
      @for (p of query.data().items; track p.id) {
        <a [routerLink]="['/programs', p.id]" class="list-row-link">
          <div>
            <p class="font-medium">{{ p.title }}</p>
            <p class="text-sm text-ink-mute">{{ p.organizationName }}</p>
          </div>
          <app-status-badge entity="program" [status]="p.status" />
        </a>
      }
    </div>
    <app-pagination
      [page]="query.data().page"
      [size]="query.data().size"
      [totalElements]="query.data().totalElements"
      [totalPages]="query.data().totalPages"
      [hasNext]="query.data().hasNext"
      [hasPrevious]="query.data().hasPrevious"
      (pageChange)="page.set($event)"
    />
  </app-card>
}
```

- [ ] **Step 4: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/program-stats frontend/src/app/pages/program-settings frontend/src/app/pages/programs
git commit -m "feat(frontend): implement program stats, settings, and programs list"
```

---

## Task 5: Quiz Pages

### Task 5.1: Quiz overview & settings

**Files:**
- Modify: `frontend/src/app/pages/quiz-overview/quiz-overview.ts` and `.html`
- Modify: `frontend/src/app/pages/quiz-settings/quiz-settings.ts` and `.html`

- [ ] **Step 1: Implement Quiz overview**

Edit `frontend/src/app/pages/quiz-overview/quiz-overview.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { QuestionsService } from '../../services/questions.service';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-quiz-overview',
  standalone: true,
  imports: [
    RouterLink, CardComponent, LoadingStateComponent, ErrorStateComponent,
    PageHeaderComponent, ButtonComponent, StatusBadgeComponent, BreadcrumbComponent,
  ],
  templateUrl: './quiz-overview.html',
})
export class QuizOverview {
  private readonly quizzesService = inject(QuizzesService);
  private readonly questionsService = inject(QuestionsService);
  private readonly statsService = inject(StatsService);

  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly questionsQuery = this.questionsService.getQuestionsQuery(() => this.quizId());
  readonly statsQuery = this.statsService.getQuizStatsQuery(() => this.quizId());

  readonly quiz = computed(() => this.quizQuery.data());
  readonly questions = computed(() => this.questionsQuery.data() ?? []);
  readonly stats = computed(() => this.statsQuery.data());
}
```

Note: `QuestionsService` may not exist; if not, use `QuizzesService` method for questions.

Create `frontend/src/app/pages/quiz-overview/quiz-overview.html`:

```html
@if (quizQuery.error()) {
  <app-error-state [message]="quizQuery.error().message" (retry)="quizQuery.refetch()" />
} @else if (quizQuery.isPending()) {
  <app-loading-state message="Loading quiz..." />
} @else {
  <app-breadcrumb [items]="[
    { label: 'Programs', route: ['/programs'] },
    { label: quiz().programTitle ?? 'Program', route: ['/programs', quiz().programId] },
    { label: quiz().title }
  ]" />

  <app-page-header [title]="quiz().title" [subtitle]="quiz().description || 'Quiz overview'">
    <div actions class="button-row">
      <a class="button button-secondary" [routerLink]="['/quizzes', quizId(), 'builder']">Builder</a>
      <a class="button button-secondary" [routerLink]="['/quizzes', quizId(), 'settings']">Settings</a>
      <a class="button button-primary" [routerLink]="['/quizzes', quizId(), 'view']">Preview</a>
    </div>
  </app-page-header>

  <div class="metric-grid compact">
    <app-card><p class="metric-label">Status</p><p class="metric-value"><app-status-badge entity="quiz" [status]="quiz().status" /></p></app-card>
    <app-card><p class="metric-label">Questions</p><p class="metric-value">{{ questions().length }}</p></app-card>
    <app-card><p class="metric-label">Passing</p><p class="metric-value">{{ quiz().passingScore }}%</p></app-card>
  </div>

  @if (stats()) {
    <div class="metric-grid compact mt-6">
      <app-card><p class="metric-label">Attempts</p><p class="metric-value">{{ stats().attemptsCount }}</p></app-card>
      <app-card><p class="metric-label">Pass rate</p><p class="metric-value">{{ stats().passRate | number:'1.0-1' }}%</p></app-card>
      <app-card><p class="metric-label">Avg score</p><p class="metric-value">{{ stats().averageScore | number:'1.0-1' }}%</p></app-card>
    </div>
  }

  <app-card class="mt-6">
    <h2>Questions preview</h2>
    @if (questions().length === 0) {
      <app-empty-state message="No questions yet. Add some in the builder." />
    } @else {
      <div class="stack">
        @for (q of questions().slice(0, 5); track q.id) {
          <div class="question-card panel">
            <p class="font-medium">{{ q.text }}</p>
            <div class="option-grid">
              @for (opt of q.options; track opt.id) {
                <div class="option-card" [class.correct]="opt.isCorrect">
                  <span>{{ opt.text }}</span>
                  @if (opt.isCorrect) { <app-badge color="green" style="subtle">Correct</app-badge> }
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  </app-card>
}
```

- [ ] **Step 2: Implement Quiz settings**

Edit `frontend/src/app/pages/quiz-settings/quiz-settings.ts`:

```typescript
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-quiz-settings',
  standalone: true,
  imports: [
    FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent,
    LoadingStateComponent, ErrorStateComponent, ConfirmDialogComponent,
  ],
  templateUrl: './quiz-settings.html',
})
export class QuizSettings {
  private readonly router = inject(Router);
  private readonly quizzesService = inject(QuizzesService);

  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly query = this.quizzesService.getQuizQuery(() => this.quizId());

  readonly title = signal('');
  readonly description = signal('');
  readonly instructions = signal('');
  readonly passingScore = signal(70);
  readonly durationMinutes = signal(15);
  readonly maxAttempts = signal(3);
  readonly autoIssueCertificate = signal(true);
  readonly showDelete = signal(false);

  constructor() {
    effect(() => {
      const q = this.query.data();
      if (q) {
        this.title.set(q.title);
        this.description.set(q.description ?? '');
        this.instructions.set(q.instructions ?? '');
        this.passingScore.set(q.passingScore);
        this.durationMinutes.set(q.durationMinutes);
        this.maxAttempts.set(q.maxAttempts);
        this.autoIssueCertificate.set(q.autoIssueCertificate);
      }
    });
  }

  submit(event: Event) {
    event.preventDefault();
    this.quizzesService.updateMutation.mutate({
      id: this.quizId(),
      request: {
        title: this.title(),
        description: this.description() || undefined,
        instructions: this.instructions() || undefined,
        passingScore: this.passingScore(),
        durationMinutes: this.durationMinutes(),
        maxAttempts: this.maxAttempts(),
        autoIssueCertificate: this.autoIssueCertificate(),
      },
    });
  }

  delete() {
    this.quizzesService.deleteMutation.mutate(this.quizId(), {
      onSuccess: () => this.router.navigate(['/programs', this.query.data()?.programId]),
    });
  }
}
```

Create `frontend/src/app/pages/quiz-settings/quiz-settings.html`:

```html
@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading quiz..." />
} @else {
  <app-page-header title="Quiz settings" subtitle="Update or delete this quiz." />

  <form (submit)="submit($event)">
    <app-card>
      <div class="form-grid">
        <app-form-field label="Title"><input type="text" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required /></app-form-field>
        <app-form-field label="Passing score %"><input type="number" [ngModel]="passingScore()" (ngModelChange)="passingScore.set(+$event)" name="passingScore" min="1" max="100" required /></app-form-field>
        <app-form-field label="Duration (minutes)"><input type="number" [ngModel]="durationMinutes()" (ngModelChange)="durationMinutes.set(+$event)" name="durationMinutes" min="1" required /></app-form-field>
        <app-form-field label="Max attempts"><input type="number" [ngModel]="maxAttempts()" (ngModelChange)="maxAttempts.set(+$event)" name="maxAttempts" min="1" required /></app-form-field>
        <app-form-field label="Description"><textarea [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" rows="3"></textarea></app-form-field>
        <app-form-field label="Instructions"><textarea [ngModel]="instructions()" (ngModelChange)="instructions.set($event)" name="instructions" rows="3"></textarea></app-form-field>
      </div>
      <label class="flex items-center gap-2 mt-4">
        <input type="checkbox" [ngModel]="autoIssueCertificate()" (ngModelChange)="autoIssueCertificate.set($event)" name="autoIssueCertificate" />
        <span>Auto-issue certificate on passing attempt</span>
      </label>
      <div class="button-row mt-6">
        <app-button type="submit">Save changes</app-button>
      </div>
    </app-card>
  </form>

  <app-card>
    <h2>Danger zone</h2>
    <p class="text-ink-mute">Deleting a quiz cannot be undone.</p>
    <div class="button-row mt-4">
      <app-button variant="danger" (onClick)="showDelete.set(true)">Delete quiz</app-button>
    </div>
  </app-card>

  <app-confirm-dialog
    [open]="showDelete()"
    title="Delete quiz?"
    [message]="'This will permanently delete ' + query.data().title + '.'"
    confirmText="Delete"
    confirmVariant="danger"
    (confirm)="delete(); showDelete.set(false)"
    (cancel)="showDelete.set(false)"
  />
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/quiz-overview frontend/src/app/pages/quiz-settings
git commit -m "feat(frontend): implement quiz overview and settings"
```

---

### Task 5.2: Quiz builder

**Files:**
- Modify: `frontend/src/app/pages/quiz-builder/quiz-builder.component.ts` and `.html`

- [ ] **Step 1: Implement quiz builder**

Edit `frontend/src/app/pages/quiz-builder/quiz-builder.component.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuizzesService } from '../../services/quizzes.service';
import { QuestionsService } from '../../services/questions.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Question, Option } from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [
    FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent,
    LoadingStateComponent, ErrorStateComponent, BadgeComponent,
  ],
  templateUrl: './quiz-builder.component.html',
})
export class QuizBuilderComponent {
  private readonly quizzesService = inject(QuizzesService);
  private readonly questionsService = inject(QuestionsService);

  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly questionsQuery = this.questionsService.getQuestionsQuery(() => this.quizId());

  readonly questions = computed(() => this.questionsQuery.data() ?? []);

  readonly editingQuestion = signal<Question | null>(null);
  readonly questionText = signal('');
  readonly questionPoints = signal(1);
  readonly options = signal<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  startNew() {
    this.editingQuestion.set(null);
    this.questionText.set('');
    this.questionPoints.set(1);
    this.options.set([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
  }

  edit(q: Question) {
    this.editingQuestion.set(q);
    this.questionText.set(q.text);
    this.questionPoints.set(q.points);
    this.options.set(q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })));
  }

  addOption() {
    this.options.update(opts => [...opts, { text: '', isCorrect: false }]);
  }

  removeOption(index: number) {
    this.options.update(opts => opts.filter((_, i) => i !== index));
  }

  setCorrect(index: number) {
    this.options.update(opts => opts.map((o, i) => ({ ...o, isCorrect: i === index })));
  }

  saveQuestion(event: Event) {
    event.preventDefault();
    const request = {
      text: this.questionText(),
      points: this.questionPoints(),
      options: this.options(),
    };

    const editing = this.editingQuestion();
    if (editing) {
      this.questionsService.updateMutation.mutate({
        quizId: this.quizId(),
        questionId: editing.id,
        request,
      }, { onSuccess: () => this.startNew() });
    } else {
      this.questionsService.createMutation.mutate({
        quizId: this.quizId(),
        request,
      }, { onSuccess: () => this.startNew() });
    }
  }

  deleteQuestion(id: string) {
    this.questionsService.deleteMutation.mutate({ quizId: this.quizId(), questionId: id });
  }

  publish() {
    this.quizzesService.updateStatusMutation.mutate({
      id: this.quizId(),
      request: { status: 'PUBLISHED' },
    });
  }
}
```

Create `frontend/src/app/pages/quiz-builder/quiz-builder.component.html`:

```html
@if (quizQuery.error()) {
  <app-error-state [message]="quizQuery.error().message" (retry)="quizQuery.refetch()" />
} @else if (quizQuery.isPending()) {
  <app-loading-state message="Loading quiz..." />
} @else {
  <app-page-header [title]="'Builder: ' + quizQuery.data().title" subtitle="Add and edit questions.">
    <app-button actions (onClick)="publish()" [loading]="quizzesService.updateStatusMutation.isPending()">Publish quiz</app-button>
  </app-page-header>

  <app-card>
    <form (submit)="saveQuestion($event)">
      <div class="form-grid">
        <app-form-field label="Question" class="lg:col-span-2">
          <input type="text" [ngModel]="questionText()" (ngModelChange)="questionText.set($event)" name="text" required />
        </app-form-field>
        <app-form-field label="Points"><input type="number" [ngModel]="questionPoints()" (ngModelChange)="questionPoints.set(+$event)" name="points" min="1" required /></app-form-field>
      </div>

      <h3 class="mt-4">Options</h3>
      <div class="stack mt-2">
        @for (opt of options(); track $index) {
          <div class="option-card">
            <input type="radio" [checked]="opt.isCorrect" (change)="setCorrect($index)" name="correctOption" />
            <input type="text" [ngModel]="opt.text" (ngModelChange)="options.update(o => o.map((x, i) => i === $index ? { ...x, text: $event } : x))" name="opt-{{$index}}" placeholder="Option text" required />
            <app-button variant="ghost" size="sm" (onClick)="removeOption($index)">Remove</app-button>
          </div>
        }
      </div>
      <app-button variant="ghost" class="mt-3" (onClick)="addOption()">Add option</app-button>

      <div class="button-row mt-6">
        <app-button variant="ghost" (onClick)="startNew()">Clear</app-button>
        <app-button type="submit" [loading]="questionsService.createMutation.isPending() || questionsService.updateMutation.isPending()">
          {{ editingQuestion() ? 'Update question' : 'Add question' }}
        </app-button>
      </div>
    </form>
  </app-card>

  @if (questionsQuery.isPending()) {
    <app-loading-state message="Loading questions..." />
  } @else {
    <app-card>
      <h2>Questions</h2>
      @if (questions().length === 0) {
        <app-empty-state message="No questions yet." />
      } @else {
        <div class="stack">
          @for (q of questions(); track q.id) {
            <div class="panel question-card">
              <div class="flex justify-between items-start">
                <p class="font-medium">{{ q.text }}</p>
                <div class="button-row">
                  <app-button variant="ghost" size="sm" (onClick)="edit(q)">Edit</app-button>
                  <app-button variant="ghost" size="sm" (onClick)="deleteQuestion(q.id)">Delete</app-button>
                </div>
              </div>
              <div class="option-grid mt-2">
                @for (o of q.options; track o.id) {
                  <div class="option-card" [class.correct]="o.isCorrect">
                    <span>{{ o.text }}</span>
                    @if (o.isCorrect) { <app-badge color="green" style="subtle">Correct</app-badge> }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </app-card>
  }
}
```

- [ ] **Step 2: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/quiz-builder
git commit -m "feat(frontend): implement quiz builder"
```

---

### Task 5.3: Quiz attempt & result

**Files:**
- Modify: `frontend/src/app/pages/quiz-attempt/quiz-attempt.component.ts` and `.html`
- Modify: `frontend/src/app/pages/attempt-result/attempt-result.component.ts` and `.html`
- Modify: `frontend/src/app/pages/quiz-view/quiz-view.ts` and `.html`

- [ ] **Step 1: Implement Quiz attempt**

Edit `frontend/src/app/pages/quiz-attempt/quiz-attempt.component.ts`:

```typescript
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SubmitAnswerRequest } from '../../core/models/attempt.model';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, ButtonComponent],
  templateUrl: './quiz-attempt.component.html',
})
export class QuizAttemptComponent {
  private readonly router = inject(Router);
  private readonly quizzesService = inject(QuizzesService);
  private readonly attemptsService = inject(AttemptsService);

  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly questionsQuery = this.quizzesService.getQuizQuestionsQuery(() => this.quizId());

  readonly attempt = signal<StartAttemptResponse | null>(null);
  readonly answers = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      if (this.quizId() && !this.attempt()) {
        this.attemptsService.startMutation.mutate({ quizId: this.quizId() }, {
          onSuccess: (data) => this.attempt.set(data),
        });
      }
    });
  }

  selectAnswer(questionId: string, optionId: string) {
    this.answers.update(a => ({ ...a, [questionId]: optionId }));
  }

  submit() {
    const attemptId = this.attempt()?.attemptId;
    if (!attemptId) return;
    const responses: SubmitAnswerRequest[] = Object.entries(this.answers()).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }));
    this.attemptsService.submitMutation.mutate({ attemptId, request: { answers: responses } }, {
      onSuccess: () => this.router.navigate(['/attempts', attemptId, 'result']),
    });
  }
}
```

Create `frontend/src/app/pages/quiz-attempt/quiz-attempt.component.html`:

```html
@if (quizQuery.error()) {
  <app-error-state [message]="quizQuery.error().message" (retry)="quizQuery.refetch()" />
} @else if (quizQuery.isPending() || !attempt()) {
  <app-loading-state message="Starting quiz..." />
} @else {
  <app-page-header [title]="quizQuery.data().title" [subtitle]="'Answer all questions before time runs out.'" />

  <app-card>
    <div class="stack">
      @for (q of questionsQuery.data() ?? []; track q.id) {
        <div class="question-card panel">
          <p class="font-medium">{{ q.text }}</p>
          <div class="option-grid">
            @for (o of q.options; track o.id) {
              <label class="option-card" [class.selected]="answers()[q.id] === o.id">
                <input type="radio" [name]="'q-' + q.id" [value]="o.id" (change)="selectAnswer(q.id, o.id)" />
                <span>{{ o.text }}</span>
              </label>
            }
          </div>
        </div>
      }
    </div>
    <div class="button-row mt-6">
      <app-button type="submit" (onClick)="submit()" [loading]="attemptsService.submitMutation.isPending()">Submit attempt</app-button>
    </div>
  </app-card>
}
```

- [ ] **Step 2: Implement Attempt result**

Edit `frontend/src/app/pages/attempt-result/attempt-result.component.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttemptsService } from '../../services/attempts.service';
import { CertificatesService } from '../../services/certificates.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-attempt-result',
  standalone: true,
  imports: [RouterLink, CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, ButtonComponent, BadgeComponent],
  templateUrl: './attempt-result.component.html',
})
export class AttemptResultComponent {
  private readonly attemptsService = inject(AttemptsService);
  private readonly certificatesService = inject(CertificatesService);

  readonly attemptId = input.required<string>({ alias: 'attemptId' });
  readonly query = this.attemptsService.getAttemptQuery(() => this.attemptId());
  readonly attempt = computed(() => this.query.data());

  issueCertificate() {
    this.attemptsService.issueCertificateForAttempt.mutate({ attemptId: this.attemptId() });
  }
}
```

Create `frontend/src/app/pages/attempt-result/attempt-result.component.html`:

```html
@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading result..." />
} @else {
  <app-page-header title="Attempt result" subtitle="Summary of your quiz attempt." />

  <app-card>
    <div class="result-summary">
      <app-badge [color]="attempt().passed ? 'green' : 'red'" style="solid">{{ attempt().passed ? 'Passed' : 'Failed' }}</app-badge>
      <h2>{{ attempt().scorePercentage | number:'1.0-1' }}%</h2>
      <p>{{ attempt().earnedPoints }} / {{ attempt().totalPoints }} points</p>
      <p class="text-ink-mute">Submitted {{ attempt().submittedAt | date:'medium' }}</p>
    </div>

    @if (attempt().certificateIssued && attempt().certificateId) {
      <div class="button-row mt-6">
        <a class="button button-primary" [routerLink]="['/certificates', attempt().certificateId]">View certificate</a>
      </div>
    } @else if (attempt().passed) {
      <div class="button-row mt-6">
        <app-button (onClick)="issueCertificate()" [loading]="attemptsService.issueCertificateForAttempt.isPending()">Issue certificate</app-button>
      </div>
    }
  </app-card>
}
```

Create `frontend/src/app/pages/attempt-result/attempt-result.component.scss`:

```scss
.result-summary {
  text-align: center;
  padding: 24px;
}

.result-summary h2 {
  font-size: 48px;
  margin: 16px 0 8px;
}
```

- [ ] **Step 3: Implement Quiz preview (owner view)**

Edit `frontend/src/app/pages/quiz-view/quiz-view.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-quiz-view',
  standalone: true,
  imports: [RouterLink, CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, BadgeComponent],
  templateUrl: './quiz-view.html',
})
export class QuizView {
  private readonly quizzesService = inject(QuizzesService);
  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly questionsQuery = this.quizzesService.getQuizQuestionsQuery(() => this.quizId());
  readonly questions = computed(() => this.questionsQuery.data() ?? []);
}
```

Create `frontend/src/app/pages/quiz-view/quiz-view.html`:

```html
@if (quizQuery.error()) {
  <app-error-state [message]="quizQuery.error().message" (retry)="quizQuery.refetch()" />
} @else if (quizQuery.isPending()) {
  <app-loading-state message="Loading quiz..." />
} @else {
  <app-page-header [title]="'Preview: ' + quizQuery.data().title" subtitle="Participant view preview." />

  <app-card>
    <div class="stack">
      @for (q of questions(); track q.id) {
        <div class="question-card panel">
          <p class="font-medium">{{ q.text }}</p>
          <div class="option-grid">
            @for (o of q.options; track o.id) {
              <div class="option-card">
                <span>{{ o.text }}</span>
                @if (o.isCorrect) { <app-badge color="green" style="subtle">Correct</app-badge> }
              </div>
            }
          </div>
        </div>
      }
    </div>
  </app-card>
}
```

- [ ] **Step 4: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/quiz-attempt frontend/src/app/pages/attempt-result frontend/src/app/pages/quiz-view
git commit -m "feat(frontend): implement quiz attempt, result, and preview"
```

---

### Task 5.4: Quiz attempts list & stats

**Files:**
- Modify: `frontend/src/app/pages/quiz-attempts/quiz-attempts.ts` and `.html`
- Modify: `frontend/src/app/pages/quiz-stats/quiz-stats.ts` and `.html`

- [ ] **Step 1: Implement Quiz attempts list**

Edit `frontend/src/app/pages/quiz-attempts/quiz-attempts.ts`:

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizzesService } from '../../services/quizzes.service';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, PaginationComponent, StatusBadgeComponent,
  ],
  templateUrl: './quiz-attempts.html',
})
export class QuizAttempts {
  private readonly quizzesService = inject(QuizzesService);
  private readonly attemptsService = inject(AttemptsService);

  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly page = signal(0);
  readonly size = signal(10);

  readonly query = this.attemptsService.getQuizAttemptsQuery(() => this.quizId(), () => this.page(), () => this.size());
}
```

Create `frontend/src/app/pages/quiz-attempts/quiz-attempts.html`:

```html
@if (quizQuery.error()) {
  <app-error-state [message]="quizQuery.error().message" (retry)="quizQuery.refetch()" />
} @else if (quizQuery.isPending()) {
  <app-loading-state message="Loading quiz..." />
} @else {
  <app-page-header [title]="'Attempts: ' + quizQuery.data().title" subtitle="All attempts for this quiz." />

  @if (query.error()) {
    <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
  } @else if (query.isPending()) {
    <app-loading-state message="Loading attempts..." />
  } @else if (query.data().items.length === 0) {
    <app-empty-state message="No attempts yet." />
  } @else {
    <app-card>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Attempt</th><th>Participant</th><th>Score</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            @for (a of query.data().items; track a.attemptId) {
              <tr>
                <td><a class="link" [routerLink]="['/attempts', a.attemptId, 'result']">#{{ a.attemptNumber }}</a></td>
                <td>{{ a.userName ?? a.userId }}</td>
                <td>{{ a.status === 'SUBMITTED' ? (a.scorePercentage | number:'1.0-1') + '%' : '-' }}</td>
                <td><app-status-badge entity="attempt" [status]="a.status" /></td>
                <td>{{ a.submittedAt ? (a.submittedAt | date:'mediumDate') : '-' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination
        [page]="query.data().page"
        [size]="query.data().size"
        [totalElements]="query.data().totalElements"
        [totalPages]="query.data().totalPages"
        [hasNext]="query.data().hasNext"
        [hasPrevious]="query.data().hasPrevious"
        (pageChange)="page.set($event)"
      />
    </app-card>
  }
}
```

- [ ] **Step 2: Implement Quiz stats**

Edit `frontend/src/app/pages/quiz-stats/quiz-stats.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-quiz-stats',
  standalone: true,
  imports: [DecimalPipe, CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, BreadcrumbComponent],
  templateUrl: './quiz-stats.html',
})
export class QuizStats {
  private readonly quizzesService = inject(QuizzesService);
  private readonly statsService = inject(StatsService);

  readonly quizId = input.required<string>({ alias: 'quizId' });
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly statsQuery = this.statsService.getQuizStatsQuery(() => this.quizId());
  readonly stats = computed(() => this.statsQuery.data());
}
```

Create `frontend/src/app/pages/quiz-stats/quiz-stats.html`:

```html
@if (quizQuery.error()) {
  <app-error-state [message]="quizQuery.error().message" (retry)="quizQuery.refetch()" />
} @else if (quizQuery.isPending()) {
  <app-loading-state message="Loading quiz..." />
} @else {
  <app-page-header title="Quiz stats" subtitle="Attempt performance summary." />

  @if (statsQuery.error()) {
    <app-error-state [message]="statsQuery.error().message" (retry)="statsQuery.refetch()" />
  } @else if (statsQuery.isPending()) {
    <app-loading-state message="Loading stats..." />
  } @else {
    <div class="metric-grid">
      <app-card><p class="metric-label">Attempts</p><p class="metric-value">{{ stats().attemptsCount }}</p></app-card>
      <app-card><p class="metric-label">Submitted</p><p class="metric-value">{{ stats().submittedAttempts }}</p></app-card>
      <app-card><p class="metric-label">Pass count</p><p class="metric-value">{{ stats().passCount }}</p></app-card>
      <app-card><p class="metric-label">Fail count</p><p class="metric-value">{{ stats().failCount }}</p></app-card>
      <app-card><p class="metric-label">Avg score</p><p class="metric-value">{{ stats().averageScore | number:'1.0-1' }}%</p></app-card>
      <app-card><p class="metric-label">Highest</p><p class="metric-value">{{ stats().highestScore | number:'1.0-1' }}%</p></app-card>
      <app-card><p class="metric-label">Lowest</p><p class="metric-value">{{ stats().lowestScore | number:'1.0-1' }}%</p></app-card>
      <app-card><p class="metric-label">Pass rate</p><p class="metric-value">{{ stats().passRate | number:'1.0-1' }}%</p></app-card>
    </div>
  }
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/quiz-attempts frontend/src/app/pages/quiz-stats
git commit -m "feat(frontend): implement quiz attempts list and stats"
```

---

## Task 6: Participant & Certificate Pages

### Task 6.1: My enrollments

**Files:**
- Modify: `frontend/src/app/pages/my-enrollments/my-enrollments.ts` and `.html`

- [ ] **Step 1: Implement My enrollments**

Edit `frontend/src/app/pages/my-enrollments/my-enrollments.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EnrollmentsService } from '../../services/enrollments.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './my-enrollments.html',
})
export class MyEnrollments {
  private readonly enrollmentsService = inject(EnrollmentsService);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly query = this.enrollmentsService.myEnrollmentsQuery(() => ({
    page: this.page(),
    size: this.size(),
  }));
}
```

Create `frontend/src/app/pages/my-enrollments/my-enrollments.html`:

```html
<app-page-header title="My programs" subtitle="Programs you are enrolled in." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading enrollments..." />
} @else if (query.data().items.length === 0) {
  <app-empty-state message="You are not enrolled in any programs yet." />
} @else {
  <app-card>
    <div class="stack">
      @for (e of query.data().items; track e.id) {
        <a [routerLink]="['/programs', e.programId, 'learn']" class="list-row-link">
          <div>
            <p class="font-medium">{{ e.programTitle }}</p>
            <p class="text-sm text-ink-mute">{{ e.organizationName }}</p>
          </div>
          <span class="text-sm text-ink-mute">Enrolled {{ e.enrolledAt | date:'mediumDate' }}</span>
        </a>
      }
    </div>
    <app-pagination
      [page]="query.data().page"
      [size]="query.data().size"
      [totalElements]="query.data().totalElements"
      [totalPages]="query.data().totalPages"
      [hasNext]="query.data().hasNext"
      [hasPrevious]="query.data().hasPrevious"
      (pageChange)="page.set($event)"
    />
  </app-card>
}
```

- [ ] **Step 2: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/my-enrollments
git commit -m "feat(frontend): implement my enrollments page"
```

---

### Task 6.2: My attempts

**Files:**
- Modify: `frontend/src/app/pages/my-attempts/my-attempts.ts` and `.html`

- [ ] **Step 1: Implement My attempts**

Edit `frontend/src/app/pages/my-attempts/my-attempts.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-attempts',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, PaginationComponent, StatusBadgeComponent,
  ],
  templateUrl: './my-attempts.html',
})
export class MyAttempts {
  private readonly attemptsService = inject(AttemptsService);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly query = this.attemptsService.myAttemptsQuery;

  // Note: if myAttemptsQuery is not parameterized, bind data directly.
}
```

Note: The existing `AttemptsService` has `mineParams` signal and `myAttemptsQuery`. Update binding accordingly.

Create `frontend/src/app/pages/my-attempts/my-attempts.html`:

```html
<app-page-header title="My attempts" subtitle="Your quiz attempts across all programs." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading attempts..." />
} @else if ((query.data().items ?? []).length === 0) {
  <app-empty-state message="No attempts yet." />
} @else {
  <app-card>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Quiz</th><th>Score</th><th>Status</th><th>Submitted</th></tr></thead>
        <tbody>
          @for (a of query.data().items; track a.attemptId) {
            <tr>
              <td><a class="link" [routerLink]="['/attempts', a.attemptId, 'result']">{{ a.quizTitleSnapshot ?? a.quizId }}</a></td>
              <td>{{ a.status === 'SUBMITTED' ? (a.scorePercentage | number:'1.0-1') + '%' : '-' }}</td>
              <td><app-status-badge entity="attempt" [status]="a.status" /></td>
              <td>{{ a.submittedAt ? (a.submittedAt | date:'mediumDate') : '-' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </app-card>
}
```

- [ ] **Step 2: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/my-attempts
git commit -m "feat(frontend): implement my attempts page"
```

---

### Task 6.3: My certificates & certificate detail

**Files:**
- Modify: `frontend/src/app/pages/my-certificates/my-certificates.component.ts` and `.html`
- Modify: `frontend/src/app/pages/certificate-detail/certificate-detail.component.ts` and `.html`

- [ ] **Step 1: Implement My certificates**

Edit `frontend/src/app/pages/my-certificates/my-certificates.component.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent,
    PageHeaderComponent, PaginationComponent, StatusBadgeComponent,
  ],
  templateUrl: './my-certificates.component.html',
})
export class MyCertificatesComponent {
  private readonly certificatesService = inject(CertificatesService);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly query = this.certificatesService.myCertificatesQuery;
}
```

Create `frontend/src/app/pages/my-certificates/my-certificates.component.html`:

```html
<app-page-header title="My certificates" subtitle="Certificates you have earned." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading certificates..." />
} @else if ((query.data().items ?? []).length === 0) {
  <app-empty-state message="No certificates yet." />
} @else {
  <app-card>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Number</th><th>Program</th><th>Quiz</th><th>Score</th><th>Status</th><th></th></tr></thead>
        <tbody>
          @for (c of query.data().items; track c.id) {
            <tr>
              <td><a class="link" [routerLink]="['/certificates', c.id]">{{ c.certificateNumber }}</a></td>
              <td>{{ c.workshopTitleSnapshot }}</td>
              <td>{{ c.quizTitleSnapshot }}</td>
              <td>{{ c.score }}%</td>
              <td><app-status-badge entity="certificate" [status]="c.status" /></td>
              <td><a class="link" [href]="c.pdfUrl" target="_blank">PDF</a></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </app-card>
}
```

- [ ] **Step 2: Implement Certificate detail**

Edit `frontend/src/app/pages/certificate-detail/certificate-detail.component.ts`:

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { CertificatesService } from '../../services/certificates.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [CardComponent, LoadingStateComponent, ErrorStateComponent, PageHeaderComponent, ButtonComponent, StatusBadgeComponent],
  templateUrl: './certificate-detail.component.html',
})
export class CertificateDetailComponent {
  private readonly certificatesService = inject(CertificatesService);
  readonly certificateId = input.required<string>({ alias: 'certificateId' });
  readonly query = this.certificatesService.getCertificateQuery(() => this.certificateId());
  readonly cert = computed(() => this.query.data());
}
```

Create `frontend/src/app/pages/certificate-detail/certificate-detail.component.html`:

```html
@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading certificate..." />
} @else {
  <app-page-header [title]="cert().certificateNumber" subtitle="Certificate details." />

  <app-card>
    <div class="cert-detail">
      <div class="cert-header">
        <div>
          <p class="text-sm text-ink-mute">Recipient</p>
          <p class="text-lg font-semibold">{{ cert().recipientName }}</p>
        </div>
        <app-status-badge entity="certificate" [status]="cert().status" />
      </div>

      <dl class="detail-grid">
        <div><dt>Program</dt><dd>{{ cert().workshopTitleSnapshot }}</dd></div>
        <div><dt>Organization</dt><dd>{{ cert().workspaceNameSnapshot }}</dd></div>
        <div><dt>Quiz</dt><dd>{{ cert().quizTitleSnapshot }}</dd></div>
        <div><dt>Score</dt><dd>{{ cert().score }}%</dd></div>
        <div><dt>Issued</dt><dd>{{ cert().issuedAt | date:'medium' }}</dd></div>
        <div><dt>Verification code</dt><dd><code>{{ cert().verificationCode }}</code></dd></div>
      </dl>

      <div class="button-row mt-6">
        <a class="button button-primary" [href]="cert().pdfUrl" target="_blank">Download PDF</a>
        <a class="button button-secondary" [routerLink]="['/verify', cert().verificationCode]">Verify</a>
      </div>
    </div>
  </app-card>
}
```

Create `frontend/src/app/pages/certificate-detail/certificate-detail.component.scss`:

```scss
.cert-detail {
  display: grid;
  gap: 24px;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/my-certificates frontend/src/app/pages/certificate-detail
git commit -m "feat(frontend): implement my certificates and certificate detail"
```

---

### Task 6.4: Profile & join

**Files:**
- Modify: `frontend/src/app/pages/profile/profile.ts` and `.html`
- Modify: `frontend/src/app/pages/join/join.component.ts` and `.html`

- [ ] **Step 1: Implement Profile page**

Edit `frontend/src/app/pages/profile/profile.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClerkService } from 'ngx-clerk';
import { UsersService } from '../../services/users.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent,
    LoadingStateComponent, ErrorStateComponent, AvatarComponent,
  ],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly usersService = inject(UsersService);
  readonly clerk = inject(ClerkService);

  readonly query = this.usersService.meQuery;
  readonly name = signal('');

  constructor() {
    effect(() => {
      const user = this.query.data();
      if (user) this.name.set(user.name ?? '');
    });
  }

  submit(event: Event) {
    event.preventDefault();
    const clerkUser = this.clerk.user();
    this.usersService.updateMeMutation.mutate({
      name: this.name(),
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
      avatarUrl: clerkUser?.imageUrl ?? undefined,
    });
  }
}
```

Create `frontend/src/app/pages/profile/profile.html`:

```html
<app-page-header title="Profile" subtitle="Manage your account details." />

@if (query.error()) {
  <app-error-state [message]="query.error().message" (retry)="query.refetch()" />
} @else if (query.isPending()) {
  <app-loading-state message="Loading profile..." />
} @else {
  <app-card>
    <div class="flex items-center gap-4 mb-6">
      <app-avatar [src]="query.data().avatarUrl" [name]="query.data().name ?? query.data().email" size="xl" />
      <div>
        <h2>{{ query.data().name ?? 'User' }}</h2>
        <p class="text-ink-mute">{{ query.data().email }}</p>
      </div>
    </div>

    <form (submit)="submit($event)">
      <app-form-field label="Display name">
        <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" />
      </app-form-field>
      <div class="button-row mt-4">
        <app-button type="submit" [loading]="usersService.updateMeMutation.isPending()">Save profile</app-button>
      </div>
    </form>
  </app-card>
}
```

- [ ] **Step 2: Implement Join page**

Edit `frontend/src/app/pages/join/join.component.ts`:

```typescript
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvitationsService } from '../../services/invitations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [FormsModule, CardComponent, FormFieldComponent, PageHeaderComponent, ButtonComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './join.component.html',
})
export class JoinComponent {
  private readonly router = inject(Router);
  private readonly invitationsService = inject(InvitationsService);

  readonly codeFromRoute = input<string | undefined>(undefined, { alias: 'code' });
  readonly codeInput = signal('');
  readonly previewQuery = this.invitationsService.previewQuery(() => (this.codeFromRoute() ?? this.codeInput().trim()) || null);

  join() {
    const code = this.codeFromRoute() ?? this.codeInput().trim();
    if (!code) return;
    this.invitationsService.joinMutation.mutate(code, {
      onSuccess: (data) => {
        if (data.programId) this.router.navigate(['/programs', data.programId, 'learn']);
        else this.router.navigate(['/organizations']);
      },
    });
  }
}
```

Create `frontend/src/app/pages/join/join.component.html`:

```html
<app-page-header title="Join" subtitle="Accept an invitation to join an organization or program." />

<app-card>
  @if (!codeFromRoute()) {
    <app-form-field label="Invitation code">
      <input type="text" [ngModel]="codeInput()" (ngModelChange)="codeInput.set($event)" placeholder="Enter invitation code" />
    </app-form-field>
  }

  @if (previewQuery.isPending()) {
    <app-loading-state message="Loading invitation..." />
  } @else if (previewQuery.error()) {
    <app-error-state [message]="previewQuery.error().message" (retry)="previewQuery.refetch()" />
  } @else if (previewQuery.data()) {
    <div class="join-preview">
      <p>You have been invited to join <strong>{{ previewQuery.data().organizationName }}</strong></p>
      @if (previewQuery.data().programTitle) {
        <p>Program: <strong>{{ previewQuery.data().programTitle }}</strong></p>
      }
    </div>
  }

  <div class="button-row mt-6">
    <app-button (onClick)="join()" [loading]="invitationsService.joinMutation.isPending()">Accept invitation</app-button>
  </div>
</app-card>
```

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/pages/profile frontend/src/app/pages/join
git commit -m "feat(frontend): implement profile and join pages"
```

---

## Task 7: Cleanup & Verification

### Task 7.1: Remove dead code and placeholders

**Files:**
- Search: entire `frontend/src/app/pages` and `frontend/src/app/shared/components`
- Modify: `frontend/src/app/app.routes.ts`

- [ ] **Step 1: Search for remaining placeholder content**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend
grep -R "works!" src/app/pages src/app/shared/components || true
grep -R "Empty component body" src/app/pages || true
```

Expected: no matches.

- [ ] **Step 2: Remove unused imports and components**

Delete any component folders under `frontend/src/app/shared/components` that are no longer imported:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend/src/app/shared/components
# Already removed chart and date-picker in Task 1.2
ls
```

- [ ] **Step 3: Verify routes still compile**

Edit `frontend/src/app/app.routes.ts` if any component class names changed during implementation. Keep route definitions aligned with actual exported class names.

- [ ] **Step 4: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/app/app.routes.ts
git commit -m "chore(frontend): clean up placeholders and align routes"
```

---

### Task 7.2: Responsive and accessibility pass

**Files:**
- Modify: `frontend/src/styles.scss`
- Review: all page SCSS files

- [ ] **Step 1: Add missing responsive utilities if needed**

If any page uses classes that do not exist in `styles.scss`, add them as small utility additions. Do not change tokens.

- [ ] **Step 2: Verify focus and labels**

Ensure all forms use `<label>` or `app-form-field`, all buttons have accessible text, and modals have `aria-modal`.

- [ ] **Step 3: Build and commit**

Run:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build
```

Commit:

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/src/styles.scss
git commit -m "style(frontend): responsive and accessibility pass"
```

---

### Task 7.3: Final build and test verification

**Files:**
- All frontend files

- [ ] **Step 1: Run production build**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm run build -- --configuration production
```

Expected: exit 0, no errors.

- [ ] **Step 2: Run tests**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark/frontend && npm test -- --watch=false
```

Expected: all tests pass.

- [ ] **Step 3: Manual QA smoke checklist**

Verify these flows render without runtime errors:

1. `/` landing page loads.
2. `/sign-in` and `/sign-up` render Clerk components.
3. `/verify` accepts a code.
4. `/dashboard` loads after sign-in.
5. `/organizations` lists organizations.
6. `/organizations/new` creates an organization.
7. `/organizations/:id` overview loads.
8. `/organizations/:id/members` lists members.
9. `/organizations/:id/settings` edits organization.
10. `/programs/:id` overview loads.
11. `/programs/:id/resources` lists resources.
12. `/programs/:id/quizzes` lists quizzes.
13. `/programs/:id/quizzes/new` creates quiz.
14. `/quizzes/:id/builder` adds question.
15. `/quizzes/:id/attempt` starts attempt.
16. `/attempts/:id/result` shows result.
17. `/my-certificates` lists certificates.
18. `/certificates/:id` shows detail.
19. `/profile` loads.
20. `/join/:code` accepts invitation.

- [ ] **Step 4: Commit final verification**

```bash
cd /mnt/c/Users/shadi/IdeaProjects/Skillmark
git add frontend/
git commit -m "feat(frontend): complete frontend remake - final verification"
```

---

## Self-Review Checklist

Before marking the plan complete, verify:

- [ ] Every spec requirement from `docs/superpowers/specs/2026-07-08-skillmark-frontend-remake-design.md` maps to at least one task.
- [ ] No TBD/TODO/placeholder steps remain in this plan.
- [ ] Type/method names are consistent across tasks (e.g., `attemptId`, `quizId`, `programId`).
- [ ] Each task ends with a build or test command and a commit.
- [ ] Service method names are based on the actual existing services; adjust during implementation if a method does not exist.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-08-skillmark-frontend-remake-plan.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. Requires `superpowers:subagent-driven-development`.
2. **Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Which approach would you like?
