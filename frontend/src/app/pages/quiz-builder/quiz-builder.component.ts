import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import {
  CreateQuestionRequest,
  Option,
  Question,
  Quiz,
} from '../../core/models/quiz.model';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface EditorOption {
  text: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    FormFieldComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    FormsModule,
  ],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss',
})
export class QuizBuilderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());

  readonly editingQuestionId = signal<string | null>(null);
  readonly questionText = signal('');
  readonly questionPoints = signal(1);
  readonly options = signal<EditorOption[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ]);
  readonly touched = signal(false);

  readonly badgeVariant = computed(() => {
    switch (this.quizQuery.data()?.status) {
      case 'PUBLISHED':
        return 'success';
      case 'ARCHIVED':
        return 'danger';
      case 'DRAFT':
        return 'warning';
      default:
        return 'default';
    }
  });

  readonly isPublished = computed(() => this.quizQuery.data()?.status === 'PUBLISHED');

  readonly isQuestionTextInvalid = computed(() => this.touched() && !this.questionText().trim());
  readonly isOptionsInvalid = computed(
    () => this.touched() && this.options().some((o) => !o.text.trim())
  );
  readonly hasCorrectOption = computed(() => this.options().some((o) => o.isCorrect));
  readonly canSaveQuestion = computed(() => {
    const text = this.questionText().trim();
    const opts = this.options();
    return (
      !!text &&
      opts.length > 0 &&
      opts.every((o) => o.text.trim()) &&
      opts.some((o) => o.isCorrect)
    );
  });

  readonly publishChecklist = computed(() => {
    const quiz = this.quizQuery.data();
    const questions = quiz?.questions ?? [];
    return {
      hasTitle: !!quiz?.title?.trim(),
      hasQuestions: questions.length > 0,
      allQuestionsHaveOptions: questions.every((q) => q.options.length > 0),
      allQuestionsHaveCorrectAnswer: questions.every((q) =>
        q.options.some((o) => o.isCorrect)
      ),
      passingScoreSet: (quiz?.passingScore ?? 0) > 0,
      durationSet: (quiz?.durationMinutes ?? 0) >= 1,
    };
  });

  readonly canPublish = computed(() => {
    const checks = this.publishChecklist();
    return (
      checks.hasTitle &&
      checks.hasQuestions &&
      checks.allQuestionsHaveOptions &&
      checks.allQuestionsHaveCorrectAnswer &&
      checks.passingScoreSet &&
      checks.durationSet &&
      !this.isPublished()
    );
  });

  constructor() {
    effect(() => {
      const id = this.quizId();
      if (!id) {
        void this.router.navigate(['/dashboard']);
      }
    });
  }

  updateQuestionText(value: string): void {
    this.questionText.set(value);
  }

  updateQuestionPoints(value: number): void {
    this.questionPoints.set(value);
  }

  updateOptionText(index: number, value: string): void {
    this.options.update((opts) => {
      const next = [...opts];
      next[index] = { ...next[index], text: value };
      return next;
    });
  }

  setCorrectOption(index: number): void {
    this.options.update((opts) =>
      opts.map((o, i) => ({ ...o, isCorrect: i === index }))
    );
  }

  addOption(): void {
    this.options.update((opts) => [...opts, { text: '', isCorrect: false }]);
  }

  removeOption(index: number): void {
    this.options.update((opts) => {
      const next = opts.filter((_, i) => i !== index);
      if (next.length === 0) {
        return [{ text: '', isCorrect: true }];
      }
      if (!next.some((o) => o.isCorrect)) {
        next[0] = { ...next[0], isCorrect: true };
      }
      return next;
    });
  }

  resetEditor(): void {
    this.editingQuestionId.set(null);
    this.questionText.set('');
    this.questionPoints.set(1);
    this.options.set([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ]);
    this.touched.set(false);
  }

  editQuestion(question: Question): void {
    this.editingQuestionId.set(question.id);
    this.questionText.set(question.text);
    this.questionPoints.set(question.points);
    this.options.set(
      question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
    );
    this.touched.set(false);
  }

  deleteQuestion(question: Question): void {
    const quizId = this.quizId();
    if (!quizId) return;

    this.quizzesService.deleteQuestionMutation.mutate(
      { questionId: question.id, quizId },
      {
        onSuccess: () => toast.success('Question deleted.'),
        onError: (error) => toast.error(error?.message ?? 'Failed to delete question.'),
      }
    );
  }

  saveQuestion(): void {
    this.touched.set(true);

    const quizId = this.quizId();
    if (!quizId) return;

    const text = this.questionText().trim();
    const points = this.questionPoints();
    const rawOptions = this.options();

    if (!text) {
      toast.error('Question text is required.');
      return;
    }

    if (rawOptions.length === 0) {
      toast.error('A question needs at least one option.');
      return;
    }

    if (rawOptions.some((o) => !o.text.trim())) {
      toast.error('All options need text.');
      return;
    }

    if (!rawOptions.some((o) => o.isCorrect)) {
      toast.error('Please mark at least one option as correct.');
      return;
    }

    const request: CreateQuestionRequest = {
      text,
      type: 'SINGLE_CHOICE',
      points,
      position: 0,
      options: rawOptions.map((o, i) => ({
        text: o.text.trim(),
        isCorrect: o.isCorrect,
        position: i,
      })),
    };

    const editingId = this.editingQuestionId();
    if (editingId) {
      const question = this.findQuestionById(editingId);
      request.position = question?.position ?? 0;
      this.quizzesService.updateQuestionMutation.mutate(
        { questionId: editingId, quizId, request },
        {
          onSuccess: () => {
            this.resetEditor();
            toast.success('Question updated.');
          },
          onError: (error) => {
            toast.error(error?.message ?? 'Failed to update question.');
          },
        }
      );
    } else {
      const quiz = this.quizQuery.data();
      request.position = quiz?.questions.length ?? 0;
      this.quizzesService.addQuestionMutation.mutate(
        { quizId, request },
        {
          onSuccess: () => {
            this.resetEditor();
            toast.success('Question added.');
          },
          onError: (error) => {
            toast.error(error?.message ?? 'Failed to add question.');
          },
        }
      );
    }
  }

  publish(): void {
    const id = this.quizId();
    if (!id) return;
    this.quizzesService.publishMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Quiz published successfully.');
        void this.router.navigate(['/quizzes', id]);
      },
      onError: (error) => toast.error(error?.message ?? 'Failed to publish quiz.'),
    });
  }

  goBack(): void {
    const id = this.quizId();
    if (id) {
      void this.router.navigate(['/quizzes', id]);
    } else {
      void this.router.navigate(['/dashboard']);
    }
  }

  private findQuestionById(id: string): Question | undefined {
    return this.quizQuery.data()?.questions.find((q) => q.id === id);
  }

  trackByQuestion(_index: number, question: Question): string {
    return question.id;
  }

  trackByOption(index: number): number {
    return index;
  }
}
