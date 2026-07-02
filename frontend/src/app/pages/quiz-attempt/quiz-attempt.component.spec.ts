import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { QuizAttemptComponent } from './quiz-attempt.component';
import { QuizzesService } from '../../services/quizzes.service';
import { AttemptsService } from '../../services/attempts.service';
import { Quiz } from '../../core/models/quiz.model';
import {
  AttemptResultResponse,
  StartAttemptResponse,
} from '../../core/models/attempt.model';

interface QueryState {
  isPending: boolean;
  isError: boolean;
  data: Quiz | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

class FakeQuizzesService {
  private queryState = signal<QueryState>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn(),
  });

  getQuizQuery() {
    const state = this.queryState();
    return {
      isPending: () => state.isPending,
      isError: () => state.isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: vi.fn(),
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: vi.fn(),
    });
  }

  setData(data: Quiz) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
    });
  }
}

class FakeAttemptsService {
  startMutate = vi.fn();
  submitMutate = vi.fn();

  readonly startMutation = {
    isPending: () => false,
    mutate: this.startMutate,
  } as unknown as ReturnType<typeof vi.fn>;

  readonly submitMutation = {
    isPending: () => false,
    mutate: this.submitMutate,
  } as unknown as ReturnType<typeof vi.fn>;
}

describe('QuizAttemptComponent', () => {
  let component: QuizAttemptComponent;
  let fixture: ComponentFixture<QuizAttemptComponent>;
  let quizzesService: FakeQuizzesService;
  let attemptsService: FakeAttemptsService;
  let router: Router;

  const quiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Sample Quiz',
    description: 'A sample quiz for testing.',
    passingScore: 70,
    durationMinutes: 10,
    maxAttempts: 3,
    certificateEnabled: true,
    certificateIssueMode: 'AUTO',
    visibleToParticipants: true,
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-01-01T00:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'First question',
        type: 'SINGLE_CHOICE',
        points: 1,
        position: 0,
        options: [
          { id: 'q1-a', text: 'Option A', isCorrect: true, position: 0 },
          { id: 'q1-b', text: 'Option B', isCorrect: false, position: 1 },
        ],
      },
      {
        id: 'q2',
        text: 'Second question',
        type: 'SINGLE_CHOICE',
        points: 2,
        position: 1,
        options: [
          { id: 'q2-a', text: 'Option A', isCorrect: false, position: 0 },
          { id: 'q2-b', text: 'Option B', isCorrect: true, position: 1 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();
    attemptsService = new FakeAttemptsService();

    await TestBed.configureTestingModule({
      imports: [QuizAttemptComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        { provide: AttemptsService, useValue: attemptsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'quiz-1' } as unknown as ParamMap),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizAttemptComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    quizzesService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while fetching quiz', () => {
    quizzesService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading quiz...');
  });

  it('should show error state with retry', () => {
    quizzesService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    component.retryLoad();
    expect(quizzesService.getQuizQuery().refetch).toHaveBeenCalled();
  });

  it('should start an attempt when quiz loads', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(attemptsService.startMutate).toHaveBeenCalledWith(
      expect.objectContaining({ quizId: 'quiz-1' }),
      expect.any(Object)
    );
  });

  it('should display quiz title before attempt starts', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sample Quiz');
    expect(fixture.nativeElement.textContent).toContain('Remaining');
  });

  it('should store attemptId and start timer when start succeeds', fakeAsync(() => {
    quizzesService.setData(quiz);
    attemptsService.startMutate.mockImplementation((_, options) => {
      const response: StartAttemptResponse = {
        attemptId: 'attempt-1',
        quizId: 'quiz-1',
        attemptNumber: 1,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      };
      options?.onSuccess?.(response);
    });

    fixture.detectChanges();
    expect(component.attemptId()).toBe('attempt-1');
    expect(component.timeRemainingMs()).toBeGreaterThan(0);

    tick(1000);
    fixture.detectChanges();
  }));

  it('should track selected answers', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.selectOption('q1', 'q1-a');
    expect(component.getSelectedOption('q1')).toBe('q1-a');
    expect(component.isAnswered('q1')).toBe(true);
  });

  it('should navigate between questions', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(component.currentQuestionIndex()).toBe(0);
    component.next();
    expect(component.currentQuestionIndex()).toBe(1);
    component.previous();
    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('should open submit modal on last question next', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.goToQuestion(1);
    component.next();
    expect(component.showSubmitModal()).toBe(true);
  });

  it('should submit answers and navigate to result', () => {
    quizzesService.setData(quiz);
    attemptsService.startMutate.mockImplementation((_, options) => {
      options?.onSuccess?.({
        attemptId: 'attempt-1',
        quizId: 'quiz-1',
        attemptNumber: 1,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      });
    });
    fixture.detectChanges();

    component.selectOption('q1', 'q1-a');
    attemptsService.submitMutate.mockImplementation((_, options) => {
      const result: AttemptResultResponse = {
        attemptId: 'attempt-1',
        totalPoints: 3,
        earnedPoints: 1,
        scorePercentage: 33.33,
        passed: false,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        certificateIssued: false,
        certificateId: null,
      };
      options?.onSuccess?.(result);
    });

    component.confirmSubmit();
    expect(attemptsService.submitMutate).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([
      '/attempts',
      'attempt-1',
      'result',
    ]);
  });

  it('should mark questions as answered in navigator', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.selectOption('q1', 'q1-a');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.navigator-item');
    expect(buttons[0].classList).toContain('answered');
    expect(buttons[1].classList).not.toContain('answered');
  });
});
