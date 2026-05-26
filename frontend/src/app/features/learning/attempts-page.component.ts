import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AttemptsApi } from '../../core/api/attempts.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-attempts-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Attempts" [title]="quizId ? 'Quiz attempts' : 'My attempts'" description="Review quiz attempt status, scores, and result details." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if ((query.data()?.items?.length ?? 0) === 0) {
      <app-empty-state title="No attempts found" description="Attempts appear after a quiz is started." />
    } @else {
      <div class="app-table-shell">
        <table class="app-table">
          <thead><tr><th>Attempt</th><th>Quiz</th><th>Score</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (attempt of query.data()?.items ?? []; track attempt.attemptId) {
              <tr>
                <td class="font-tabular">Attempt {{ attempt.attemptNumber }}</td>
                <td class="font-tabular">{{ attempt.quizId }}</td>
                <td class="font-tabular">{{ attempt.scorePercentage ?? '-' }}%</td>
                <td><app-status-badge [status]="attempt.status" /></td>
                <td class="table-actions">
                  <a [routerLink]="['/attempts', attempt.attemptId, 'result']"><app-button variant="secondary">Open</app-button></a>
                </td>
              </tr>
            }
          </tbody>
        </table>
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

