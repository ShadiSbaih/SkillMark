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
import { StatsService } from '../../services/stats.service';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramResponse } from '../../core/models/program.model';
import { OrganizationResponse } from '../../core/models/organization.model';
import { PageResponse } from '../../core/api/api-response.model';
import { Quiz } from '../../core/models/quiz.model';
import { ResourceResponse } from '../../core/models/resource.model';

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

class FakeOrganizationsService {
  private queryState = signal<QueryState<OrganizationResponse>>(createQueryState<OrganizationResponse>());

  getOrganizationQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: vi.fn(),
    };
  }

  setData(data: OrganizationResponse) {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), data });
  }
}

class FakeQuizzesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 10,
  });

  private queryState = signal<QueryState<PageResponse<Quiz>>>(createQueryState<PageResponse<Quiz>>());

  readonly quizzesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };

  setData(items: Quiz[]) {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), data: { items, page: 0, totalElements: items.length, size: 10, totalPages: 1 } });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), isPending: true });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), isError: true, error });
  }
}

class FakeResourcesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 50,
  });

  private queryState = signal<QueryState<PageResponse<ResourceResponse>>>(createQueryState<PageResponse<ResourceResponse>>());

  readonly resourcesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };

  setData(items: ResourceResponse[]) {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), data: { items, page: 0, totalElements: items.length, size: 50, totalPages: 1 } });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), isPending: true });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), isError: true, error });
  }
}

class FakeStatsService {
  private queryState = signal<QueryState<{ resourcesCount: number; quizzesCount: number }>>(
    createQueryState<{ resourcesCount: number; quizzesCount: number }>()
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

  setData(data: { resourcesCount: number; quizzesCount: number }) {
    this.queryState.set({ ...this.queryState(), data });
  }
}

describe('ProgramOverviewComponent', () => {
  let component: ProgramOverviewComponent;
  let fixture: ComponentFixture<ProgramOverviewComponent>;
  let programsService: FakeProgramsService;
  let organizationsService: FakeOrganizationsService;
  let resourcesService: FakeResourcesService;
  let quizzesService: FakeQuizzesService;
  let statsService: FakeStatsService;
  let router: Router;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    description: null,
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Git Fundamentals',
    description: 'Learn the basics of Git.',
    coverImageUrl: null,
    status: 'PUBLISHED',
    isPublished: true,
    startDate: null,
    endDate: null,
    createdAt: '2026-01-15T10:00:00Z',
  };

  const resource: ResourceResponse = {
    id: 'resource-1',
    programId: 'program-1',
    title: 'Git Cheat Sheet',
    description: null,
    type: 'LINK',
    url: 'https://example.com/git',
    storageProvider: null,
    objectKey: null,
    visibleToParticipants: true,
    status: 'ACTIVE',
    position: 0,
    createdAt: '2026-01-15T10:00:00Z',
  };

  const quiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Git Basics Quiz',
    description: 'Test your Git knowledge.',
    passingScore: 70,
    durationMinutes: 15,
    maxAttempts: 3,
    certificateEnabled: false,
    certificateIssueMode: 'NONE',
    visibleToParticipants: true,
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-01-15T10:00:00Z',
    questions: [],
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    organizationsService = new FakeOrganizationsService();
    resourcesService = new FakeResourcesService();
    quizzesService = new FakeQuizzesService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [ProgramOverviewComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: QuizzesService, useValue: quizzesService },
        { provide: ResourcesService, useValue: resourcesService },
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

  it('should show loading state while fetching program', () => {
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

  it('should display program title, description, and breadcrumb', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData({ resourcesCount: 3, quizzesCount: 2 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Fundamentals');
    expect(fixture.nativeElement.textContent).toContain('Learn the basics of Git.');
    expect(fixture.nativeElement.textContent).toContain('Acme Corp');
    expect(fixture.nativeElement.textContent).toContain('Organizations');
  });

  it('should display metric counts', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData({ resourcesCount: 3, quizzesCount: 2 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Resources');
    expect(fixture.nativeElement.textContent).toContain('Quizzes');
    expect(fixture.nativeElement.textContent).toContain('3');
    expect(fixture.nativeElement.textContent).toContain('2');
  });

  it('should list resources and quizzes with links', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData({ resourcesCount: 1, quizzesCount: 1 });
    resourcesService.setData([resource]);
    quizzesService.setData([quiz]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Cheat Sheet');
    expect(fixture.nativeElement.textContent).toContain('Git Basics Quiz');

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('should cap resources and quizzes at five items', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    statsService.setData({ resourcesCount: 6, quizzesCount: 6 });
    resourcesService.setData(Array.from({ length: 6 }, (_, i) => ({ ...resource, id: `resource-${i}`, title: `Resource ${i}` })));
    quizzesService.setData(Array.from({ length: 6 }, (_, i) => ({ ...quiz, id: `quiz-${i}`, title: `Quiz ${i}` })));
    fixture.detectChanges();

    expect(component.resources().length).toBe(5);
    expect(component.quizzes().length).toBe(5);
  });

  it('should navigate to settings when settings button is clicked', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.router.navigate(['/programs', 'program-1', 'settings']);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'settings']);
  });

  it('should navigate to learn page when start learning button is clicked', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.router.navigate(['/programs', 'program-1', 'learn']);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'learn']);
  });

  it('should compute quiz subtitle', () => {
    expect(component.quizSubtitle(quiz)).toBe('0 questions · 70% to pass');
  });

  it('should return type icons', () => {
    expect(component.typeIcon('LINK')).toBe('🔗');
    expect(component.typeIcon('FILE')).toBe('📄');
    expect(component.typeIcon('IMAGE')).toBe('🖼️');
    expect(component.typeIcon('VIDEO_LINK')).toBe('🎬');
  });
});
