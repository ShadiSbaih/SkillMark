import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramStats } from './program-stats';
import { ProgramsService } from '../../services/programs.service';
import { OrganizationsService } from '../../services/organizations.service';
import { StatsService } from '../../services/stats.service';
import { ProgramResponse } from '../../core/models/program.model';
import { OrganizationResponse } from '../../core/models/organization.model';
import { ProgramStatsResponse } from '../../core/models/stats.model';

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

class FakeProgramsService {
  private queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());

  get refetchSpy() {
    return this.queryState().refetch;
  }

  getProgramQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: ProgramResponse) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), data, refetch: this.queryState().refetch });
  }
}

class FakeOrganizationsService {
  private queryState = signal<QueryState<OrganizationResponse>>(createQueryState<OrganizationResponse>());

  get refetchSpy() {
    return this.queryState().refetch;
  }

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

class FakeStatsService {
  private queryState = signal<QueryState<ProgramStatsResponse>>(createQueryState<ProgramStatsResponse>());

  get refetchSpy() {
    return this.queryState().refetch;
  }

  getProgramStatsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<ProgramStatsResponse>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<ProgramStatsResponse>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: ProgramStatsResponse) {
    this.queryState.set({ ...createQueryState<ProgramStatsResponse>(), data, refetch: this.queryState().refetch });
  }
}

describe('ProgramStats', () => {
  let component: ProgramStats;
  let fixture: ComponentFixture<ProgramStats>;
  let programsService: FakeProgramsService;
  let organizationsService: FakeOrganizationsService;
  let statsService: FakeStatsService;

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

  const stats: ProgramStatsResponse = {
    totalEnrollments: 10,
    activeEnrollments: 8,
    resourcesCount: 3,
    quizzesCount: 2,
    attemptsCount: 5,
    passedParticipants: 4,
    certificatesIssued: 2,
    averageScore: 82.5,
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    organizationsService = new FakeOrganizationsService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [ProgramStats],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramStats);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    programsService.setPending();
    organizationsService.setPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show loading state while program and organization are pending', () => {
    programsService.setPending();
    organizationsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading program...');
  });

  it('should show error state with retry when program query fails', () => {
    programsService.setError(new Error('Program failed'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Program failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(programsService.refetchSpy).toHaveBeenCalled();
  });

  it('should show error state with retry when organization query fails', () => {
    programsService.setData(program);
    organizationsService.setError(new Error('Organization failed'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Organization failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(organizationsService.refetchSpy).toHaveBeenCalled();
  });

  it('should display program title and breadcrumb', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Program stats');
    expect(fixture.nativeElement.textContent).toContain('Git Fundamentals');
    expect(fixture.nativeElement.textContent).toContain('Acme Inc');
  });

  it('should display stats metrics', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Total enrollments');
    expect(text).toContain('10');
    expect(text).toContain('Active enrollments');
    expect(text).toContain('8');
    expect(text).toContain('Resources');
    expect(text).toContain('3');
    expect(text).toContain('Quizzes');
    expect(text).toContain('2');
    expect(text).toContain('Attempts');
    expect(text).toContain('5');
    expect(text).toContain('Passed participants');
    expect(text).toContain('4');
    expect(text).toContain('Certificates issued');
    expect(text).toContain('2');
    expect(text).toContain('Average score');
    expect(text).toContain('82.5%');
  });

  it('should compute pass rate as a rounded percentage', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    expect(component.passRate()).toBe(80);
  });

  it('should compute average score rounded to two decimals', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    expect(component.averageScore()).toBe(82.5);
  });

  it('should handle zero attempts when computing pass rate', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData({ ...stats, attemptsCount: 0 });
    fixture.detectChanges();

    expect(component.passRate()).toBe(0);
  });
});
