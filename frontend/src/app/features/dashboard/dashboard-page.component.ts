import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { AttemptsApi } from '../../core/api/attempts.api';
import { CertificatesApi } from '../../core/api/certificates.api';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, RouterLink, CardComponent, PageHeaderComponent, LoadingStateComponent, ErrorStateComponent, ButtonComponent],
  template: `
    <app-page-header
      eyebrow="Dashboard"
      title="Workspace overview"
      description="A role-aware launch point for organization management and participant learning."
    >
      <a routerLink="/organizations"><app-button>Manage organizations</app-button></a>
    </app-page-header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      @for (stat of stats(); track stat.label) {
        <app-card [tone]="stat.dark ? 'dark' : 'light'">
          <p class="metric-label">{{ stat.label }}</p>
          <p class="metric-value mt-3">{{ stat.value }}</p>
        </app-card>
      }
    </section>

    <section class="mt-8 grid gap-5 lg:grid-cols-2">
      <app-card>
        <div class="flex items-center justify-between">
          <h2 class="app-card-title">Recent organizations</h2>
          <a routerLink="/organizations" class="app-link text-sm">View all</a>
        </div>
        @if (organizations.isPending()) {
          <div class="mt-4"><app-loading-state /></div>
        } @else if (organizations.isError()) {
          <div class="mt-4">
            <app-error-state title="Organizations unavailable" message="Check the backend connection and try again." />
          </div>
        } @else {
          <div class="mt-4 divide-y divide-[var(--color-hairline)]">
            @for (org of organizations.data()?.items ?? []; track org.id) {
              <a [routerLink]="['/organizations', org.id]" class="block py-3">
                <p class="text-sm font-normal text-[var(--color-ink)]">{{ org.name }}</p>
                <p class="text-xs text-[var(--color-ink-mute)]">{{ org.status }} · {{ org.createdAt | date:'mediumDate' }}</p>
              </a>
            } @empty {
              <p class="py-4 text-sm text-[var(--color-ink-mute)]">Create an organization to begin.</p>
            }
          </div>
        }
      </app-card>

      <app-card tone="cream">
        <h2 class="app-card-title">Next actions</h2>
        <div class="mt-4 grid gap-3">
          <a routerLink="/organizations" class="tile text-sm">Create organization and invite participants</a>
          <a routerLink="/quizzes" class="tile text-sm">Review accessible quizzes</a>
          <a routerLink="/my-certificates" class="tile text-sm">Open certificate history</a>
        </div>
      </app-card>
    </section>
  `,
})
export class DashboardPageComponent {
  private readonly organizationsApi = inject(OrganizationsApi);
  private readonly quizzesApi = inject(QuizzesApi);
  private readonly attemptsApi = inject(AttemptsApi);
  private readonly certificatesApi = inject(CertificatesApi);

  readonly organizations = injectQuery(() => ({
    queryKey: ['organizations', 0, 5],
    queryFn: () => this.organizationsApi.list(0, 5),
  }));
  readonly quizzes = injectQuery(() => ({
    queryKey: ['quizzes', 0, 5],
    queryFn: () => this.quizzesApi.list(0, 5),
  }));
  readonly attempts = injectQuery(() => ({
    queryKey: ['attempts', 'me', 0, 5],
    queryFn: () => this.attemptsApi.mine(0, 5),
  }));
  readonly certificates = injectQuery(() => ({
    queryKey: ['certificates', 'me', 0, 5],
    queryFn: () => this.certificatesApi.mine(0, 5),
  }));

  stats() {
    return [
      { label: 'Organizations', value: this.organizations.data()?.totalElements ?? 0 },
      { label: 'Accessible quizzes', value: this.quizzes.data()?.totalElements ?? 0 },
      { label: 'My attempts', value: this.attempts.data()?.totalElements ?? 0 },
      { label: 'Certificates', value: this.certificates.data()?.totalElements ?? 0, dark: true },
    ];
  }
}
