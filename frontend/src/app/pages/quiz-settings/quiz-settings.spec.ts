import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizSettings } from './quiz-settings';
import { QuizzesService } from '../../services/quizzes.service';
import { Quiz } from '../../core/models/quiz.model';

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
  private readonly _updatePending = signal(false);
  private readonly _deletePending = signal(false);

  readonly updateMutation = {
    isPending: () => this._updatePending(),
    mutate: vi.fn((_vars: unknown, options?: MutationOptions) => {
      this._updatePending.set(false);
      options?.onSuccess?.();
    }),
  };

  readonly deleteMutation = {
    isPending: () => this._deletePending(),
    mutate: vi.fn((_id: string, options?: MutationOptions) => {
      this._deletePending.set(false);
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
}

describe('QuizSettings', () => {
  let component: QuizSettings;
  let fixture: ComponentFixture<QuizSettings>;
  let quizzesService: FakeQuizzesService;
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
    questions: [],
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();

    await TestBed.configureTestingModule({
      imports: [QuizSettings],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'quiz-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizSettings);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should prefill form with quiz data including instructions', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(component.form.value.title).toBe('Git Basics Quiz');
    expect(component.form.value.description).toBe('Test your Git knowledge');
    expect(component.form.value.instructions).toBe('Read carefully');
    expect(component.form.value.passingScore).toBe(70);
    expect(component.form.value.durationMinutes).toBe(30);
    expect(component.form.value.maxAttempts).toBe(2);
    expect(component.form.value.certificateEnabled).toBe(true);
    expect(component.form.value.certificateIssueMode).toBe('AUTO');
  });

  it('should render breadcrumb', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Programs');
    expect(text).toContain('Program');
    expect(text).toContain('Git Basics Quiz');
    expect(text).toContain('Settings');
  });

  it('should call update mutation on submit', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.form.setValue({
      title: 'Updated Quiz',
      description: 'Updated description',
      instructions: 'Updated instructions',
      passingScore: 80,
      durationMinutes: 45,
      maxAttempts: 3,
      certificateEnabled: false,
      certificateIssueMode: 'NONE',
    });
    component.onSubmit();

    expect(quizzesService.updateMutation.mutate).toHaveBeenCalledWith(
      {
        quizId: 'quiz-1',
        request: {
          title: 'Updated Quiz',
          description: 'Updated description',
          instructions: 'Updated instructions',
          passingScore: 80,
          durationMinutes: 45,
          maxAttempts: 3,
          certificateEnabled: false,
          certificateIssueMode: 'NONE',
        },
      },
      expect.any(Object)
    );
  });

  it('should not submit when form is invalid', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.form.patchValue({ title: '' });
    component.onSubmit();

    expect(quizzesService.updateMutation.mutate).not.toHaveBeenCalled();
  });

  it('should disable save button when quiz is published', () => {
    quizzesService.setData({ ...quiz, status: 'PUBLISHED', isPublished: true });
    fixture.detectChanges();

    expect(component.isPublished()).toBe(true);
  });

  it('should open and close delete dialog', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.openDeleteDialog();
    expect(component.showDeleteDialog()).toBe(true);

    component.closeDeleteDialog();
    expect(component.showDeleteDialog()).toBe(false);
  });

  it('should delete quiz and navigate to program page', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.deleteQuiz();

    expect(quizzesService.deleteMutation.mutate).toHaveBeenCalledWith('quiz-1', expect.any(Object));
  });

  it('should navigate back to quiz overview', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1']);
  });
});
