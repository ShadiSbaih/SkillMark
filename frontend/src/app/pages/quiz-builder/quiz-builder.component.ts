import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import {
  CreateQuestionRequest,
  Question,
  Quiz,
} from '../../core/models/quiz.model';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ModalComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss',
})
export class QuizBuilderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly loadedOnce = signal(false);

  readonly showQuestionModal = signal(false);
  readonly editingQuestionIndex = signal<number | null>(null);
  readonly showDeleteModal = signal(false);
  readonly deletingQuestionIndex = signal<number | null>(null);

  readonly questionForm = this.fb.group({
    text: ['', Validators.required],
    points: [1, [Validators.required, Validators.min(1)]],
    options: this.fb.array<FormGroup>([]),
  });

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

  readonly publishChecklist = computed(() => {
    const quiz = this.quizQuery.data();
    const questions = quiz?.questions ?? [];
    return {
      hasTitle: !!quiz?.title?.trim(),
      hasDescription: !!quiz?.description?.trim(),
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
      checks.hasDescription &&
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
      const quiz = this.quizQuery.data();
      if (quiz && !this.loadedOnce()) {
        this.loadedOnce.set(true);
      }
    });
  }

  get optionsArray(): FormArray<FormGroup> {
    return this.questionForm.get('options') as FormArray<FormGroup>;
  }

  private createOptionGroup(text = '', isCorrect = false): FormGroup {
    return this.fb.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect],
    });
  }

  openAddQuestion(): void {
    this.editingQuestionIndex.set(null);
    this.questionForm.reset({ text: '', points: 1 });
    this.optionsArray.clear();
    this.optionsArray.push(this.createOptionGroup('', true));
    this.optionsArray.push(this.createOptionGroup());
    this.showQuestionModal.set(true);
  }

  openEditQuestion(index: number): void {
    const quiz = this.quizQuery.data();
    const question = quiz?.questions[index];
    if (!question) return;

    this.editingQuestionIndex.set(index);
    this.questionForm.reset({ text: question.text, points: question.points });
    this.optionsArray.clear();
    for (const option of question.options) {
      this.optionsArray.push(this.createOptionGroup(option.text, option.isCorrect));
    }
    this.showQuestionModal.set(true);
  }

  closeQuestionModal(): void {
    this.showQuestionModal.set(false);
  }

  addOption(): void {
    this.optionsArray.push(this.createOptionGroup());
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
    if (this.optionsArray.length === 0) {
      this.optionsArray.push(this.createOptionGroup('', true));
    }
  }

  setCorrectOption(index: number): void {
    this.optionsArray.controls.forEach((group, i) => {
      group.patchValue({ isCorrect: i === index });
    });
  }

  saveQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      toast.error('Please fill in the question and all options.');
      return;
    }

    const quizId = this.quizId();
    if (!quizId) return;

    const formValue = this.questionForm.getRawValue();
    const rawOptions = (formValue.options ?? []) as Array<{ text: string; isCorrect: boolean }>;
    const options = rawOptions.map((o, i) => ({
      text: o['text'],
      isCorrect: o['isCorrect'],
      position: i + 1,
    }));

    if (options.length === 0) {
      toast.error('A question needs at least one option.');
      return;
    }

    if (!options.some((o) => o.isCorrect)) {
      toast.error('Please mark at least one option as correct.');
      return;
    }

    const request: CreateQuestionRequest = {
      text: formValue.text ?? '',
      type: 'SINGLE_CHOICE',
      points: formValue.points ?? 1,
      position: 0,
      options,
    };

    const editingIndex = this.editingQuestionIndex();
    if (editingIndex !== null) {
      const quiz = this.quizQuery.data();
      const question = quiz?.questions[editingIndex];
      if (!question) {
        this.showQuestionModal.set(false);
        return;
      }
      request.position = question.position;
      this.quizzesService.updateQuestionMutation.mutate(
        { questionId: question.id, quizId, request },
        {
          onSuccess: () => {
            this.showQuestionModal.set(false);
            toast.success('Question updated.');
          },
          onError: (error) => {
            toast.error(error?.message ?? 'Failed to update question.');
          },
        }
      );
    } else {
      const quiz = this.quizQuery.data();
      request.position = (quiz?.questions.length ?? 0) + 1;
      this.quizzesService.addQuestionMutation.mutate(
        { quizId, request },
        {
          onSuccess: () => {
            this.showQuestionModal.set(false);
            toast.success('Question added.');
          },
          onError: (error) => {
            toast.error(error?.message ?? 'Failed to add question.');
          },
        }
      );
    }
  }

  openDeleteQuestion(index: number): void {
    this.deletingQuestionIndex.set(index);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  confirmDeleteQuestion(): void {
    const quizId = this.quizId();
    const index = this.deletingQuestionIndex();
    const quiz = this.quizQuery.data();
    const question = quiz?.questions[index ?? -1];
    if (!quizId || !question) {
      this.showDeleteModal.set(false);
      return;
    }

    this.quizzesService.deleteQuestionMutation.mutate(
      { questionId: question.id, quizId },
      {
        onSuccess: () => {
          this.showDeleteModal.set(false);
          toast.success('Question deleted.');
        },
        onError: (error) => {
          this.showDeleteModal.set(false);
          toast.error(error?.message ?? 'Failed to delete question.');
        },
      }
    );
  }

  publish(): void {
    const id = this.quizId();
    if (!id) return;
    this.quizzesService.publishMutation.mutate(id, {
      onSuccess: () => toast.success('Quiz published successfully.'),
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
}
