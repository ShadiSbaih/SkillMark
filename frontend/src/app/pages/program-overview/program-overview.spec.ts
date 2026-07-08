import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramOverview } from './program-overview';
import { ProgramsService } from '../../services/programs.service';
import { ResourcesService } from '../../services/resources.service';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { ProgramResponse } from '../../core/models/program.model';
import { ResourceResponse } from '../../core/models/resource.model';
import { Quiz } from '../../core/models/quiz.model';
import { ProgramStatsResponse } from '../../core/models/stats.model';
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
  private readonly queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());

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

class FakeResourcesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 50,
  });

  private readonly queryState = signal<QueryState<PageResponse<ResourceResponse>>>(createQueryState<PageResponse<ResourceResponse>>());

  readonly resourcesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };

  setData(items: ResourceResponse[]) {
    this.queryState.set({
      ...createQueryState<PageResponse<ResourceResponse>>(),
      data: { items, totalElements: items.length, totalPages: 1, page: 0, size: items.length },
      refetch: this.queryState().refetch,
    });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), isError: true, error, refetch: this.queryState().refetch });
  }
}

class FakeQuizzesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 10,
  });

  private readonly queryState = signal<QueryState<PageResponse<Quiz>>>(createQueryState<PageResponse<Quiz>>());

  readonly quizzesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };

  setData(items: Quiz[]) {
    this.queryState.set({
      ...createQueryState<PageResponse<Quiz>>(),
      data: { items, totalElements: items.length, totalPages: 1, page: 0, size: items.length },
      refetch: this.queryState().refetch,
    });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), isError: true, error, refetch: this.queryState().refetch });
  }
}

class FakeStatsService {
  private readonly queryState = signal<QueryState<ProgramStatsResponse>>(createQueryState<ProgramStatsResponse>());

  getProgramStatsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setData(data: ProgramStatsResponse) {
    this.queryState.set({ ...createQueryState<ProgramStatsResponse>(), data, refetch: this.queryState().refetch });
  }
}

describe('ProgramOverview', () => {
  let component: ProgramOverview;
  let fixture: ComponentFixture<ProgramOverview>;
  let programsService: FakeProgramsService;
  let resourcesService: FakeResourcesService;
  let quizzesService: FakeQuizzesService;
  let statsService: FakeStatsService;

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

  const resource: ResourceResponse = {
    id: 'res-1',
    programId: 'program-1',
    title: 'Git Cheat Sheet',
    description: null,
    type: 'LINK',
    url: 'https://git-scm.com',
    storageProvider: null,
    objectKey: null,
    visibleToParticipants: true,
    status: 'ACTIVE',
    position: 0,
    createdAt: '2026-07-01T10:00:00Z',
  };

  const quiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Git Basics',
    description: 'Basic Git questions',
    instructions: '',
    passingScore: 70,
    durationMinutes: 10,
    maxAttempts: 3,
    certificateEnabled: false,
    certificateIssueMode: 'NONE',
    visibleToParticipants: true,
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-07-01T10:00:00Z',
    questions: [],
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    resourcesService = new FakeResourcesService();
    quizzesService = new FakeQuizzesService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [ProgramOverview],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: ResourcesService, useValue: resourcesService },
        { provide: QuizzesService, useValue: quizzesService },
        { provide: StatsService, useValue: statsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramOverview);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('programId', 'program-1');
  });

  it('should create', () => {
    programsService.setPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should set list params from the program id input', () => {
    programsService.setPending();
    fixture.detectChanges();

    expect(resourcesService.listParams().programId).toBe('program-1');
    expect(quizzesService.listParams().programId).toBe('program-1');
  });

  it('should show loading state while program is pending', () => {
    programsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading program...');
  });

  it('should show error state when program fails to load', () => {
    programsService.setError(new Error('Network error'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Something went wrong');
    expect(text).toContain('Network error');
  });

  it('should render program title, resources and quizzes', () => {
    programsService.setData(program);
    resourcesService.setData([resource]);
    quizzesService.setData([quiz]);
    statsService.setData({
      totalEnrollments: 5,
      activeEnrollments: 4,
      resourcesCount: 1,
      quizzesCount: 1,
      attemptsCount: 2,
      passedParticipants: 1,
      certificatesIssued: 1,
      averageScore: 80,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Git Fundamentals');
    expect(text).toContain('Git Cheat Sheet');
    expect(text).toContain('Git Basics');
    expect(text).toContain('Resources');
    expect(text).toContain('Quizzes');
  });
});
