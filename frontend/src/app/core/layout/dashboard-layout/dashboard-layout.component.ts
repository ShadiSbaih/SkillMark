import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ClerkService, ClerkUserButtonComponent } from 'ngx-clerk';
import { OrganizationsService } from '../../../services/organizations.service';
import { OrganizationResponse } from '../../models/organization.model';

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
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  readonly clerk = inject(ClerkService);
  private readonly organizationsService = inject(OrganizationsService);

  readonly mobileOpen = signal(false);
  readonly selectedOrganizationId = signal<string | null>(null);

  readonly listQuery = this.organizationsService.organizationsQuery;
  readonly organizations = computed<OrganizationResponse[]>(() => {
    const data = this.listQuery.data();
    return data?.items ?? [];
  });

  readonly userName = computed(() => {
    const user = this.clerk.user();
    return user?.firstName ?? user?.username ?? 'User';
  });

  readonly navLinks: NavLink[] = [
    { label: 'Dashboard', route: '/dashboard', roles: ['owner', 'participant'] },
    { label: 'My Organizations', route: '/organizations', roles: ['owner'] },
    { label: 'My Programs', route: '/my-enrollments', roles: ['participant'] },
    { label: 'My Attempts', route: '/my-attempts', roles: ['participant'] },
    { label: 'My Certificates', route: '/my-certificates', roles: ['participant', 'owner'] },
  ];

  readonly ownerLinks = this.navLinks.filter((link) => link.roles.includes('owner'));
  readonly participantLinks = this.navLinks.filter((link) => link.roles.includes('participant'));

  constructor() {
    effect(() => {
      const orgs = this.organizations();
      const current = this.selectedOrganizationId();
      if (orgs.length > 0 && !current) {
        this.selectedOrganizationId.set(orgs[0].id);
      }
    });
  }

  toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  onOrganizationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    this.selectedOrganizationId.set(id || null);
    if (id) {
      void this.router.navigate(['/organizations', id]);
    }
  }
}
