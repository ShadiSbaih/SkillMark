import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { OrganizationsService } from '../../../services/organizations.service';
import { OrganizationResponse } from '../../models/organization.model';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ProductLanguage } from '../../constants/product-language';

interface NavLink {
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LoadingStateComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly organizationsService = inject(OrganizationsService);

  readonly user = this.auth.user;

  readonly mobileOpen = signal(false);
  readonly selectedOrganizationId = signal<string | null>(null);

  readonly listQuery = this.organizationsService.organizationsQuery;
  readonly organizations = computed<OrganizationResponse[]>(() => {
    const data = this.listQuery.data();
    return data?.items ?? [];
  });

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly currentOrganizationId = computed(() => {
    const match = this.currentUrl().match(/\/organizations\/([a-zA-Z0-9-]+)/);
    return match?.[1] ?? null;
  });

  readonly ownerLinks = computed<NavLink[]>(() => {
    const links: NavLink[] = [
      { label: 'Dashboard', route: '/dashboard' },
      { label: ProductLanguage.organization.plural, route: '/organizations' },
    ];

    const orgId = this.currentOrganizationId();
    if (orgId) {
      links.push(
        { label: 'Overview', route: `/organizations/${orgId}` },
        { label: ProductLanguage.membership.plural, route: `/organizations/${orgId}/members` },
        { label: 'Credentials', route: `/organizations/${orgId}/certificates` },
        { label: 'Settings', route: `/organizations/${orgId}/settings` }
      );
    }

    return links;
  });

  readonly participantLinks: NavLink[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'My Programs', route: '/my-enrollments' },
    { label: ProductLanguage.quiz.plural, route: '/my-attempts' },
    { label: ProductLanguage.certificate.plural, route: '/my-certificates' },
  ];

  readonly accountLinks: NavLink[] = [{ label: 'Profile', route: '/profile' }];

  constructor() {
    effect(() => {
      const currentOrg = this.currentOrganizationId();
      const orgs = this.organizations();
      const selected = this.selectedOrganizationId();

      if (currentOrg) {
        this.selectedOrganizationId.set(currentOrg);
      } else if (orgs.length > 0 && !selected) {
        this.selectedOrganizationId.set(orgs[0].id);
      }
    });
  }

  async logout(): Promise<void> {
    await this.auth.logout();
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
