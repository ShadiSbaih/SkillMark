import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AttemptsApi } from '../../core/api/attempts.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-attempts-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Attempts" [title]="quizId ? 'Quiz attempts' : 'My attempts'" description="Review quiz attempt status, scores, and result details." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if ((query.data()?.items?.length ?? 0) === 0) {
      <app-empty-state title="No attempts found" description="Attempts appear after a quiz is started." />
    } @else {
      <div class="grid gap-3">
        @for (attempt of query.data()?.items ?? []; track attempt.attemptId) {
          <app-card>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-tabular text-sm">Attempt {{ attempt.attemptNumber }}</p>
                <p class="font-tabular text-xs text-[var(--color-ink-mute)]">Score {{ attempt.scorePercentage ?? '-' }}%</p>
              </div>
              <div class="flex items-center gap-2">
                <app-status-badge [status]="attempt.status" />
                <a [routerLink]="['/attempts', attempt.attemptId, 'result']"><app-button variant="secondary">Open</app-button></a>
              </div>
            </div>
          </app-card>
        }
      </div>
      <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
    }
  `,
})
export class AttemptsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AttemptsApi);
  readonly quizId = this.route.snapshot.paramMap.get('quizId') ?? '';
  readonly page = signal(0);
  readonly query = injectQuery(() => ({
    queryKey: ['attempts', this.quizId || 'me', this.page()],
    queryFn: () => this.quizId ? this.api.listForQuiz(this.quizId, this.page(), 10) : this.api.mine(this.page(), 10),
  }));
}

