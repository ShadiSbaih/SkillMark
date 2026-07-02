import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ClerkService, ClerkUserButtonComponent } from 'ngx-clerk';

interface NavLink {
  label: string;
  route: string;
  roles: ('owner' | 'participant')[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ClerkUserButtonComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  readonly clerk = inject(ClerkService);

  readonly mobileOpen = signal(false);

  readonly organizations = signal([
    { id: 'org-cs', name: 'CS Club' },
    { id: 'org-data', name: 'Data Guild' },
  ]);
  readonly selectedOrganizationId = signal<string | null>(null);

  readonly navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/dashboard', roles: ['owner', 'participant'] },
    { label: 'Organizations', route: '/organizations', roles: ['owner'] },
    { label: 'Programs', route: '/programs', roles: ['owner'] },
    { label: 'My Programs', route: '/my-programs', roles: ['participant'] },
    { label: 'My Attempts', route: '/my-attempts', roles: ['participant'] },
    { label: 'My Certificates', route: '/my-certificates', roles: ['participant', 'owner'] },
  ];

  readonly ownerLinks = this.navLinks.filter((link) => link.roles.includes('owner'));
  readonly participantLinks = this.navLinks.filter((link) => link.roles.includes('participant'));

  toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  onOrganizationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    this.selectedOrganizationId.set(id);
    if (id) {
      void this.router.navigate(['/organizations', id]);
    }
  }
}
