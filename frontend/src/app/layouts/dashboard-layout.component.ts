import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../core/auth/auth.service';
import { ButtonComponent } from '../shared/ui/button.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
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
            <a routerLink="/dashboard" class="dashboard-brand font-display">Skillmark</a>
          </div>
          <div class="dashboard-user-row">
            <button class="dashboard-icon-button app-focus" aria-label="Notifications">
              <lucide-icon name="bell" size="18" />
            </button>
            <a routerLink="/profile" class="dashboard-profile-link">{{ displayName() }}</a>
            <app-button variant="ghost" (click)="signOut()">
              <lucide-icon name="log-out" size="16" />
              Sign out
            </app-button>
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
              <p class="dashboard-nav-heading">Workspace</p>
              <div class="dashboard-nav-list">
                @for (item of mainItems; track item.path) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="active"
                    class="dashboard-nav-link app-focus"
                    (click)="sidebarOpen.set(false)"
                  >
                    <lucide-icon [name]="item.icon" size="17" />
                    {{ item.label }}
                  </a>
                }
              </div>
            </section>
            <section class="dashboard-nav-section">
              <p class="dashboard-nav-heading">Participant</p>
              <div class="dashboard-nav-list">
                @for (item of participantItems; track item.path) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="active"
                    class="dashboard-nav-link app-focus"
                    (click)="sidebarOpen.set(false)"
                  >
                    <lucide-icon [name]="item.icon" size="17" />
                    {{ item.label }}
                  </a>
                }
              </div>
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

  readonly sidebarOpen = signal(false);
  readonly displayName = computed(() => this.auth.currentUser()?.name || this.auth.currentUser()?.email || 'Profile');

  readonly mainItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard' },
    { label: 'Organizations', path: '/organizations', icon: 'building-2' },
    { label: 'Quizzes', path: '/quizzes', icon: 'book-open' },
    { label: 'Certificates', path: '/certificates', icon: 'award' },
  ];

  readonly participantItems = [
    { label: 'My enrollments', path: '/my-enrollments', icon: 'users' },
    { label: 'My attempts', path: '/my-attempts', icon: 'file-text' },
    { label: 'My certificates', path: '/my-certificates', icon: 'shield-check' },
    { label: 'Profile', path: '/profile', icon: 'user' },
  ];

  signOut(): void {
    void this.auth.signOut();
  }
}
