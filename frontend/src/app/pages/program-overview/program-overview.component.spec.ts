import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramOverviewComponent } from './program-overview.component';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { ResourcesService } from '../../services/resources.service';
import { EnrollmentsService } from '../../services/enrollments.service';
import { StatsService } from '../../services/stats.service';
import { ProgramResponse } from '../../core/models/program.model';
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

class FakeProgramsService {
  private readonly _refetchSpy = vi.fn();
  private queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());

  readonly publishMutation = {
    isPending: () => false,
    mutate: vi.fn(),
  };

  readonly archiveMutation = {
    isPending: () => false,
    mutate: vi.fn(),
  };

  readonly deleteMutation = {
    isPending: () => false,
    mutate: vi.fn(),
  };

  get refetchSpy() {
    return this._refetchSpy;
  }

  getProgramQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this._refetchSpy,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isPending: true, refetch: this._refetchSpy });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isError: true, error, refetch: this._refetchSpy });
  }

  setData(data: ProgramResponse) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), data, refetch: this._refetchSpy });
  }
}

class FakeQuizzesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 10,
  });

  private queryState = signal<QueryState<PageResponse<unknown>>>(createQueryState<PageResponse<unknown>>());

  readonly quizzesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };
}

class FakeResourcesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 50,
  });

  private queryState = signal<QueryState<PageResponse<unknown>>>(createQueryState<PageResponse<unknown>>());

  readonly resourcesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };
}

class FakeEnrollmentsService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 10,
  });
}

class FakeStatsService {
  private queryState = signal<QueryState<{ totalEnrollments: number; resourcesCount: number; quizzesCount: number }>>(
    createQueryState<{ totalEnrollments: number; resourcesCount: number; quizzesCount: number }>()
  );

  getProgramStatsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: vi.fn(),
    };
  }

  setData(data: { totalEnrollments: number; resourcesCount: number; quizzesCount: number }) {
    this.queryState.set({ ...this.queryState(), data });
  }
}

describe('ProgramOverviewComponent', () => {
  let component: ProgramOverviewComponent;
  let fixture: ComponentFixture<ProgramOverviewComponent>;
  let programsService: FakeProgramsService;
  let statsService: FakeStatsService;
  let router: Router;

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Git Fundamentals',
    description: 'Learn the basics of Git.',
    coverImageUrl: null,
    status: 'DRAFT',
    isPublished: false,
    startDate: null,
    endDate: null,
    createdAt: '2026-01-15T10:00:00Z',
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [ProgramOverviewComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: QuizzesService, useValue: new FakeQuizzesService() },
        { provide: ResourcesService, useValue: new FakeResourcesService() },
        { provide: EnrollmentsService, useValue: new FakeEnrollmentsService() },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramOverviewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    programsService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while fetching', () => {
    programsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading program...');
  });

  it('should show error state with retry', () => {
    programsService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();
    expect(programsService.refetchSpy).toHaveBeenCalled();
  });

  it('should display program details and stats', () => {
    programsService.setData(program);
    statsService.setData({ totalEnrollments: 5, resourcesCount: 3, quizzesCount: 2 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Fundamentals');
    expect(fixture.nativeElement.textContent).toContain('Learn the basics of Git.');
    expect(fixture.nativeElement.textContent).toContain('DRAFT');
    expect(fixture.nativeElement.textContent).toContain('Quizzes');
    expect(fixture.nativeElement.textContent).toContain('Enrollments');
  });

  it('should enable publish when status is DRAFT', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(component.canPublish()).toBe(true);
    expect(component.canArchive()).toBe(true);
  });

  it('should disable publish when status is PUBLISHED', () => {
    programsService.setData({ ...program, status: 'PUBLISHED', isPublished: true });
    fixture.detectChanges();

    expect(component.canPublish()).toBe(false);
    expect(component.canArchive()).toBe(true);
  });

  it('should disable archive when status is ARCHIVED', () => {
    programsService.setData({ ...program, status: 'ARCHIVED' });
    fixture.detectChanges();

    expect(component.canPublish()).toBe(false);
    expect(component.canArchive()).toBe(false);
  });

  it('should call publish mutation', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.publish();
    expect(programsService.publishMutation.mutate).toHaveBeenCalledWith('program-1', expect.any(Object));
  });

  it('should call archive mutation', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.archive();
    expect(programsService.archiveMutation.mutate).toHaveBeenCalledWith('program-1', expect.any(Object));
  });

  it('should navigate back', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/organizations']);
  });

  it('should navigate to quick action routes', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.router.navigate(['/programs', 'program-1', 'quizzes']);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'quizzes']);
  });
});
