import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-quiz-stats',
  standalone: true,
  imports: [
    CardComponent,
    DecimalPipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './quiz-stats.html',
  styles: ``,
})
export class QuizStats {
  private readonly route = inject(ActivatedRoute);
  readonly statsService = inject(StatsService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly statsQuery = this.statsService.getQuizStatsQuery(() => this.quizId());

  readonly donutStyle = computed(() => {
    const rate = this.statsQuery.data()?.passRate ?? 0;
    return `--value: ${rate}`;
  });
}
