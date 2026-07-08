import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramsComponent } from './programs.component';
import { ProgramsService } from '../../services/programs.service';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramResponse } from '../../core/models/program.model';
import { OrganizationResponse } from '../../core/models/organization.model';
import { PageResponse } from '../../core/api/api-response.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: PageResponse<T> | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

function createQueryState<T>(): QueryState<T> {
  return {
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn(),
  };
}

class FakeProgramsService {
  readonly listParams = signal<{ organizationId: string | null; page: number; size: number }>({
    organizationId: null,
    page: 0,
    size: 10,
  });

  private readonly queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());

  readonly programsQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
  };

  get refetchSpy() {
    return this.queryState().refetch;
  }

  setPending() {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: PageResponse<ProgramResponse>) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), data, refetch: this.queryState().refetch });
  }
}

class FakeOrganizationsService {
  readonly listParams = signal({ page: 0, size: 10 });

  private readonly queryState = signal<QueryState<OrganizationResponse>>(createQueryState<OrganizationResponse>());

  readonly organizationsQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
  };

  get refetchSpy() {
    return this.queryState().refetch;
  }

  setPending() {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: PageResponse<OrganizationResponse>) {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), data, refetch: this.queryState().refetch });
  }
}

describe('ProgramsComponent', () => {
  let component: ProgramsComponent;
  let fixture: ComponentFixture<ProgramsComponent>;
  let programsService: FakeProgramsService;
  let organizationsService: FakeOrganizationsService;
  let router: Router;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Git Fundamentals',
    description: 'Learn Git',
    coverImageUrl: null,
    status: 'PUBLISHED',
    isPublished: true,
    startDate: null,
    endDate: null,
    createdAt: '2026-07-01T10:00:00Z',
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    organizationsService = new FakeOrganizationsService();

    await TestBed.configureTestingModule({
      imports: [ProgramsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    organizationsService.setPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show loading state while organizations are pending', () => {
    organizationsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading organizations...');
  });

  it('should show error state when organizations query fails and allow retry', () => {
    organizationsService.setError(new Error('Organizations failed'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Something went wrong');
    expect(text).toContain('Organizations failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(organizationsService.refetchSpy).toHaveBeenCalled();
  });

  it('should populate organization filter', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const options = Array.from<HTMLOptionElement>(
      fixture.nativeElement.querySelectorAll('option')
    );
    expect(options.map((o) => o.textContent)).toContain('Acme Inc');
  });

  it('should update list params when organization filter changes', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    component.onOrganizationChange('org-1');

    expect(programsService.listParams()).toEqual({ organizationId: 'org-1', page: 0, size: 10 });
  });

  it('should show loading state while programs are pending', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading programs...');
  });

  it('should show error state when programs query fails and allow retry', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setError(new Error('Programs failed'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Something went wrong');
    expect(text).toContain('Programs failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(programsService.refetchSpy).toHaveBeenCalled();
  });

  it('should show empty state when there are no programs', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No programs yet');
  });

  it('should render program rows with title, organization name, status badge, and link', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setData({
      items: [program],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Git Fundamentals');
    expect(text).toContain('Acme Inc');
    expect(text).toContain('PUBLISHED');

    const link = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    ).find((a) => a.textContent?.includes('Git Fundamentals'));
    expect(link?.getAttribute('href')).toBe('/programs/program-1');
  });

  it('should not render pagination when there is only one page', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setData({
      items: [program],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Page 0 of 1');
  });

  it('should render pagination when there are multiple pages', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setData({
      items: [program],
      page: 0,
      size: 10,
      totalElements: 11,
      totalPages: 2,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Page 0 of 2');
  });

  it('should update list params on page change', () => {
    organizationsService.setData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    component.onOrganizationChange('org-1');
    programsService.setData({
      items: [program],
      page: 0,
      size: 10,
      totalElements: 11,
      totalPages: 2,
    });
    fixture.detectChanges();

    component.onPageChange(1);

    expect(programsService.listParams()).toEqual({ organizationId: 'org-1', page: 1, size: 10 });
  });
});
