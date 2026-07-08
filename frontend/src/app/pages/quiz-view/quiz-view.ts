import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-quiz-view',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './quiz-view.html',
  styleUrl: './quiz-view.scss',
})
export class QuizView {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: this.route.snapshot.paramMap.get('quizId') }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly quiz = computed(() => this.quizQuery.data());
  readonly totalPoints = computed(() =>
    (this.quiz()?.questions ?? []).reduce((sum, q) => sum + (q.points ?? 0), 0)
  );
}
