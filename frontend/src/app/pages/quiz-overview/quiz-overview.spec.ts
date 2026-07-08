import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizOverview } from './quiz-overview';
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

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

class FakeQuizzesService {
  private queryState = signal<QueryState<Quiz>>(createQueryState<Quiz>());
  private readonly _publishPending = signal(false);

  readonly publishMutation = {
    isPending: () => this._publishPending(),
    mutate: vi.fn((_id: string, options?: MutationOptions) => {
      this._publishPending.set(false);
      options?.onSuccess?.();
    }),
  };

  getQuizQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setData(data: Quiz) {
    this.queryState.set({ ...createQueryState<Quiz>(), data, refetch: this.queryState().refetch });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<Quiz>(), isPending: true, refetch: this.queryState().refetch });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<Quiz>(), isError: true, error, refetch: this.queryState().refetch });
  }
}

class FakeStatsService {
  private queryState = signal<QueryState<QuizStatsResponse>>(createQueryState<QuizStatsResponse>());

  getQuizStatsQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: vi.fn(),
    };
  }

  setData(data: QuizStatsResponse) {
    this.queryState.set({ ...createQueryState<QuizStatsResponse>(), data });
  }
}

describe('QuizOverview', () => {
  let component: QuizOverview;
  let fixture: ComponentFixture<QuizOverview>;
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
    isPublished: false,
    status: 'DRAFT',
    createdAt: '2026-01-01T00:00:00Z',
    questions: [
      {
        id: 'q-1',
        text: 'What is Git?',
        type: 'SINGLE_CHOICE',
        points: 10,
        position: 0,
        options: [
          { id: 'o-1', text: 'A version control system', isCorrect: true, position: 0 },
          { id: 'o-2', text: 'A text editor', isCorrect: false, position: 1 },
        ],
      },
      {
        id: 'q-2',
        text: 'What does git commit do?',
        type: 'SINGLE_CHOICE',
        points: 10,
        position: 1,
        options: [
          { id: 'o-3', text: 'Saves changes to local repository', isCorrect: true, position: 0 },
          { id: 'o-4', text: 'Downloads changes', isCorrect: false, position: 1 },
        ],
      },
      {
        id: 'q-3',
        text: 'What is a branch?',
        type: 'SINGLE_CHOICE',
        points: 10,
        position: 2,
        options: [
          { id: 'o-5', text: 'An independent line of development', isCorrect: true, position: 0 },
          { id: 'o-6', text: 'A type of commit', isCorrect: false, position: 1 },
        ],
      },
      {
        id: 'q-4',
        text: 'What is a merge conflict?',
        type: 'SINGLE_CHOICE',
        points: 10,
        position: 3,
        options: [
          { id: 'o-7', text: 'Competing changes in the same file', isCorrect: true, position: 0 },
          { id: 'o-8', text: 'A network error', isCorrect: false, position: 1 },
        ],
      },
      {
        id: 'q-5',
        text: 'What is git push?',
        type: 'SINGLE_CHOICE',
        points: 10,
        position: 4,
        options: [
          { id: 'o-9', text: 'Uploads local commits to remote', isCorrect: true, position: 0 },
          { id: 'o-10', text: 'Creates a new branch', isCorrect: false, position: 1 },
        ],
      },
      {
        id: 'q-6',
        text: 'What is git pull?',
        type: 'SINGLE_CHOICE',
        points: 10,
        position: 5,
        options: [
          { id: 'o-11', text: 'Fetches and merges remote changes', isCorrect: true, position: 0 },
          { id: 'o-12', text: 'Deletes a branch', isCorrect: false, position: 1 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [QuizOverview],
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

    fixture = TestBed.createComponent(QuizOverview);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while pending', () => {
    quizzesService.setPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading quiz overview');
  });

  it('should show error state when query fails', () => {
    quizzesService.setError(new Error('Network error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Network error');
  });

  it('should render quiz title, description, and breadcrumb', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Basics Quiz');
    expect(fixture.nativeElement.textContent).toContain('Test your Git knowledge');
    expect(fixture.nativeElement.textContent).toContain('Programs');
    expect(fixture.nativeElement.textContent).toContain('Quiz');
  });

  it('should render Builder, Settings, and Preview action buttons', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Builder');
    expect(text).toContain('Settings');
    expect(text).toContain('Preview');
  });

  it('should navigate to builder, settings, and preview', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.navigateToBuilder();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1', 'builder']);

    component.navigateToSettings();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1', 'settings']);

    component.navigateToPreview();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1', 'view']);
  });

  it('should display compact metrics', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Status');
    expect(text).toContain('Questions');
    expect(text).toContain('Passing score');
    expect(text).toContain('6');
    expect(text).toContain('70%');
  });

  it('should display stats metrics when available', () => {
    quizzesService.setData(quiz);
    statsService.setData({
      attemptsCount: 12,
      submittedAttempts: 10,
      averageScore: 82.5,
      highestScore: 100,
      lowestScore: 40,
      passCount: 8,
      failCount: 2,
      passRate: 0.8,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Attempts');
    expect(text).toContain('Pass rate');
    expect(text).toContain('Average score');
    expect(text).toContain('12');
    expect(text).toContain('80%');
    expect(text).toContain('82.5%');
  });

  it('should render at most 5 preview questions', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    const questions = fixture.nativeElement.querySelectorAll('.rounded-lg.border-hairline.p-4');
    expect(questions.length).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Showing 5 of 6');
  });

  it('should mark correct options in questions preview', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('A version control system');
  });

  it('should publish the quiz', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.openPublishModal();
    expect(component.showPublishModal()).toBe(true);

    component.confirmPublish();
    expect(quizzesService.publishMutation.mutate).toHaveBeenCalledWith('quiz-1', expect.any(Object));
  });

  it('should hide publish button for published quizzes', () => {
    quizzesService.setData({ ...quiz, status: 'PUBLISHED', isPublished: true });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Publish');
  });
});
