import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ChartData } from 'chart.js';
import { ProgramsService } from '../../services/programs.service';
import { StatsService } from '../../services/stats.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';

@Component({
  selector: 'app-program-analytics',
  standalone: true,
  imports: [
    CardComponent,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    BreadcrumbComponent,
    ButtonComponent,
    ChartComponent,
  ],
  templateUrl: './program-analytics.component.html',
  styleUrl: './program-analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramAnalyticsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly programsService = inject(ProgramsService);
  private readonly statsService = inject(StatsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());
  readonly enrollmentTimelineQuery = this.statsService.getProgramEnrollmentTimelineQuery(() => this.programId());
  readonly completionStatsQuery = this.statsService.getProgramCompletionStatsQuery(() => this.programId());

  readonly program = computed(() => this.programQuery.data());
  readonly stats = computed(() => this.statsQuery.data());
  readonly completion = computed(() => this.completionStatsQuery.data());

  readonly hasError = computed(
    () =>
      this.programQuery.isError() ||
      this.statsQuery.isError() ||
      this.enrollmentTimelineQuery.isError() ||
      this.completionStatsQuery.isError()
  );

  readonly isLoading = computed(
    () =>
      this.programQuery.isPending() ||
      this.statsQuery.isPending() ||
      this.enrollmentTimelineQuery.isPending() ||
      this.completionStatsQuery.isPending()
  );

  readonly enrollmentTimelineChart = computed<ChartData>(() => {
    const daily = this.enrollmentTimelineQuery.data()?.daily ?? [];
    return {
      labels: daily.map((d) => d.label),
      datasets: [
        {
          label: 'Enrolled',
          data: daily.map((d) => d.total),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Completed',
          data: daily.map((d) => d.completed),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
      ],
    };
  });

  readonly funnelSteps = computed(() => {
    const data = this.completion();
    if (!data) {
      return [];
    }
    return [
      { label: 'Enrollments', value: data.totalEnrollments, color: 'bg-blue-500' },
      { label: 'Active', value: data.activeEnrollments, color: 'bg-indigo-500' },
      { label: 'Attempted quiz', value: data.attemptedQuizzes, color: 'bg-violet-500' },
      { label: 'Passed quiz', value: data.passedQuizzes, color: 'bg-emerald-500' },
      { label: 'Certificates', value: data.certificatesIssued, color: 'bg-amber-500' },
    ];
  });

  readonly maxFunnelValue = computed(() => {
    return Math.max(...this.funnelSteps().map((s) => s.value), 1);
  });

  retry(): void {
    this.programQuery.refetch();
    this.statsQuery.refetch();
    this.enrollmentTimelineQuery.refetch();
    this.completionStatsQuery.refetch();
  }
}
