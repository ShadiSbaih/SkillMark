import { Component,  inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ProductLanguage } from '../../constants/product-language';

interface NavLink {
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly isAdmin = this.auth.isAdmin;

  readonly mobileOpen = signal(false);

  readonly adminLinks: NavLink[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Programs', route: '/programs' },
  ];

  readonly studentLinks: NavLink[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'My Programs', route: '/my-enrollments' },
    { label: ProductLanguage.quiz.plural, route: '/my-attempts' },
    { label: ProductLanguage.certificate.plural, route: '/my-certificates' },
  ];

  readonly accountLinks: NavLink[] = [{ label: 'Profile', route: '/profile' }];

  constructor() {}

  async logout(): Promise<void> {
    await this.auth.logout();
  }

  toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
