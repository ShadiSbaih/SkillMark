import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
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
  selector: 'app-quiz-overview',
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
  ],
  templateUrl: './quiz-overview.html',
  styles: ``,
})
export class QuizOverview {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly showPublishModal = signal(false);
  readonly showVisibilityModal = signal(false);

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

  readonly visibilityBadgeVariant = computed(() =>
    this.quizQuery.data()?.visibleToParticipants ? 'success' : 'default'
  );

  readonly isPublished = computed(() => this.quizQuery.data()?.status === 'PUBLISHED');

  navigateToBuilder(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'builder']);
  }

  navigateToSettings(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'settings']);
  }

  navigateToStats(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'stats']);
  }

  navigateToAttempts(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id, 'attempts']);
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

  toggleVisibility(): void {
    const quiz = this.quizQuery.data();
    const id = this.quizId();
    if (!quiz || !id) return;
    const nextValue = !quiz.visibleToParticipants;
    this.quizzesService.updateVisibilityMutation.mutate(
      { quizId: id, visibleToParticipants: nextValue },
      {
        onSuccess: () => {
          toast.success(nextValue ? 'Quiz is now visible to participants.' : 'Quiz hidden from participants.');
        },
        onError: (error) => {
          toast.error(error?.message ?? 'Failed to update visibility.');
        },
      }
    );
  }
}
