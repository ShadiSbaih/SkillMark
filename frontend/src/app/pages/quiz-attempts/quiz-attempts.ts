import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { AttemptsService } from '../../services/attempts.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    SlicePipe,
  ],
  templateUrl: './quiz-attempts.html',
  styles: ``,
})
export class QuizAttempts {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly attemptsService = inject(AttemptsService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly page = signal(0);
  readonly size = signal(10);

  readonly attemptsQuery = this.attemptsService.getQuizAttemptsQuery(
    () => this.quizId(),
    () => this.page(),
    () => this.size()
  );

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

  previousPage(): void {
    if (this.hasPrevious()) this.page.update((p) => p - 1);
  }

  nextPage(): void {
    if (this.hasNext()) this.page.update((p) => p + 1);
  }
}
