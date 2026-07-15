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
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumnDirective } from '../../shared/components/table/table-column.directive';

@Component({
  selector: 'app-quiz-analytics',
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
    TableComponent,
    TableColumnDirective,
  ],
  templateUrl: './quiz-analytics.component.html',
  styleUrl: './quiz-analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizAnalyticsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly quizzesService = inject(QuizzesService);
  private readonly statsService = inject(StatsService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly statsQuery = this.statsService.getQuizStatsQuery(() => this.quizId());
  readonly questionStatsQuery = this.statsService.getQuizQuestionStatsQuery(() => this.quizId());
  readonly scoreDistributionQuery = this.statsService.getQuizScoreDistributionQuery(() => this.quizId());
  readonly timelineQuery = this.statsService.getQuizAttemptTimelineQuery(() => this.quizId());

  readonly quiz = computed(() => this.quizQuery.data());
  readonly stats = computed(() => this.statsQuery.data());
  readonly questions = computed(() => this.questionStatsQuery.data() ?? []);

  readonly hasError = computed(
    () =>
      this.quizQuery.isError() ||
      this.statsQuery.isError() ||
      this.questionStatsQuery.isError() ||
      this.scoreDistributionQuery.isError() ||
      this.timelineQuery.isError()
  );

  readonly isLoading = computed(
    () =>
      this.quizQuery.isPending() ||
      this.statsQuery.isPending() ||
      this.questionStatsQuery.isPending() ||
      this.scoreDistributionQuery.isPending() ||
      this.timelineQuery.isPending()
  );

  readonly scoreDistributionChart = computed<ChartData>(() => {
    const buckets = this.scoreDistributionQuery.data()?.buckets ?? [];
    return {
      labels: buckets.map((b) => b.label),
      datasets: [
        {
          label: 'Attempts',
          data: buckets.map((b) => b.count),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  });

  readonly timelineChart = computed<ChartData>(() => {
    const daily = this.timelineQuery.data()?.daily ?? [];
    return {
      labels: daily.map((d) => d.label),
      datasets: [
        {
          label: 'Started',
          data: daily.map((d) => d.started),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Submitted',
          data: daily.map((d) => d.submitted),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
      ],
    };
  });

  readonly questionHeatmapData = computed(() => {
    return this.questions().map((q) => ({
      ...q,
      correctRatePercent: Math.round(q.correctRate ?? 0),
      incorrectRatePercent: Math.round(100 - (q.correctRate ?? 0)),
    }));
  });

  trackByQuestion(index: number, item: { questionId: string }): string {
    return item.questionId;
  }

  retry(): void {
    this.quizQuery.refetch();
    this.statsQuery.refetch();
    this.questionStatsQuery.refetch();
    this.scoreDistributionQuery.refetch();
    this.timelineQuery.refetch();
  }
}
