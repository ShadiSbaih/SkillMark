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
            @if (entry.percent !== null) {
              <div class="stat-meter"><span [style.width.%]="entry.percent"></span></div>
            }
          </app-card>
        }
      </section>
      <section class="stats-chart-panel">
        <div>
          <p class="workspace-section-title">Performance Shape</p>
          <div class="bar-chart">
            @for (entry of entries(stats).slice(0, 6); track entry.key) {
              <span [style.height.%]="entry.percent ?? 35" [attr.title]="entry.key + ': ' + entry.value"></span>
            }
          </div>
        </div>
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
    enabled: !!(this.organizationId || this.programId || this.quizId),
    queryFn: () => {
      if (this.organizationId) return this.api.organization(this.organizationId).then((stats) => stats as unknown as StatsRecord);
      if (this.programId) return this.api.program(this.programId).then((stats) => stats as unknown as StatsRecord);
      return this.api.quiz(this.quizId as string).then((stats) => stats as unknown as StatsRecord);
    },
  }));

  entries(stats: StatsRecord) {
    return Object.entries(stats)
      .filter(([, value]) => typeof value !== 'object')
      .map(([key, value], index) => {
        const numeric = typeof value === 'number' ? value : Number(value);
        const percent = Number.isFinite(numeric) ? Math.max(6, Math.min(100, numeric)) : null;
        return { key, value: String(value), dark: index === 0, percent };
      });
  }
}
