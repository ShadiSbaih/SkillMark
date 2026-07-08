import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-quiz-overview',
  standalone: true,
  imports: [
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ModalComponent,
    PageHeaderComponent,
  ],
  templateUrl: './quiz-overview.html',
  styles: ``,
})
export class QuizOverview {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);
  readonly statsService = inject(StatsService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly statsQuery = this.statsService.getQuizStatsQuery(() => this.quizId());
  readonly showPublishModal = signal(false);

  readonly submittedAttempts = computed(() => this.statsQuery.data()?.submittedAttempts ?? 0);
  readonly passCount = computed(() => this.statsQuery.data()?.passCount ?? 0);
  readonly failCount = computed(() => this.statsQuery.data()?.failCount ?? 0);
  readonly highestScore = computed(() => this.statsQuery.data()?.highestScore ?? 0);
  readonly lowestScore = computed(() => this.statsQuery.data()?.lowestScore ?? 0);

  readonly breadcrumbs = computed(() => {
    const quiz = this.quizQuery.data();
    return [
      { label: 'Programs', route: ['/programs'] },
      { label: 'Program', route: quiz?.programId ? ['/programs', quiz.programId] : undefined },
      { label: quiz?.title ?? 'Quiz' },
    ];
  });

  readonly statusBadgeVariant = computed(() => {
    switch (this.quizQuery.data()?.status) {
      case 'PUBLISHED':
        return 'success';
      case 'ARCHIVED':
        return 'danger';
      default:
        return 'warning';
    }
  });

  readonly previewQuestions = computed(() => this.quizQuery.data()?.questions.slice(0, 5) ?? []);
  readonly hasMoreQuestions = computed(
    () => (this.quizQuery.data()?.questions.length ?? 0) > 5
  );

  navigateToBuilder(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'builder']);
  }

  navigateToSettings(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'settings']);
  }

  navigateToPreview(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'view']);
  }

  openPublishModal(): void {
    this.showPublishModal.set(true);
  }

  closePublishModal(): void {
    this.showPublishModal.set(false);
  }

  confirmPublish(): void {
    const id = this.quizId();
    if (!id) return;
    this.quizzesService.publishMutation.mutate(id, {
      onSuccess: () => {
        this.showPublishModal.set(false);
        toast.success('Quiz published successfully.');
      },
      onError: (error) => {
        this.showPublishModal.set(false);
        toast.error(error?.message ?? 'Failed to publish quiz.');
      },
    });
  }
}
