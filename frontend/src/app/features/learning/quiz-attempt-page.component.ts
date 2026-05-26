import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { AttemptsApi } from '../../core/api/attempts.api';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-quiz-attempt-page',
  standalone: true,
  imports: [ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent],
  template: `
    @if (quiz.isPending()) {
      <app-loading-state />
    } @else if (quiz.data(); as item) {
      <app-page-header eyebrow="Quiz attempt" [title]="item.title" [description]="item.description || 'Answer all questions before time expires.'">
        @if (!attemptId()) {
          <app-button (click)="start()">Start attempt</app-button>
        } @else {
          <span class="tile font-tabular text-sm">{{ remainingLabel() }}</span>
        }
      </app-page-header>

      @if (!attemptId()) {
        <app-card>
          <p class="text-sm leading-6 text-[var(--color-ink-mute)]">
            This quiz allows {{ item.maxAttempts }} attempt(s), lasts {{ item.durationMinutes }} minutes, and requires {{ item.passingScore }}% to pass.
          </p>
        </app-card>
      } @else {
        <form class="grid gap-4" (ngSubmit)="submit()">
          @for (question of item.questions; track question.id) {
            <app-card>
              <p class="text-xs text-[var(--color-ink-mute)]">Question {{ question.position }} · {{ question.points }} pts</p>
              <h2 class="mt-2 text-lg font-light">{{ question.text }}</h2>
              <div class="mt-4 grid gap-2">
                @for (option of question.options; track option.id) {
                  <label class="app-focus tile flex cursor-pointer items-center gap-3 text-sm">
                    <input type="radio" [name]="question.id" [value]="option.id" (change)="answer(question.id, option.id)" />
                    {{ option.text }}
                  </label>
                }
              </div>
            </app-card>
          }
          <app-button type="submit" [disabled]="submitMutation.isPending()">Submit quiz</app-button>
        </form>
      }
    }
  `,
})
export class QuizAttemptPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizzes = inject(QuizzesApi);
  private readonly attempts = inject(AttemptsApi);
  readonly quizId = this.route.snapshot.paramMap.get('quizId') ?? '';
  readonly attemptId = signal<string | null>(null);
  readonly expiresAt = signal<string | null>(null);
  readonly now = signal(Date.now());
  readonly answers = signal<Record<string, string>>({});

  readonly quiz = injectQuery(() => ({ queryKey: ['quizzes', this.quizId], queryFn: () => this.quizzes.get(this.quizId) }));

  readonly remainingLabel = computed(() => {
    const expiresAt = this.expiresAt();
    if (!expiresAt) {
      return 'Starting';
    }
    const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - this.now()) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  readonly startMutation = injectMutation(() => ({
    mutationFn: () => this.attempts.start(this.quizId),
    onSuccess: (attempt) => {
      this.attemptId.set(attempt.attemptId);
      this.expiresAt.set(attempt.expiresAt);
      toast.success('Attempt started');
    },
  }));

  readonly submitMutation = injectMutation(() => ({
    mutationFn: () => {
      const attemptId = this.attemptId();
      if (!attemptId) {
        throw new Error('No active attempt');
      }
      return this.attempts.submit(attemptId, {
        answers: Object.entries(this.answers()).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
      });
    },
    onSuccess: async (result) => {
      toast.success('Quiz submitted');
      await this.router.navigate(['/attempts', result.attemptId, 'result'], { state: { result } });
    },
  }));

  constructor() {
    effect((onCleanup) => {
      if (!this.attemptId()) {
        return;
      }
      const id = window.setInterval(() => this.now.set(Date.now()), 1000);
      onCleanup(() => window.clearInterval(id));
    });
  }

  start(): void {
    this.startMutation.mutate();
  }

  answer(questionId: string, optionId: string): void {
    this.answers.update((answers) => ({ ...answers, [questionId]: optionId }));
  }

  submit(): void {
    const questionCount = this.quiz.data()?.questions.length ?? 0;
    if (Object.keys(this.answers()).length !== questionCount) {
      toast.error('Answer every question before submitting');
      return;
    }
    this.submitMutation.mutate();
  }
}

