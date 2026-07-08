import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AttemptsService } from '../../services/attempts.service';
import { QuizzesService } from '../../services/quizzes.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    PaginationComponent,
    RouterLink,
  ],
  templateUrl: './quiz-attempts.html',
  styles: ``,
})
export class QuizAttempts {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly attemptsService = inject(AttemptsService);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly page = signal(0);
  readonly size = signal(10);

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());

  readonly attemptsQuery = this.attemptsService.getQuizAttemptsQuery(
    () => this.quizId(),
    () => this.page(),
    () => this.size()
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const quiz = this.quizQuery.data();
    return [
      { label: 'Programs', route: ['/programs'] },
      { label: 'Program', route: quiz?.programId ? ['/programs', quiz.programId] : undefined },
      { label: quiz?.title ?? 'Quiz', route: quiz ? ['/quizzes', quiz.id] : undefined },
      { label: 'Attempts' },
    ];
  });

  readonly pageTitle = computed(() => {
    const quiz = this.quizQuery.data();
    return quiz?.title ? `Attempts: ${quiz.title}` : 'Quiz attempts';
  });

  readonly totalPages = computed(() => {
    const data = this.attemptsQuery.data();
    if (!data || data.totalElements === 0) return 0;
    return Math.ceil(data.totalElements / data.size);
  });

  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() < this.totalPages() - 1);

  goBack(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id]);
  }

  setPage(page: number): void {
    this.page.set(page);
  }
}
