import { Component, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { QuizStatus } from '../../core/models/quiz.model';

@Component({
  selector: 'app-program-quizzes',
  standalone: true,
  imports: [
    DatePipe,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './program-quizzes.html',
  styles: ``,
})
export class ProgramQuizzes {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly quizzesQuery = this.quizzesService.quizzesQuery;

  constructor() {
    effect(() => {
      const id = this.programId();
      this.quizzesService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 10,
      });
    });
  }

  statusVariant(status: QuizStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'ARCHIVED':
        return 'danger';
      case 'DRAFT':
        return 'warning';
      default:
        return 'default';
    }
  }

  goBack(): void {
    this.router.navigate(['/programs', this.programId()]);
  }
}
