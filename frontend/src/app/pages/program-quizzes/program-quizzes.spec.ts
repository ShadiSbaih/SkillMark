import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramQuizzes } from './program-quizzes';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { ProgramResponse } from '../../core/models/program.model';
import { Quiz } from '../../core/models/quiz.model';
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
      data: { items, page: 0, totalElements: items.length, size: 10, totalPages: 1 },
    });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), isPending: true });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<Quiz>>(), isError: true, error });
  }
}

describe('ProgramQuizzes', () => {
  let component: ProgramQuizzes;
  let fixture: ComponentFixture<ProgramQuizzes>;
  let programsService: FakeProgramsService;
  let quizzesService: FakeQuizzesService;
  let router: Router;

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
    quizzesService = new FakeQuizzesService();

    await TestBed.configureTestingModule({
      imports: [ProgramQuizzes],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: QuizzesService, useValue: quizzesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramQuizzes);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    programsService.setData(program);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set quizzes list params from route', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(quizzesService.listParams()).toEqual({ programId: 'program-1', page: 0, size: 10 });
  });

  it('should display page title with program title', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(component.pageTitle()).toBe('Quizzes: Git Fundamentals');
    expect(fixture.nativeElement.textContent).toContain('Quizzes: Git Fundamentals');
  });

  it('should show loading state while fetching quizzes', () => {
    programsService.setData(program);
    quizzesService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading quizzes...');
  });

  it('should show error state with retry', () => {
    programsService.setData(program);
    quizzesService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();
    expect(quizzesService.quizzesQuery.refetch).toHaveBeenCalled();
  });

  it('should show empty state when there are no quizzes', () => {
    programsService.setData(program);
    quizzesService.setData([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No quizzes yet');
  });

  it('should list quizzes with title, question count, duration, and status badge', () => {
    programsService.setData(program);
    quizzesService.setData([{ ...quiz, questions: [{ id: 'q-1', text: 'What is Git?', type: 'SINGLE_CHOICE', points: 1, position: 1, options: [] }] }]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Git Basics Quiz');
    expect(text).toContain('Questions:');
    expect(text).toContain('1');
    expect(text).toContain('Duration:');
    expect(text).toContain('15 mins');
    expect(text).toContain('PUBLISHED');
  });

  it('should navigate to quiz overview when a quiz card is clicked', () => {
    programsService.setData(program);
    quizzesService.setData([quiz]);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('app-card');
    card.click();

    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1']);
  });

  it('should navigate to create quiz page when create button is clicked', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.router.navigate(['/programs', 'program-1', 'quizzes', 'new']);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'quizzes', 'new']);
  });

  it('should navigate back to program overview', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1']);
  });
});
