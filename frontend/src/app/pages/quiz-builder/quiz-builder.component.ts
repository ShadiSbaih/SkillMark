import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  CreateOptionRequest,
  CreateQuestionRequest,
  Question,
  Quiz,
  UpdateQuizRequest,
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

interface DraftQuestion {
  text: string;
  points: number;
  options: DraftOption[];
}

interface DraftOption {
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
    FormsModule,
    LoadingStateComponent,
    ModalComponent,
    PageHeaderComponent,
  ],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss',
})
export class QuizBuilderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly draft = signal<UpdateQuizRequest>({
    title: '',
    description: '',
    passingScore: 70,
    durationMinutes: 30,
    maxAttempts: 1,
    certificateEnabled: true,
    certificateIssueMode: 'AUTO',
  });

  readonly draftQuestions = signal<DraftQuestion[]>([]);
  readonly showQuestionModal = signal(false);
  readonly editingQuestionIndex = signal<number | null>(null);
  readonly questionDraft = signal<DraftQuestion>({
    text: '',
    points: 1,
    options: [{ text: '', isCorrect: true }],
  });

  readonly badgeVariant = computed(() => {
    const status = this.quizQuery.data()?.status;
    switch (status) {
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
    const questions = this.draftQuestions();
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
    this.quizQuery.isSuccess;
  }

  onQuizLoaded(quiz: Quiz): void {
    this.draft.set({
      title: quiz.title,
      description: quiz.description ?? '',
      passingScore: quiz.passingScore,
      durationMinutes: quiz.durationMinutes,
      maxAttempts: quiz.maxAttempts,
      certificateEnabled: quiz.certificateEnabled,
      certificateIssueMode: quiz.certificateIssueMode,
    });

    this.draftQuestions.set(
      quiz.questions.map((q) => ({
        text: q.text,
        points: q.points,
        options: q.options.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      }))
    );
  }

  saveSettings(): void {
    const id = this.quizId();
    if (!id) return;
    this.isSaving.set(true);
    this.saveError.set(null);
    this.quizzesService.updateMutation.mutate(
      { quizId: id, request: this.draft() },
      {
        onSuccess: () => this.isSaving.set(false),
        onError: (error) => {
          this.isSaving.set(false);
          this.saveError.set(error?.message ?? 'Failed to save quiz settings');
        },
      }
    );
  }

  openAddQuestion(): void {
    this.editingQuestionIndex.set(null);
    this.questionDraft.set({
      text: '',
      points: 1,
      options: [{ text: '', isCorrect: true }],
    });
    this.showQuestionModal.set(true);
  }

  openEditQuestion(index: number): void {
    const question = this.draftQuestions()[index];
    if (!question) return;
    this.editingQuestionIndex.set(index);
    this.questionDraft.set({
      text: question.text,
      points: question.points,
      options: question.options.map((o) => ({ ...o })),
    });
    this.showQuestionModal.set(true);
  }

  closeQuestionModal(): void {
    this.showQuestionModal.set(false);
  }

  addOption(): void {
    this.questionDraft.update((q) => ({
      ...q,
      options: [...q.options, { text: '', isCorrect: false }],
    }));
  }

  removeOption(index: number): void {
    this.questionDraft.update((q) => ({
      ...q,
      options: q.options.filter((_, i) => i !== index),
    }));
  }

  setCorrectOption(index: number): void {
    this.questionDraft.update((q) => ({
      ...q,
      options: q.options.map((o, i) => ({ ...o, isCorrect: i === index })),
    }));
  }

  saveQuestion(): void {
    const id = this.quizId();
    if (!id) return;

    const draft = this.questionDraft();
    const request: CreateQuestionRequest = {
      text: draft.text,
      type: 'SINGLE_CHOICE',
      points: draft.points,
      position: this.editingQuestionIndex() ?? this.draftQuestions().length,
      options: draft.options.map((o, i) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        position: i + 1,
      })),
    };

    const editingIndex = this.editingQuestionIndex();
    if (editingIndex !== null) {
      const question = this.quizQuery.data()?.questions[editingIndex];
      if (!question) {
        this.showQuestionModal.set(false);
        return;
      }
      this.quizzesService.updateQuestionMutation.mutate(
        { questionId: question.id, quizId: id, request },
        { onSuccess: () => this.showQuestionModal.set(false) }
      );
    } else {
      this.quizzesService.addQuestionMutation.mutate(
        { quizId: id, request },
        { onSuccess: () => this.showQuestionModal.set(false) }
      );
    }
  }

  deleteQuestion(index: number): void {
    const id = this.quizId();
    const question = this.quizQuery.data()?.questions[index];
    if (!id || !question) return;
    this.quizzesService.deleteQuestionMutation.mutate(
      { questionId: question.id, quizId: id }
    );
  }

  publish(): void {
    const id = this.quizId();
    if (!id) return;
    this.quizzesService.publishMutation.mutate(id);
  }

  goBack(): void {
    const programId = this.quizQuery.data()?.programId;
    if (programId) {
      this.router.navigate(['/programs', programId]);
    } else {
      this.router.navigate(['/organizations']);
    }
  }
}
