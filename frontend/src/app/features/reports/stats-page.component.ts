import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { StatsApi } from '../../core/api/stats.api';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

type StatsRecord = Record<string, string | number | boolean | null | undefined>;

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CardComponent, LoadingStateComponent, PageHeaderComponent],
  template: `
    <app-page-header eyebrow="Statistics" title="Performance statistics" description="Backend-calculated counts and score aggregates." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as stats) {
      <section class="grid gap-4 md:grid-cols-3">
        @for (entry of entries(stats); track entry.key) {
          <app-card [tone]="entry.dark ? 'dark' : 'light'">
            <p class="metric-label">{{ entry.key }}</p>
            <p class="metric-value mt-3">{{ entry.value }}</p>
          </app-card>
        }
      </section>
    }
  `,
})
export class StatsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StatsApi);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId');
  readonly programId = this.route.snapshot.paramMap.get('programId');
  readonly quizId = this.route.snapshot.paramMap.get('quizId');
  readonly query = injectQuery(() => ({
    queryKey: ['stats', this.organizationId ?? this.programId ?? this.quizId],
    queryFn: () => {
      if (this.organizationId) return this.api.organization(this.organizationId).then((stats) => stats as unknown as StatsRecord);
      if (this.programId) return this.api.program(this.programId).then((stats) => stats as unknown as StatsRecord);
      return this.api.quiz(this.quizId ?? '').then((stats) => stats as unknown as StatsRecord);
    },
  }));

  entries(stats: StatsRecord) {
    return Object.entries(stats)
      .filter(([, value]) => typeof value !== 'object')
      .map(([key, value], index) => ({ key, value: String(value), dark: index === 0 }));
  }
}
