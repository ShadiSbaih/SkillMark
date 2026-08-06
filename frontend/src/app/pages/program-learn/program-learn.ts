import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { ResourcesService } from '../../services/resources.service';
import { QuizzesService } from '../../services/quizzes.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AttemptsService } from '../../services/attempts.service';
import { AttemptResponse } from '../../core/models/attempt.model';

@Component({
  selector: 'app-program-learn',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, LoadingStateComponent,
    ErrorStateComponent, PageHeaderComponent, BadgeComponent,
  ],
  templateUrl: './program-learn.html',
})
export class ProgramLearn {
  private readonly programsService = inject(ProgramsService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly quizzesService = inject(QuizzesService);
  private readonly attemptsService = inject(AttemptsService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly myAttemptsQuery = this.attemptsService.myAttemptsQuery;

  readonly resources = computed(() =>
    this.resourcesService.resourcesQuery.data()?.items?.filter((r) => r.visibleToParticipants) ?? []
  );
  readonly quizzes = computed(() =>
    this.quizzesService.quizzesQuery.data()?.items?.filter((q) => q.status === 'PUBLISHED') ?? []
  );
  readonly attempts = computed(() => this.myAttemptsQuery.data()?.items ?? []);

  constructor() {
    effect(() => {
      const id = this.programId();
      this.resourcesService.listParams.set({ programId: id, page: 0, size: 50 });
      this.quizzesService.listParams.set({ programId: id, page: 0, size: 10 });
    });
  }

  getBestAttempt(quizId: string): AttemptResponse | undefined {
    const quizAttempts = this.attempts().filter(a => a.quizId === quizId);
    if (quizAttempts.length === 0) return undefined;
    
    // Return a passed one if it exists, otherwise the most recent
    const passed = quizAttempts.find(a => a.passed);
    if (passed) return passed;
    return quizAttempts[0]; // Assuming they are sorted by date desc
  }
}
