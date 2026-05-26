import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { CertificatesApi } from '../../core/api/certificates.api';
import { StatsApi } from '../../core/api/stats.api';
import { AuthService } from '../../core/auth/auth.service';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, RouterLink, LoadingStateComponent, ErrorStateComponent],
  template: `
    <section class="workspace-dashboard">
      <header class="workspace-page-header">
        <div>
          <h1>Welcome back, {{ firstName() }} <span aria-hidden="true">👋</span></h1>
        </div>
        <a routerLink="/organizations" class="workspace-create-button app-focus">
          <span aria-hidden="true">+</span>
          New Organization
        </a>
      </header>

      <section class="workspace-section">
        <p class="workspace-section-title">My Organizations</p>

        @if (organizations.isPending()) {
          <app-loading-state />
        } @else if (organizations.isError()) {
          <app-error-state title="Organizations unavailable" message="Check the backend connection and try again." />
        } @else {
          <div class="organization-card-grid">
            @for (org of organizations.data()?.items ?? []; track org.id; let i = $index) {
              <article class="organization-card">
                <div class="organization-avatar">{{ orgInitial(org.name) }}</div>
                <h2>{{ org.name }}</h2>
                <div class="organization-card-metrics">
                  <div>
                    <strong>{{ i === 0 ? quickStats()[0].value : '-' }}</strong>
                    <span>Programs</span>
                  </div>
                  <div>
                    <strong>{{ i === 0 ? quickStats()[1].value : '-' }}</strong>
                    <span>Members</span>
                  </div>
                </div>
                <a [routerLink]="['/organizations', org.id]" class="organization-open-button app-focus">Open</a>
              </article>
            } @empty {
              <a routerLink="/organizations" class="organization-create-card app-focus">
                <span>+</span>
                <strong>New Organization</strong>
              </a>
            }

            <a routerLink="/organizations" class="organization-create-card app-focus">
              <span>+</span>
              <strong>New Organization</strong>
            </a>
          </div>
        }
      </section>

      <section class="workspace-lower-grid">
        <div class="workspace-section">
          <p class="workspace-section-title">Quick Stats · {{ selectedOrganizationName() }}</p>
          @if (statsQuery.isPending() && selectedOrganizationId()) {
            <app-loading-state />
          } @else {
            <div class="quick-stat-grid">
              @for (stat of quickStats(); track stat.label) {
                <article class="quick-stat-card" [class.featured]="stat.featured">
                  <strong>{{ stat.value }}</strong>
                  <span>{{ stat.label }}</span>
                </article>
              }
            </div>
          }
        </div>

        <div class="workspace-section">
          <p class="workspace-section-title">Recent Activity</p>
          <article class="activity-card">
            @if (auditLogs.isPending() && selectedOrganizationId()) {
              <app-loading-state />
            } @else {
              @for (activity of recentActivity(); track activity.id) {
                <div class="activity-row">
                  <span class="activity-dot"></span>
                  <span>{{ activity.label }}</span>
                  <time>{{ activity.createdAt | date:'shortTime' }}</time>
                </div>
              } @empty {
                <div class="activity-row empty">
                  <span class="activity-dot"></span>
                  <span>Activity will appear after owner actions</span>
                  <time>Now</time>
                </div>
              }
            }
          </article>
        </div>
      </section>
    </section>
  `,
})
export class DashboardPageComponent {
  private readonly organizationsApi = inject(OrganizationsApi);
  private readonly quizzesApi = inject(QuizzesApi);
  private readonly certificatesApi = inject(CertificatesApi);
  private readonly statsApi = inject(StatsApi);
  private readonly auth = inject(AuthService);

  readonly organizations = injectQuery(() => ({
    queryKey: ['organizations', 0, 5],
    queryFn: () => this.organizationsApi.list(0, 5),
  }));

  readonly quizzes = injectQuery(() => ({
    queryKey: ['quizzes', 0, 5],
    queryFn: () => this.quizzesApi.list(0, 5),
  }));

  readonly certificates = injectQuery(() => ({
    queryKey: ['certificates', 'me', 0, 5],
    queryFn: () => this.certificatesApi.mine(0, 5),
  }));

  readonly selectedOrganization = computed(() => this.organizations.data()?.items?.[0] ?? null);
  readonly selectedOrganizationId = computed(() => this.selectedOrganization()?.id ?? null);
  readonly selectedOrganizationName = computed(() => this.selectedOrganization()?.name || 'Computer Science Club');
  readonly firstName = computed(() => (this.auth.currentUser()?.name || 'Ahmad').split(/\s+/)[0] || 'Ahmad');

  readonly statsQuery = injectQuery(() => ({
    queryKey: ['dashboard-organization-stats', this.selectedOrganizationId()],
    enabled: !!this.selectedOrganizationId(),
    queryFn: () => this.statsApi.organization(this.selectedOrganizationId() as string),
  }));

  readonly auditLogs = injectQuery(() => ({
    queryKey: ['dashboard-audit-logs', this.selectedOrganizationId()],
    enabled: !!this.selectedOrganizationId(),
    queryFn: () => this.organizationsApi.auditLogs(this.selectedOrganizationId() as string, 0, 4),
  }));

  quickStats() {
    const orgStats = this.statsQuery.data();
    return [
      { label: 'Programs', value: orgStats?.totalPrograms ?? 0 },
      { label: 'Members', value: orgStats?.totalMembers ?? 0 },
      { label: 'Quizzes', value: orgStats?.totalQuizzes ?? this.quizzes.data()?.totalElements ?? 0 },
      {
        label: 'Certificates',
        value: orgStats?.totalCertificates ?? this.certificates.data()?.totalElements ?? 0,
        featured: true,
      },
    ];
  }

  recentActivity() {
    return (this.auditLogs.data()?.items ?? []).map((log) => ({
      id: log.id,
      label: this.formatActivity(log.action, log.entityType),
      createdAt: log.createdAt,
    }));
  }

  orgInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || 'S';
  }

  private formatActivity(action: string, entityType?: string | null): string {
    const normalized = action.toLowerCase().replaceAll('_', ' ');
    const entity = entityType ? ` ${entityType.toLowerCase()}` : '';
    return `${this.firstName()} ${normalized}${entity}`;
  }
}
