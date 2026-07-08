import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { QuizView } from './quiz-view';
import { QuizzesService } from '../../services/quizzes.service';
import { Quiz } from '../../core/models/quiz.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: T | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

class FakeQuizzesService {
  private readonly refetchSpy = vi.fn();
  private queryState = signal<QueryState<Quiz>>({
    isPending: true,
    isError: false,
    data: null,
    error: null,
    refetch: this.refetchSpy,
  });

  getQuizQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.refetchSpy,
    };
  }

  setPending() {
    this.queryState.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: this.refetchSpy,
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this.refetchSpy,
    });
  }

  setData(data: Quiz) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this.refetchSpy,
    });
  }
}

describe('QuizView', () => {
  let component: QuizView;
  let fixture: ComponentFixture<QuizView>;
  let quizzesService: FakeQuizzesService;

  const quiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Preview Quiz',
    description: 'A read-only preview.',
    passingScore: 80,
    durationMinutes: 15,
    maxAttempts: 2,
    certificateEnabled: true,
    certificateIssueMode: 'AUTO',
    visibleToParticipants: true,
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-01-01T00:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'What is the answer?',
        type: 'SINGLE_CHOICE',
        points: 2,
        position: 0,
        options: [
          { id: 'q1-a', text: 'Alpha', isCorrect: true, position: 0 },
          { id: 'q1-b', text: 'Beta', isCorrect: false, position: 1 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();

    await TestBed.configureTestingModule({
      imports: [QuizView],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'quiz-1' } as unknown as ParamMap),
            snapshot: { paramMap: { get: () => 'quiz-1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizView);
    component = fixture.componentInstance;
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
    quizzesService.setError(new Error('Fetch failed'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Fetch failed');

    const refetchSpy = quizzesService.getQuizQuery().refetch;
    const retryButton =
      fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(refetchSpy).toHaveBeenCalled();
  });

  it('should render quiz preview details', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Preview Quiz');
    expect(text).toContain('A read-only preview.');
    expect(text).toContain('80%');
    expect(text).toContain('15 min');
    expect(text).toContain('2');
    expect(text).toContain('1');
  });

  it('should render questions and mark correct options', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'What is the answer?'
    );
    expect(fixture.nativeElement.textContent).toContain('Alpha');
    expect(fixture.nativeElement.textContent).toContain('Beta');
    expect(fixture.nativeElement.textContent).toContain('Correct');
  });

  it('should link to quiz builder', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    const editLink = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    ).find((el) => el.textContent?.includes('Edit quiz'));

    expect(editLink).toBeTruthy();
    expect(editLink?.getAttribute('href')).toBe(
      '/quizzes/quiz-1/builder'
    );
  });

  it('should compute total points', () => {
    quizzesService.setData(quiz);
    fixture.detectChanges();

    expect(component.totalPoints()).toBe(2);
  });

  it('should handle empty questions', () => {
    quizzesService.setData({ ...quiz, questions: [] });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No questions yet');
  });
});
