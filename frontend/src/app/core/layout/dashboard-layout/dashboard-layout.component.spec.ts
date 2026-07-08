import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../auth/auth.service';
import { OrganizationsService } from '../../../services/organizations.service';
import { OrganizationResponse } from '../../models/organization.model';
import { PageResponse } from '../../api/api-response.model';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { DashboardLayoutComponent } from './dashboard-layout.component';

class FakeAuthService {
  readonly user = signal<{ id: string; name: string; email: string } | null>({
    id: 'user-1',
    name: 'Alice Doe',
    email: 'alice@example.com',
  });
  readonly isSignedIn = signal(true);
  readonly isLoaded = signal(true);

  logout = vi.fn().mockResolvedValue(undefined);
}

@Component({
  selector: 'app-blank',
  standalone: true,
  template: '',
})
class BlankComponent {}

interface OrganizationsQueryState {
  isLoading: boolean;
  error: Error | null;
  data: PageResponse<OrganizationResponse> | null;
}

class FakeOrganizationsService {
  private readonly state = signal<OrganizationsQueryState>({
    isLoading: false,
    error: null,
    data: null,
  });

  readonly organizationsQuery = {
    isLoading: () => this.state().isLoading,
    error: () => this.state().error,
    data: () => this.state().data,
  };

  setLoading() {
    this.state.set({ isLoading: true, error: null, data: null });
  }

  setError(error: Error) {
    this.state.set({ isLoading: false, error, data: null });
  }

  setData(data: PageResponse<OrganizationResponse>) {
    this.state.set({ isLoading: false, error: null, data });
  }
}

describe('DashboardLayoutComponent', () => {
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let component: DashboardLayoutComponent;
  let organizationsService: FakeOrganizationsService;
  let authService: FakeAuthService;
  let router: Router;

  const orgA: OrganizationResponse = {
    id: 'org-a',
    name: 'Acme Inc',
    description: '',
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const orgB: OrganizationResponse = {
    id: 'org-b',
    name: 'Beta Corp',
    description: '',
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();
    authService = new FakeAuthService();

    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent, BlankComponent],
      providers: [
        provideRouter([{ path: '**', component: BlankComponent }]),
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: AuthService, useValue: authService },
      ],
    })
      .overrideComponent(DashboardLayoutComponent, {
        set: {
          imports: [
            RouterLink,
            RouterLinkActive,
            RouterOutlet,
            LoadingStateComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('renders all nav groups', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Owner');
    expect(text).toContain('Participant');
    expect(text).toContain('Account');
  });

  it('renders owner and participant base links', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-link')
    ).map((el) => (el as HTMLElement).textContent?.trim());

    expect(links).toContain('Dashboard');
    expect(links).toContain('Teams');
    expect(links).toContain('My Learning');
    expect(links).toContain('Assessments');
    expect(links).toContain('Credentials');
    expect(links).toContain('Profile');
  });

  it('should render user name and logout button', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alice Doe');
    expect(fixture.nativeElement.querySelector('.logout-button')?.textContent?.trim()).toBe('Log out');
  });

  it('should call auth logout when logout button is clicked', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement;
    logoutButton.click();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('shows loading state in the organization switcher', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading teams…');
  });

  it('shows error state in the organization switcher', () => {
    organizationsService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Failed to load');
  });

  it('renders organization options and defaults to the first one', () => {
    organizationsService.setData({
      items: [orgA, orgB],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    });
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('#org-select option')
    ).map((el) => (el as HTMLOptionElement).textContent?.trim());

    expect(options).toContain('Acme Inc');
    expect(options).toContain('Beta Corp');
    expect(component.selectedOrganizationId()).toBe(orgA.id);
  });

  it('switches organization and navigates to it', () => {
    organizationsService.setData({
      items: [orgA, orgB],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    });
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector(
      '#org-select'
    ) as HTMLSelectElement;
    select.value = orgB.id;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.selectedOrganizationId()).toBe(orgB.id);
    expect(router.navigate).toHaveBeenCalledWith(['/organizations', orgB.id]);
  });

  it('toggles the mobile sidebar', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('.dashboard-sidebar');
    const toggle = fixture.nativeElement.querySelector('.menu-button');

    expect(sidebar.classList.contains('open')).toBe(false);

    toggle.click();
    fixture.detectChanges();
    expect(sidebar.classList.contains('open')).toBe(true);

    toggle.click();
    fixture.detectChanges();
    expect(sidebar.classList.contains('open')).toBe(false);
  });

  it('closes the mobile sidebar when the backdrop is clicked', () => {
    organizationsService.setLoading();
    fixture.detectChanges();

    component.toggleMobile();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.sidebar-backdrop');
    backdrop.click();
    fixture.detectChanges();

    expect(component.mobileOpen()).toBe(false);
  });

  it('adds contextual owner links when viewing an organization', async () => {
    organizationsService.setData({
      items: [orgA, orgB],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    });

    await router.navigateByUrl('/organizations/org-a');
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-link')
    ).map((el) => (el as HTMLElement).textContent?.trim());

    expect(links).toContain('Overview');
    expect(links).toContain('Team members');
    expect(links).toContain('Credentials');
    expect(links).toContain('Settings');
  });
});
