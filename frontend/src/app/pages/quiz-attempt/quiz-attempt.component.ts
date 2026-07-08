import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Question, Quiz } from '../../core/models/quiz.model';
import {
  StartAttemptResponse,
  SubmitAttemptRequest,
} from '../../core/models/attempt.model';
import { QuizzesService } from '../../services/quizzes.service';
import { AttemptsService } from '../../services/attempts.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AttemptStorageService } from '../../core/services/attempt-storage.service';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ModalComponent,
  ],
  templateUrl: './quiz-attempt.component.html',
  styleUrl: './quiz-attempt.component.scss',
})
export class QuizAttemptComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly quizzesService = inject(QuizzesService);
  private readonly attemptsService = inject(AttemptsService);
  private readonly attemptStorage = inject(AttemptStorageService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());

  readonly attemptId = signal<string | null>(null);
  readonly expiresAt = signal<Date | null>(null);
  readonly answers = signal<Record<string, string>>({});
  readonly currentQuestionIndex = signal(0);
  readonly timeRemainingMs = signal(0);
  readonly showSubmitModal = signal(false);
  readonly startError = signal<string | null>(null);

  private timerIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly currentQuestion = computed<Question | undefined>(() => {
    const questions = this.quizQuery.data()?.questions ?? [];
    return questions[this.currentQuestionIndex()];
  });

  readonly totalQuestions = computed(
    () => this.quizQuery.data()?.questions.length ?? 0
  );

  readonly isLastQuestion = computed(
    () => this.currentQuestionIndex() === this.totalQuestions() - 1
  );

  readonly answeredCount = computed(() => Object.keys(this.answers()).length);

  readonly timerDisplay = computed(() => {
    const ms = Math.max(0, this.timeRemainingMs());
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  readonly timerWarning = computed(() => this.timeRemainingMs() < 60_000);

  constructor() {
    effect(() => {
      const quiz = this.quizQuery.data();
      if (quiz) {
        this.startAttempt(quiz);
      }
    });
  }

  ngOnInit(): void {
    this.startTimerLoop();
  }

  startAttempt(quiz: Quiz): void {
    if (this.attemptId()) return;

    const id = quiz.id;
    this.attemptsService.startMutation.mutate(
      {
        quizId: id,
        onSuccess: (response: StartAttemptResponse) => {
          this.attemptId.set(response.attemptId);
          this.expiresAt.set(new Date(response.expiresAt));
          const saved = this.attemptStorage.load(response.attemptId);
          if (saved) this.answers.set(saved);
          this.updateTimeRemaining();
        },
      },
      {
        onError: (error) => {
          this.startError.set(
            error?.message ?? 'Failed to start quiz attempt.'
          );
        },
      }
    );
  }

  private startTimerLoop(): void {
    this.timerIntervalId = setInterval(() => {
      this.updateTimeRemaining();
      if (this.timeRemainingMs() <= 0 && this.attemptId()) {
        this.submitAnswers(true);
      }
    }, 1000);

    this.destroyRef.onDestroy(() => {
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
      }
    });
  }

  private updateTimeRemaining(): void {
    const expires = this.expiresAt();
    if (!expires) {
      this.timeRemainingMs.set(0);
      return;
    }
    this.timeRemainingMs.set(expires.getTime() - Date.now());
  }

  selectOption(questionId: string, optionId: string): void {
    this.answers.update((prev) => {
      const next = { ...prev, [questionId]: optionId };
      const attemptId = this.attemptId();
      const quizId = this.quizId();
      if (attemptId && quizId) {
        this.attemptStorage.save(attemptId, quizId, next);
      }
      return next;
    });
  }

  goToQuestion(index: number): void {
    const total = this.totalQuestions();
    if (index >= 0 && index < total) {
      this.currentQuestionIndex.set(index);
    }
  }

  previous(): void {
    this.goToQuestion(this.currentQuestionIndex() - 1);
  }

  next(): void {
    if (this.isLastQuestion()) {
      this.openSubmitModal();
    } else {
      this.goToQuestion(this.currentQuestionIndex() + 1);
    }
  }

  openSubmitModal(): void {
    this.showSubmitModal.set(true);
  }

  closeSubmitModal(): void {
    this.showSubmitModal.set(false);
  }

  confirmSubmit(): void {
    this.showSubmitModal.set(false);
    this.submitAnswers(false);
  }

  private submitAnswers(auto: boolean): void {
    const attemptId = this.attemptId();
    if (!attemptId) return;

    const request: SubmitAttemptRequest = {
      answers: Object.entries(this.answers()).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    };

    this.attemptsService.submitMutation.mutate(
      { attemptId, request },
      {
        onSuccess: () => {
          this.attemptStorage.clear(attemptId);
          this.router.navigate(['/attempts', attemptId, 'result']);
        },
        onError: (error) => {
          if (auto) {
            this.startError.set(
              error?.message ?? 'Time is up, but submission failed.'
            );
          }
        },
      }
    );
  }

  isAnswered(questionId: string): boolean {
    return questionId in this.answers();
  }

  getSelectedOption(questionId: string): string | undefined {
    return this.answers()[questionId];
  }

  retryLoad(): void {
    this.quizQuery.refetch();
  }
}
