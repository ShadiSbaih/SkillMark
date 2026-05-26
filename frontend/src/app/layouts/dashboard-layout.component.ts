import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../core/auth/auth.service';
import { OrganizationsApi } from '../core/api/organizations.api';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
  ],
  template: `
    <main class="dashboard-shell">
      <header class="dashboard-header">
        <div class="dashboard-header-inner">
          <div class="dashboard-brand-row">
            <button class="dashboard-menu-button app-focus" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Toggle navigation">
              <lucide-icon name="menu" size="20" />
            </button>
            <a routerLink="/dashboard" class="dashboard-brand app-focus">
              <span class="dashboard-brand-mark">S</span>
              <span>Skillmark</span>
            </a>
            <a
              routerLink="/organizations"
              class="dashboard-org-switcher app-focus"
              aria-label="Open organizations"
            >
              <lucide-icon name="building-2" size="15" />
              <span>{{ currentOrganizationName() }}</span>
              <lucide-icon name="chevron-down" size="14" />
            </a>
          </div>
          <div class="dashboard-user-row">
            <button class="dashboard-icon-button app-focus" aria-label="Notifications">
              <lucide-icon name="bell" size="18" />
            </button>
            <a routerLink="/profile" class="dashboard-user-menu app-focus">
              <span class="dashboard-avatar">{{ initials() }}</span>
              <span class="dashboard-profile-link">{{ firstName() }}</span>
              <lucide-icon name="chevron-down" size="14" />
            </a>
          </div>
        </div>
      </header>

      <div class="dashboard-body">
        @if (sidebarOpen()) {
          <button class="dashboard-scrim" aria-label="Close navigation" (click)="sidebarOpen.set(false)"></button>
        }
        <aside
          class="dashboard-sidebar"
          [class.open]="sidebarOpen()"
        >
          <nav class="dashboard-nav">
            <section class="dashboard-nav-section">
              <div class="dashboard-nav-list">
                <a
                  routerLink="/dashboard"
                  routerLinkActive="active"
                  class="dashboard-nav-link dashboard-nav-primary app-focus"
                  (click)="sidebarOpen.set(false)"
                >
                  <lucide-icon name="layout-dashboard" size="17" />
                  Dashboard
                </a>
              </div>
            </section>

            <section class="dashboard-nav-section">
              <p class="dashboard-nav-heading">Organizations</p>
              <div class="dashboard-nav-list dashboard-nav-tree">
                <button type="button" class="dashboard-tree-parent app-focus">
                  <lucide-icon name="building-2" size="16" />
                  <span>{{ shortOrganizationName() }}</span>
                  <lucide-icon name="chevron-down" size="14" />
                </button>
                @for (item of organizationItems(); track item.label) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="active"
                    class="dashboard-nav-link dashboard-nav-child app-focus"
                    (click)="sidebarOpen.set(false)"
                  >
                    <lucide-icon [name]="item.icon" size="16" />
                    {{ item.label }}
                  </a>
                }
              </div>
            </section>

            <section class="dashboard-nav-section">
              <p class="dashboard-nav-heading">Programs</p>
              <div class="dashboard-nav-list dashboard-nav-tree">
                <button type="button" class="dashboard-tree-parent app-focus">
                  <lucide-icon name="folder" size="16" />
                  <span>Git Workshop</span>
                  <lucide-icon name="chevron-down" size="14" />
                </button>
                @for (item of programItems(); track item.label) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="active"
                    class="dashboard-nav-link dashboard-nav-child app-focus"
                    (click)="sidebarOpen.set(false)"
                  >
                    <lucide-icon [name]="item.icon" size="16" />
                    {{ item.label }}
                  </a>
                }
              </div>
            </section>

            <section class="dashboard-nav-section dashboard-nav-footer">
              <a routerLink="/certificates" routerLinkActive="active" class="dashboard-nav-link app-focus">
                <lucide-icon name="award" size="17" />
                Certificates
              </a>
              <a routerLink="/my-enrollments" routerLinkActive="active" class="dashboard-nav-link app-focus">
                <lucide-icon name="book-open" size="17" />
                My Programs
              </a>
              <a routerLink="/my-attempts" routerLinkActive="active" class="dashboard-nav-link app-focus">
                <lucide-icon name="clipboard-list" size="17" />
                My Attempts
              </a>
              <a routerLink="/my-certificates" routerLinkActive="active" class="dashboard-nav-link app-focus">
                <lucide-icon name="shield-check" size="17" />
                My Certificates
              </a>
            </section>
          </nav>
        </aside>

        <section class="dashboard-content">
          <div class="dashboard-content-inner">
            <router-outlet />
          </div>
        </section>
      </div>
    </main>
  `,
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly organizationsApi = inject(OrganizationsApi);

  readonly sidebarOpen = signal(false);

  readonly organizations = injectQuery(() => ({
    queryKey: ['layout-organizations', 0, 5],
    queryFn: () => this.organizationsApi.list(0, 5),
  }));

  readonly currentOrganization = computed(() => this.organizations.data()?.items?.[0] ?? null);
  readonly currentOrganizationName = computed(() => this.currentOrganization()?.name || 'Computer Science Club');
  readonly shortOrganizationName = computed(() => {
    const name = this.currentOrganizationName();
    return name.length > 16 ? `${name.slice(0, 14)}...` : name;
  });

  readonly displayName = computed(() => this.auth.currentUser()?.name || this.auth.currentUser()?.email || 'Ahmad');
  readonly firstName = computed(() => this.displayName().split(/\s+/)[0] || 'Ahmad');
  readonly initials = computed(() => {
    const name = this.displayName().trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) || 'AA').toUpperCase();
  });

  readonly organizationItems = computed(() => {
    const orgId = this.currentOrganization()?.id;
    return [
      { label: 'Overview', path: orgId ? ['/organizations', orgId] : ['/organizations'], icon: 'layout-dashboard' },
      { label: 'Members', path: orgId ? ['/organizations', orgId, 'members'] : ['/organizations'], icon: 'users' },
      { label: 'Programs', path: orgId ? ['/organizations', orgId, 'programs'] : ['/organizations'], icon: 'book-open' },
      { label: 'Statistics', path: orgId ? ['/organizations', orgId, 'stats'] : ['/organizations'], icon: 'bar-chart-3' },
      { label: 'Audit Logs', path: orgId ? ['/organizations', orgId, 'audit-logs'] : ['/organizations'], icon: 'scroll-text' },
      { label: 'Settings', path: orgId ? ['/organizations', orgId] : ['/organizations'], icon: 'settings' },
    ];
  });

  readonly programItems = computed(() => {
    const orgId = this.currentOrganization()?.id;
    const programsPath = orgId ? ['/organizations', orgId, 'programs'] : ['/organizations'];
    return [
      { label: 'Overview', path: programsPath, icon: 'layout-dashboard' },
      { label: 'Enrollments', path: '/my-enrollments', icon: 'users' },
      { label: 'Invitations', path: programsPath, icon: 'clipboard-list' },
      { label: 'Resources', path: programsPath, icon: 'file-text' },
      { label: 'Quizzes', path: '/quizzes', icon: 'graduation-cap' },
      { label: 'Statistics', path: orgId ? ['/organizations', orgId, 'stats'] : ['/organizations'], icon: 'bar-chart-3' },
    ];
  });
}
