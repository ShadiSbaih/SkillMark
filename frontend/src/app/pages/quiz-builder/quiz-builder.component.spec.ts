import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizBuilderComponent } from './quiz-builder.component';
import { QuizzesService } from '../../services/quizzes.service';
import {
  CreateQuestionRequest,
  Question,
  Quiz,
} from '../../core/models/quiz.model';

interface QueryState<T> {
  data: WritableSignal<T | undefined>;
  isPending: () => boolean;
  isError: () => boolean;
  error: () => Error | null;
  refetch: () => void;
}

interface MutationState<TVariables> {
  isPending: () => boolean;
  mutate: (variables: TVariables, options?: unknown) => void;
}

class FakeQuizzesService {
  private readonly _quizData: WritableSignal<Quiz | undefined> = signal(undefined);
  private readonly _quizPending = signal(false);
  private readonly _quizError = signal<Error | null>(null);

  readonly addQuestionMutation: MutationState<{ quizId: string; request: CreateQuestionRequest }> = {
    isPending: () => false,
    mutate: vi.fn((_vars, options) => {
      (options as { onSuccess?: () => void })?.onSuccess?.();
    }),
  };

  readonly updateQuestionMutation: MutationState<{
    questionId: string;
    quizId: string;
    request: CreateQuestionRequest;
  }> = {
    isPending: () => false,
    mutate: vi.fn((_vars, options) => {
      (options as { onSuccess?: () => void })?.onSuccess?.();
    }),
  };

  readonly deleteQuestionMutation: MutationState<{ questionId: string; quizId: string }> = {
    isPending: () => false,
    mutate: vi.fn((_vars, options) => {
      (options as { onSuccess?: () => void })?.onSuccess?.();
    }),
  };

  readonly publishMutation: MutationState<string> = {
    isPending: () => false,
    mutate: vi.fn((_quizId, options) => {
      (options as { onSuccess?: () => void })?.onSuccess?.();
    }),
  };

  getQuizQuery() {
    return {
      data: () => this._quizData(),
      isPending: () => this._quizPending(),
      isError: () => !!this._quizError(),
      error: () => this._quizError(),
      refetch: vi.fn(),
    };
  }

  setQuiz(quiz: Quiz): void {
    this._quizData.set(quiz);
  }

  setPending(pending: boolean): void {
    this._quizPending.set(pending);
  }

  setError(error: Error): void {
    this._quizError.set(error);
  }
}

const mockQuestion: Question = {
  id: 'q1',
  text: 'What is 2 + 2?',
  type: 'SINGLE_CHOICE',
  points: 1,
  position: 0,
  options: [
    { id: 'o1', text: '3', isCorrect: false, position: 0 },
    { id: 'o2', text: '4', isCorrect: true, position: 1 },
  ],
};

const mockQuiz: Quiz = {
  id: 'quiz-1',
  programId: 'program-1',
  organizationId: 'org-1',
  title: 'Math Quiz',
  description: 'Basic math quiz',
  instructions: undefined,
  passingScore: 80,
  durationMinutes: 10,
  maxAttempts: 1,
  certificateEnabled: false,
  certificateIssueMode: 'NONE',
  visibleToParticipants: true,
  isPublished: false,
  status: 'DRAFT',
  createdAt: '2026-01-15T10:00:00Z',
  questions: [mockQuestion],
};

describe('QuizBuilderComponent', () => {
  let component: QuizBuilderComponent;
  let fixture: ComponentFixture<QuizBuilderComponent>;
  let quizzesService: FakeQuizzesService;
  let router: Router;

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();
    quizzesService.setQuiz(mockQuiz);

    await TestBed.configureTestingModule({
      imports: [QuizBuilderComponent],
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

    fixture = TestBed.createComponent(QuizBuilderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display quiz title in header', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Builder: Math Quiz');
  });

  it('should show loading state while quiz is loading', () => {
    quizzesService.setPending(true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Loading quiz');
  });

  it('should show error state when quiz fails to load', () => {
    quizzesService.setPending(false);
    quizzesService.setQuiz(undefined as unknown as Quiz);
    quizzesService.setError(new Error('Network error'));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Network error');
  });

  it('should render the question editor with default values', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('New question');
    expect(element.textContent).toContain('Question text');
    expect(element.textContent).toContain('Points');
    expect(element.textContent).toContain('Options');
    expect(element.textContent).toContain('Save question');
    expect(element.textContent).toContain('Clear');
  });

  it('should initialize with two empty options', () => {
    expect(component.options()).toHaveLength(2);
    expect(component.options()[0].isCorrect).toBe(true);
    expect(component.options()[1].isCorrect).toBe(false);
  });

  it('should update question text signal', () => {
    component.updateQuestionText('What is the capital of France?');
    expect(component.questionText()).toBe('What is the capital of France?');
  });

  it('should update question points signal', () => {
    component.updateQuestionPoints(5);
    expect(component.questionPoints()).toBe(5);
  });

  it('should add and remove options', () => {
    component.addOption();
    expect(component.options()).toHaveLength(3);

    component.removeOption(2);
    expect(component.options()).toHaveLength(2);
  });

  it('should ensure at least one correct option remains after removal', () => {
    component.options.set([{ text: 'A', isCorrect: true }]);
    component.removeOption(0);
    expect(component.options()).toHaveLength(1);
    expect(component.options()[0].isCorrect).toBe(true);
  });

  it('should set correct option', () => {
    component.setCorrectOption(1);
    expect(component.options()[0].isCorrect).toBe(false);
    expect(component.options()[1].isCorrect).toBe(true);
  });

  it('should update option text', () => {
    component.updateOptionText(0, 'Paris');
    expect(component.options()[0].text).toBe('Paris');
  });

  it('should reset editor to default state', () => {
    component.updateQuestionText('Sample question');
    component.updateQuestionPoints(10);
    component.addOption();
    component.editingQuestionId.set('q1');

    component.resetEditor();

    expect(component.questionText()).toBe('');
    expect(component.questionPoints()).toBe(1);
    expect(component.options()).toHaveLength(2);
    expect(component.editingQuestionId()).toBeNull();
    expect(component.touched()).toBe(false);
  });

  it('should populate editor when editing a question', () => {
    component.editQuestion(mockQuestion);

    expect(component.editingQuestionId()).toBe('q1');
    expect(component.questionText()).toBe('What is 2 + 2?');
    expect(component.questionPoints()).toBe(1);
    expect(component.options()).toHaveLength(2);
    expect(component.options()[1].isCorrect).toBe(true);
  });

  it('should not save when question text is empty', () => {
    component.updateQuestionText('');
    component.options.set([{ text: 'Option A', isCorrect: true }]);

    component.saveQuestion();

    expect(quizzesService.addQuestionMutation.mutate).not.toHaveBeenCalled();
    expect(quizzesService.updateQuestionMutation.mutate).not.toHaveBeenCalled();
  });

  it('should not save when no correct option is selected', () => {
    component.updateQuestionText('Valid question');
    component.options.set([{ text: 'Option A', isCorrect: false }]);

    component.saveQuestion();

    expect(quizzesService.addQuestionMutation.mutate).not.toHaveBeenCalled();
  });

  it('should not save when an option has empty text', () => {
    component.updateQuestionText('Valid question');
    component.options.set([
      { text: 'Option A', isCorrect: false },
      { text: '', isCorrect: true },
    ]);

    component.saveQuestion();

    expect(quizzesService.addQuestionMutation.mutate).not.toHaveBeenCalled();
  });

  it('should call addQuestionMutation when saving a new question', () => {
    component.updateQuestionText('What is 3 + 3?');
    component.updateQuestionPoints(2);
    component.options.set([
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: true },
    ]);

    component.saveQuestion();

    expect(quizzesService.addQuestionMutation.mutate).toHaveBeenCalledWith(
      {
        quizId: 'quiz-1',
        request: {
          text: 'What is 3 + 3?',
          type: 'SINGLE_CHOICE',
          points: 2,
          position: 1,
          options: [
            { text: '5', isCorrect: false, position: 0 },
            { text: '6', isCorrect: true, position: 1 },
          ],
        },
      },
      expect.any(Object)
    );
  });

  it('should call updateQuestionMutation when saving an edited question', () => {
    component.editQuestion(mockQuestion);
    component.updateQuestionText('What is 2 + 2 updated?');
    component.updateQuestionPoints(3);
    component.options.set([
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
    ]);

    component.saveQuestion();

    expect(quizzesService.updateQuestionMutation.mutate).toHaveBeenCalledWith(
      {
        questionId: 'q1',
        quizId: 'quiz-1',
        request: {
          text: 'What is 2 + 2 updated?',
          type: 'SINGLE_CHOICE',
          points: 3,
          position: 0,
          options: [
            { text: '3', isCorrect: false, position: 0 },
            { text: '4', isCorrect: true, position: 1 },
          ],
        },
      },
      expect.any(Object)
    );
  });

  it('should reset editor after successfully adding a question', () => {
    component.updateQuestionText('What is 3 + 3?');
    component.options.set([
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: true },
    ]);

    component.saveQuestion();

    expect(component.questionText()).toBe('');
    expect(component.editingQuestionId()).toBeNull();
  });

  it('should call deleteQuestionMutation when deleting a question', () => {
    component.deleteQuestion(mockQuestion);

    expect(quizzesService.deleteQuestionMutation.mutate).toHaveBeenCalledWith(
      { questionId: 'q1', quizId: 'quiz-1' },
      expect.any(Object)
    );
  });

  it('should call publishMutation when publishing', () => {
    component.publish();

    expect(quizzesService.publishMutation.mutate).toHaveBeenCalledWith(
      'quiz-1',
      expect.any(Object)
    );
  });

  it('should disable publish when quiz is already published', () => {
    quizzesService.setQuiz({ ...mockQuiz, status: 'PUBLISHED' });
    fixture.detectChanges();

    expect(component.canPublish()).toBe(false);
  });

  it('should disable publish when quiz has no questions', () => {
    quizzesService.setQuiz({ ...mockQuiz, questions: [] });
    fixture.detectChanges();

    expect(component.canPublish()).toBe(false);
  });

  it('should enable publish when all checklist items are satisfied', () => {
    expect(component.canPublish()).toBe(true);
  });

  it('should navigate back to quiz overview', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1']);
  });

  it('should disable question editing when quiz is published', () => {
    quizzesService.setQuiz({ ...mockQuiz, status: 'PUBLISHED' });
    fixture.detectChanges();

    expect(component.isPublished()).toBe(true);
  });

  it('should render questions list', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('What is 2 + 2?');
    expect(element.textContent).toContain('1 pts');
    expect(element.textContent).toContain('Correct');
  });

  it('should render empty state when there are no questions', () => {
    quizzesService.setQuiz({ ...mockQuiz, questions: [] });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No questions yet');
  });

  it('should trim question text and option text when building request', () => {
    component.updateQuestionText('  Trimmed question  ');
    component.options.set([
      { text: '  A  ', isCorrect: false },
      { text: '  B  ', isCorrect: true },
    ]);

    component.saveQuestion();

    const call = vi.mocked(quizzesService.addQuestionMutation.mutate).mock.calls[0];
    const request = (call[0] as { request: CreateQuestionRequest }).request;
    expect(request.text).toBe('Trimmed question');
    expect(request.options[0].text).toBe('A');
    expect(request.options[1].text).toBe('B');
  });

  it('should show correct badge variant for quiz status', () => {
    expect(component.badgeVariant()).toBe('warning');

    quizzesService.setQuiz({ ...mockQuiz, status: 'PUBLISHED' });
    fixture.detectChanges();
    expect(component.badgeVariant()).toBe('success');

    quizzesService.setQuiz({ ...mockQuiz, status: 'ARCHIVED' });
    fixture.detectChanges();
    expect(component.badgeVariant()).toBe('danger');
  });
});
