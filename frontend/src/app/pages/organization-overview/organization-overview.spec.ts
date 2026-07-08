import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationOverview } from './organization-overview';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramsService } from '../../services/programs.service';
import { StatsService } from '../../services/stats.service';
import { OrganizationResponse } from '../../core/models/organization.model';
import { ProgramResponse } from '../../core/models/program.model';
import { OrganizationStatsResponse } from '../../core/models/stats.model';
import { PageResponse } from '../../core/api/api-response.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: T | null;
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

class FakeOrganizationsService {
  private readonly queryState = signal<QueryState<OrganizationResponse>>(createQueryState<OrganizationResponse>());

  getOrganizationQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: OrganizationResponse) {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), data, refetch: this.queryState().refetch });
  }
}

class FakeProgramsService {
  readonly listParams = signal<{ organizationId: string | null; page: number; size: number }>({
    organizationId: null,
    page: 0,
    size: 10,
  });

  private readonly queryState = signal<QueryState<PageResponse<ProgramResponse>>>(createQueryState<PageResponse<ProgramResponse>>());

  readonly programsQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };

  setData(items: ProgramResponse[]) {
    this.queryState.set({
      ...createQueryState<PageResponse<ProgramResponse>>(),
      data: { items, totalElements: items.length, totalPages: 1, page: 0, size: items.length },
      refetch: this.queryState().refetch,
    });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<ProgramResponse>>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<ProgramResponse>>(), isError: true, error, refetch: this.queryState().refetch });
  }
}

class FakeStatsService {
  private readonly queryState = signal<QueryState<OrganizationStatsResponse>>(createQueryState<OrganizationStatsResponse>());

  getOrganizationStatsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setData(data: OrganizationStatsResponse) {
    this.queryState.set({ ...createQueryState<OrganizationStatsResponse>(), data, refetch: this.queryState().refetch });
  }
}

describe('OrganizationOverview', () => {
  let component: OrganizationOverview;
  let fixture: ComponentFixture<OrganizationOverview>;
  let organizationsService: FakeOrganizationsService;
  let programsService: FakeProgramsService;
  let statsService: FakeStatsService;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    slug: 'acme-inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    createdBy: 'Owner User',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

  const programs: ProgramResponse[] = [
    {
      id: 'prog-1',
      organizationId: 'org-1',
      title: 'Program One',
      description: 'First program',
      coverImageUrl: null,
      status: 'PUBLISHED',
      isPublished: true,
      startDate: null,
      endDate: null,
      createdAt: '2026-07-02T10:00:00Z',
    },
    {
      id: 'prog-2',
      organizationId: 'org-1',
      title: 'Program Two',
      description: null,
      coverImageUrl: null,
      status: 'DRAFT',
      isPublished: false,
      startDate: null,
      endDate: null,
      createdAt: '2026-07-03T10:00:00Z',
    },
  ];

  const stats: OrganizationStatsResponse = {
    totalPrograms: 2,
    totalMembers: 5,
    totalEnrolledParticipants: 12,
    totalQuizzes: 3,
    totalAttempts: 20,
    totalCertificates: 4,
    averageScore: 85,
    passRate: 0.8,
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();
    programsService = new FakeProgramsService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [OrganizationOverview],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: ProgramsService, useValue: programsService },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'org-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationOverview);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while organization is pending', () => {
    organizationsService.setPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading organization...');
  });

  it('should show error state with retry', () => {
    organizationsService.setError(new Error('Network error'));
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Something went wrong');
    expect(text).toContain('Network error');
  });

  it('should display organization name, description, and breadcrumb', () => {
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Inc');
    expect(text).toContain('A sample organization');
    expect(text).toContain('Organizations');
  });

  it('should display metric cards from stats', () => {
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Members');
    expect(text).toContain('5');
    expect(text).toContain('Programs');
    expect(text).toContain('2');
    expect(text).toContain('Certificates');
    expect(text).toContain('4');
  });

  it('should display program list', () => {
    organizationsService.setData(organization);
    programsService.setData(programs);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Program One');
    expect(text).toContain('Program Two');
    expect(text).toContain('View all');
  });

  it('should display details', () => {
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('acme-inc');
    expect(text).toContain('Owner User');
  });

  it('should navigate to settings when settings button is clicked', () => {
    organizationsService.setData(organization);
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(component.router, 'navigate');
    const buttons = fixture.nativeElement.querySelectorAll('app-button button');
    const settingsButton = Array.from(buttons).find((b) => (b as HTMLElement).textContent?.includes('Settings'));
    (settingsButton as HTMLElement)?.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/organizations', 'org-1', 'settings']);
  });
});
