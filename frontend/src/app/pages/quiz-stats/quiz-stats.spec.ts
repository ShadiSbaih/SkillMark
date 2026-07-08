import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizStats } from './quiz-stats';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { Quiz } from '../../core/models/quiz.model';
import { QuizStatsResponse } from '../../core/models/stats.model';

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

class FakeStatsService {
  private queryState = signal<QueryState<QuizStatsResponse>>(createQueryState<QuizStatsResponse>());

  get refetchSpy() {
    return this.queryState().refetch;
  }

  getQuizStatsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<QuizStatsResponse>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<QuizStatsResponse>(), isError: true, error, refetch: this.queryState().refetch });
  }

  setData(data: QuizStatsResponse) {
    this.queryState.set({ ...createQueryState<QuizStatsResponse>(), data, refetch: this.queryState().refetch });
  }
}

describe('QuizStats', () => {
  let component: QuizStats;
  let fixture: ComponentFixture<QuizStats>;
  let quizzesService: FakeQuizzesService;
  let statsService: FakeStatsService;
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

  const stats: QuizStatsResponse = {
    attemptsCount: 12,
    submittedAttempts: 10,
    averageScore: 82.5,
    highestScore: 100,
    lowestScore: 40,
    passCount: 8,
    failCount: 2,
    passRate: 0.8,
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [QuizStats],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'quiz-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizStats);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    quizzesService.setData(quiz);
    statsService.setData(stats);
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

  it('should display page title and breadcrumb', () => {
    quizzesService.setData(quiz);
    statsService.setData(stats);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Quiz stats');
    expect(fixture.nativeElement.textContent).toContain('Programs');
    expect(fixture.nativeElement.textContent).toContain('Git Basics Quiz');
    expect(fixture.nativeElement.textContent).toContain('Stats');
  });

  it('should show loading state while stats are pending', () => {
    quizzesService.setData(quiz);
    statsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading quiz statistics');
  });

  it('should show error state with retry when stats query fails', () => {
    quizzesService.setData(quiz);
    statsService.setError(new Error('Stats failed'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Stats failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(statsService.refetchSpy).toHaveBeenCalled();
  });

  it('should show empty state when no statistics exist', () => {
    quizzesService.setData(quiz);
    statsService.setData(null as unknown as QuizStatsResponse);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No statistics available');
  });

  it('should display all metric grid values', () => {
    quizzesService.setData(quiz);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Total attempts');
    expect(text).toContain('12');
    expect(text).toContain('Submitted attempts');
    expect(text).toContain('10');
    expect(text).toContain('Pass count');
    expect(text).toContain('8');
    expect(text).toContain('Fail count');
    expect(text).toContain('2');
    expect(text).toContain('Average score');
    expect(text).toContain('82.5%');
    expect(text).toContain('Highest score');
    expect(text).toContain('100%');
    expect(text).toContain('Lowest score');
    expect(text).toContain('40%');
    expect(text).toContain('Pass rate');
    expect(text).toContain('80%');
  });

  it('should compute donut style as percentage', () => {
    quizzesService.setData(quiz);
    statsService.setData(stats);
    fixture.detectChanges();

    expect(component.donutStyle()).toBe('--value: 80');
  });

  it('should navigate back to quiz', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1']);
  });
});
