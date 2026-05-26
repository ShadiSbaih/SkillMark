import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AttemptsApi } from '../../core/api/attempts.api';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-attempt-result-page',
  standalone: true,
  imports: [CardComponent, LoadingStateComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Result" title="Attempt result" description="Score and pass status are calculated by the backend." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as attempt) {
      <section class="grid gap-4 md:grid-cols-4">
        <app-card><p class="text-sm text-[var(--color-ink-mute)]">Status</p><div class="mt-3"><app-status-badge [status]="attempt.status" /></div></app-card>
        <app-card><p class="text-sm text-[var(--color-ink-mute)]">Score</p><p class="font-tabular mt-3 text-3xl font-light">{{ attempt.scorePercentage ?? '-' }}%</p></app-card>
        <app-card><p class="text-sm text-[var(--color-ink-mute)]">Points</p><p class="font-tabular mt-3 text-3xl font-light">{{ attempt.earnedPoints ?? '-' }}/{{ attempt.totalPoints ?? '-' }}</p></app-card>
        <app-card tone="dark"><p class="text-sm opacity-75">Passed</p><p class="mt-3 text-3xl font-light">{{ attempt.passed === null ? '-' : attempt.passed ? 'Yes' : 'No' }}</p></app-card>
      </section>
    }
  `,
})
export class AttemptResultPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AttemptsApi);
  readonly attemptId = this.route.snapshot.paramMap.get('attemptId') ?? '';
  readonly query = injectQuery(() => ({ queryKey: ['attempts', this.attemptId], queryFn: () => this.api.get(this.attemptId) }));
}

