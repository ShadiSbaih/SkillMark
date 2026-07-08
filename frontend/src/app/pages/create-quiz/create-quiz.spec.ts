import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateQuiz } from './create-quiz';
import { QuizzesService } from '../../services/quizzes.service';
import { Quiz } from '../../core/models/quiz.model';

interface MutationOptions {
  onSuccess?: (data: Quiz) => void;
  onError?: (error: Error) => void;
}

class FakeQuizzesService {
  private readonly _pending = signal(false);
  readonly createMutation = {
    isPending: () => this._pending(),
    mutate: vi.fn((_vars: { programId: string; request: unknown }, options?: MutationOptions) => {
      this._pending.set(false);
      options?.onSuccess?.({
        id: 'quiz-1',
        programId: 'program-1',
        organizationId: 'org-1',
        title: 'New Quiz',
        description: undefined,
        passingScore: 80,
        durationMinutes: 20,
        maxAttempts: 2,
        certificateEnabled: false,
        certificateIssueMode: 'NONE',
        visibleToParticipants: true,
        isPublished: false,
        status: 'DRAFT',
        createdAt: '2026-01-15T10:00:00Z',
        questions: [],
      });
    }),
  };
}

describe('CreateQuiz', () => {
  let component: CreateQuiz;
  let fixture: ComponentFixture<CreateQuiz>;
  let quizzesService: FakeQuizzesService;
  let router: Router;

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();

    await TestBed.configureTestingModule({
      imports: [CreateQuiz],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateQuiz);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the form fields', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement;

    expect(element.textContent).toContain('Title');
    expect(element.textContent).toContain('Passing score');
    expect(element.textContent).toContain('Duration');
    expect(element.textContent).toContain('Max attempts');
    expect(element.textContent).toContain('Description');
    expect(element.textContent).toContain('Issue certificates');
  });

  it('should initialize the form with default values', () => {
    fixture.detectChanges();

    expect(component.form.value).toEqual({
      title: '',
      description: '',
      passingScore: 70,
      durationMinutes: 30,
      maxAttempts: 1,
      certificateEnabled: true,
    });
  });

  it('should not call create mutation when form is invalid', () => {
    fixture.detectChanges();

    component.form.patchValue({ title: '' });
    component.onSubmit();

    expect(quizzesService.createMutation.mutate).not.toHaveBeenCalled();
  });

  it('should call create mutation with program id and request on valid submit', () => {
    fixture.detectChanges();

    component.form.setValue({
      title: 'New Quiz',
      description: 'A new quiz description',
      passingScore: 80,
      durationMinutes: 20,
      maxAttempts: 2,
      certificateEnabled: true,
    });
    component.onSubmit();

    expect(quizzesService.createMutation.mutate).toHaveBeenCalledWith(
      {
        programId: 'program-1',
        request: {
          title: 'New Quiz',
          description: 'A new quiz description',
          passingScore: 80,
          durationMinutes: 20,
          maxAttempts: 2,
          certificateEnabled: true,
          certificateIssueMode: 'AUTO',
        },
      },
      expect.any(Object)
    );
  });

  it('should set certificate issue mode to NONE when certificates are disabled', () => {
    fixture.detectChanges();

    component.form.setValue({
      title: 'New Quiz',
      description: '',
      passingScore: 80,
      durationMinutes: 20,
      maxAttempts: 2,
      certificateEnabled: false,
    });
    component.onSubmit();

    expect(quizzesService.createMutation.mutate).toHaveBeenCalledWith(
      {
        programId: 'program-1',
        request: {
          title: 'New Quiz',
          passingScore: 80,
          durationMinutes: 20,
          maxAttempts: 2,
          certificateEnabled: false,
          certificateIssueMode: 'NONE',
        },
      },
      expect.any(Object)
    );
  });

  it('should navigate to quiz builder on successful creation', () => {
    fixture.detectChanges();

    component.form.setValue({
      title: 'New Quiz',
      description: '',
      passingScore: 80,
      durationMinutes: 20,
      maxAttempts: 2,
      certificateEnabled: false,
    });
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/quizzes', 'quiz-1', 'builder']);
  });

  it('should cancel and navigate back to program quizzes', () => {
    fixture.detectChanges();

    component.router.navigate(['/programs', 'program-1', 'quizzes']);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'quizzes']);
  });
});
