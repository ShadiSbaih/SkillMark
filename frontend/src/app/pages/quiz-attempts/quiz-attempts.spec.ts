import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizAttempts } from './quiz-attempts';
import { AttemptsService } from '../../services/attempts.service';
import { QuizzesService } from '../../services/quizzes.service';
import { Quiz } from '../../core/models/quiz.model';
import { AttemptResponse } from '../../core/models/attempt.model';
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

class FakeQuizzesService {
  private queryState = signal<QueryState<Quiz>>(createQueryState<Quiz>());

  get refetchSpy() {
    return this.queryState().refetch;
  }

  getQuizQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<Quiz>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<Quiz>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: Quiz) {
    this.queryState.set({ ...createQueryState<Quiz>(), data, refetch: this.queryState().refetch });
  }
}

class FakeAttemptsService {
  private queryState = signal<QueryState<PageResponse<AttemptResponse>>>(createQueryState<PageResponse<AttemptResponse>>());

  get refetchSpy() {
    return this.queryState().refetch;
  }

  getQuizAttemptsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<AttemptResponse>>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<AttemptResponse>>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: PageResponse<AttemptResponse>) {
    this.queryState.set({ ...createQueryState<PageResponse<AttemptResponse>>(), data, refetch: this.queryState().refetch });
  }
}

describe('QuizAttempts', () => {
  let component: QuizAttempts;
  let fixture: ComponentFixture<QuizAttempts>;
  let quizzesService: FakeQuizzesService;
  let attemptsService: FakeAttemptsService;
  let router: Router;

  const quiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Git Basics Quiz',
    description: 'Test your Git knowledge',
    instructions: 'Read carefully',
    passingScore: 70,
    durationMinutes: 30,
    maxAttempts: 2,
    certificateEnabled: true,
    certificateIssueMode: 'AUTO',
    visibleToParticipants: true,
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-01-01T00:00:00Z',
    questions: [],
  };

  const attemptsPage: PageResponse<AttemptResponse> = {
    items: [
      {
        attemptId: 'attempt-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        attemptNumber: 1,
        expiresAt: '2026-01-01T01:00:00Z',
        totalPoints: 100,
        earnedPoints: 85,
        scorePercentage: 85,
        passed: true,
        status: 'SUBMITTED',
        startedAt: '2026-01-01T00:00:00Z',
        submittedAt: '2026-01-01T00:30:00Z',
        certificateIssued: true,
        certificateId: 'cert-1',
      },
      {
        attemptId: 'attempt-2',
        quizId: 'quiz-1',
        userId: 'user-2',
        attemptNumber: 2,
        expiresAt: '2026-01-01T01:00:00Z',
        totalPoints: 100,
        earnedPoints: 0,
        scorePercentage: 0,
        passed: false,
        status: 'IN_PROGRESS',
        startedAt: '2026-01-01T00:00:00Z',
        submittedAt: null,
        certificateIssued: false,
        certificateId: null,
      },
    ],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();
    attemptsService = new FakeAttemptsService();

    await TestBed.configureTestingModule({
      imports: [QuizAttempts],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        { provide: AttemptsService, useValue: attemptsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'quiz-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizAttempts);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while quiz is pending', () => {
    quizzesService.setPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading quiz');
  });

  it('should show error state with retry when quiz query fails', () => {
    quizzesService.setError(new Error('Quiz failed'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Quiz failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(quizzesService.refetchSpy).toHaveBeenCalled();
  });

  it('should display page title with quiz title and breadcrumb', () => {
    quizzesService.setData(quiz);
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Attempts: Git Basics Quiz');
    expect(fixture.nativeElement.textContent).toContain('Programs');
    expect(fixture.nativeElement.textContent).toContain('Quiz');
    expect(fixture.nativeElement.textContent).toContain('Attempts');
  });

  it('should render attempts table with required columns', () => {
    quizzesService.setData(quiz);
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers[0].textContent).toContain('Attempt #');
    expect(headers[1].textContent).toContain('Participant');
    expect(headers[2].textContent).toContain('Score');
    expect(headers[3].textContent).toContain('Status');
    expect(headers[4].textContent).toContain('Submitted');
  });

  it('should link submitted attempt number to result page', () => {
    quizzesService.setData(quiz);
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[href*="/attempts/"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toContain('/attempts/attempt-1/result');
  });

  it('should not link in-progress attempt number', () => {
    quizzesService.setData(quiz);
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[1].textContent).toContain('2');
    expect(rows[1].querySelector('a')).toBeNull();
  });

  it('should show loading state while attempts are pending', () => {
    quizzesService.setData(quiz);
    attemptsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading attempts');
  });

  it('should show error state with retry when attempts query fails', () => {
    quizzesService.setData(quiz);
    attemptsService.setError(new Error('Attempts failed'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Attempts failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(attemptsService.refetchSpy).toHaveBeenCalled();
  });

  it('should show empty state when no attempts exist', () => {
    quizzesService.setData(quiz);
    attemptsService.setData({ items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No attempts yet');
  });

  it('should compute pagination correctly', () => {
    quizzesService.setData(quiz);
    attemptsService.setData({ ...attemptsPage, totalElements: 25, totalPages: 3 });
    fixture.detectChanges();

    expect(component.totalPages()).toBe(3);
    expect(component.hasPrevious()).toBe(false);
    expect(component.hasNext()).toBe(true);
  });

  it('should navigate back to quiz', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1']);
  });

  it('should change page', () => {
    quizzesService.setData(quiz);
    attemptsService.setData({ ...attemptsPage, totalElements: 25, totalPages: 3 });
    fixture.detectChanges();

    component.setPage(1);
    expect(component.page()).toBe(1);
    expect(component.hasPrevious()).toBe(true);
  });
});
