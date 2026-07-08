import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramLearn } from './program-learn';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { ResourcesService } from '../../services/resources.service';
import { ProgramResponse } from '../../core/models/program.model';
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

  getProgramQuery(_programId: () => string | null) {
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
    this.queryState.set({
      ...createQueryState<PageResponse<ResourceResponse>>(),
      data: { items, page: 0, size: 50, totalElements: items.length, totalPages: 1 },
    });
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
    this.queryState.set({
      ...createQueryState<PageResponse<Quiz>>(),
      data: { items, page: 0, size: 10, totalElements: items.length, totalPages: 1 },
    });
  }
}

describe('ProgramLearn', () => {
  let component: ProgramLearn;
  let fixture: ComponentFixture<ProgramLearn>;
  let programsService: FakeProgramsService;
  let resourcesService: FakeResourcesService;
  let quizzesService: FakeQuizzesService;

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

  const activeResource: ResourceResponse = {
    id: 'resource-1',
    programId: 'program-1',
    title: 'Git Cheat Sheet',
    description: 'A helpful cheat sheet.',
    type: 'LINK',
    url: 'https://example.com/git',
    storageProvider: null,
    objectKey: null,
    visibleToParticipants: true,
    status: 'ACTIVE',
    position: 0,
    createdAt: '2026-01-15T10:00:00Z',
  };

  const hiddenResource: ResourceResponse = {
    ...activeResource,
    id: 'resource-2',
    visibleToParticipants: false,
  };

  const publishedQuiz: Quiz = {
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
    questions: [{ id: 'q1', text: 'What is Git?', type: 'SINGLE_CHOICE', points: 1, position: 0, options: [] }],
  };

  const draftQuiz: Quiz = {
    ...publishedQuiz,
    id: 'quiz-2',
    status: 'DRAFT',
    isPublished: false,
    visibleToParticipants: true,
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    resourcesService = new FakeResourcesService();
    quizzesService = new FakeQuizzesService();

    await TestBed.configureTestingModule({
      imports: [ProgramLearn],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: ResourcesService, useValue: resourcesService },
        { provide: QuizzesService, useValue: quizzesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramLearn);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('programId', 'program-1');
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

  it('should display learn page header with program title', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Learn: Git Fundamentals');
    expect(fixture.nativeElement.textContent).toContain('Resources and quizzes for this program.');
  });

  it('should set list params when programId is provided', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(resourcesService.listParams()).toEqual({ programId: 'program-1', page: 0, size: 50 });
    expect(quizzesService.listParams()).toEqual({ programId: 'program-1', page: 0, size: 10 });
  });

  it('should filter visible resources', () => {
    programsService.setData(program);
    resourcesService.setData([activeResource, hiddenResource]);
    quizzesService.setData([]);
    fixture.detectChanges();

    expect(component.resources().length).toBe(1);
    expect(component.resources()[0].id).toBe('resource-1');
  });

  it('should filter published quizzes', () => {
    programsService.setData(program);
    resourcesService.setData([]);
    quizzesService.setData([publishedQuiz, draftQuiz]);
    fixture.detectChanges();

    expect(component.quizzes().length).toBe(1);
    expect(component.quizzes()[0].id).toBe('quiz-1');
  });

  it('should render resources with open link', () => {
    programsService.setData(program);
    resourcesService.setData([activeResource]);
    quizzesService.setData([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Cheat Sheet');
    expect(fixture.nativeElement.textContent).toContain('A helpful cheat sheet.');

    const link = fixture.nativeElement.querySelector('a.button-secondary');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/git');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('should render empty resource state when no visible resources', () => {
    programsService.setData(program);
    resourcesService.setData([]);
    quizzesService.setData([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No resources available.');
  });

  it('should render quizzes with start link', () => {
    programsService.setData(program);
    resourcesService.setData([]);
    quizzesService.setData([publishedQuiz]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Basics Quiz');
    expect(fixture.nativeElement.textContent).toContain('Duration: 15 min | Passing: 70%');

    const link = fixture.nativeElement.querySelector('a.button-primary');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/quizzes/quiz-1/attempt');
  });

  it('should render empty quiz state when no published quizzes', () => {
    programsService.setData(program);
    resourcesService.setData([]);
    quizzesService.setData([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No quizzes available.');
  });
});
