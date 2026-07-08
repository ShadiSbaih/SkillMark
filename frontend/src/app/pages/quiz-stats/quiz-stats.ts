import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StatsService } from '../../services/stats.service';
import { QuizzesService } from '../../services/quizzes.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-quiz-stats',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
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
  readonly router = inject(Router);
  readonly statsService = inject(StatsService);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly statsQuery = this.statsService.getQuizStatsQuery(() => this.quizId());

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const quiz = this.quizQuery.data();
    return [
      { label: 'Programs', route: ['/programs'] },
      { label: 'Program', route: quiz?.programId ? ['/programs', quiz.programId] : undefined },
      { label: quiz?.title ?? 'Quiz', route: quiz ? ['/quizzes', quiz.id] : undefined },
      { label: 'Stats' },
    ];
  });

  goBack(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id]);
  }

  readonly donutStyle = computed(() => {
    const rate = (this.statsQuery.data()?.passRate ?? 0) * 100;
    return `--value: ${rate}`;
  });
}
