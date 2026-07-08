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
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-program-learn',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, LoadingStateComponent,
    ErrorStateComponent, PageHeaderComponent, ButtonComponent,
  ],
  templateUrl: './program-learn.html',
})
export class ProgramLearn {
  private readonly programsService = inject(ProgramsService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly quizzesService = inject(QuizzesService);

  readonly programId = input.required<string>({ alias: 'programId' });
  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());

  readonly resources = computed(() =>
    this.resourcesService.resourcesQuery.data()?.items?.filter((r) => r.visibleToParticipants) ?? []
  );
  readonly quizzes = computed(() =>
    this.quizzesService.quizzesQuery.data()?.items?.filter((q) => q.status === 'PUBLISHED') ?? []
  );

  constructor() {
    effect(() => {
      const id = this.programId();
      this.resourcesService.listParams.set({ programId: id, page: 0, size: 50 });
      this.quizzesService.listParams.set({ programId: id, page: 0, size: 10 });
    });
  }
}
