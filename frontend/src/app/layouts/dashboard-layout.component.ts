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
        <div class="container-shell flex h-16 items-center justify-between">
          <div class="flex items-center gap-3">
            <button class="app-focus rounded-[var(--radius-pill)] p-2 lg:hidden" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Toggle navigation">
              <lucide-icon name="menu" size="20" />
            </button>
            <a routerLink="/dashboard" class="font-display text-xl font-light tracking-[-0.4px] text-[var(--color-ink)]">Skillmark</a>
          </div>
          <div class="flex items-center gap-3">
            <button class="app-focus rounded-[var(--radius-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-2 text-[var(--color-ink-mute)]" aria-label="Notifications">
              <lucide-icon name="bell" size="18" />
            </button>
            <a routerLink="/profile" class="hidden text-sm text-[var(--color-ink-secondary)] sm:block">{{ displayName() }}</a>
            <app-button variant="ghost" (click)="signOut()">
              <lucide-icon name="log-out" size="16" />
              Sign out
            </app-button>
          </div>
        </div>
      </header>

      <div class="flex">
        <aside
          class="dashboard-sidebar fixed inset-y-16 left-0 z-20 w-72 p-4 transition lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)]"
          [class.hidden]="!sidebarOpen()"
        >
          <nav class="space-y-6">
            <section>
              <p class="px-3 text-[10px] font-normal uppercase tracking-[0.1px] text-[var(--color-ink-mute)]">Workspace</p>
              <div class="mt-2 space-y-1">
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
            <section>
              <p class="px-3 text-[10px] font-normal uppercase tracking-[0.1px] text-[var(--color-ink-mute)]">Participant</p>
              <div class="mt-2 space-y-1">
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

        <section class="min-w-0 flex-1 px-4 py-8 lg:px-8">
          <div class="mx-auto max-w-7xl">
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
