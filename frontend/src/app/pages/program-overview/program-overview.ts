import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { ProgramResponse } from '../../core/models/program.model';
import { ResourcesService } from '../../services/resources.service';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-program-overview',
  standalone: true,
  imports: [
    RouterLink, CardComponent, EmptyStateComponent, ErrorStateComponent,
    LoadingStateComponent, PageHeaderComponent, StatusBadgeComponent, BreadcrumbComponent,
  ],
  templateUrl: './program-overview.html',
})
export class ProgramOverview {
  private readonly programsService = inject(ProgramsService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly quizzesService = inject(QuizzesService);
  private readonly statsService = inject(StatsService);

  readonly programId = input.required<string>({ alias: 'programId' });

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());

  readonly program = computed(() => this.programQuery.data() as ProgramResponse);
  readonly stats = computed(() => this.statsQuery.data());
  readonly resources = computed(() => this.resourcesService.resourcesQuery.data()?.items ?? []);
  readonly quizzes = computed(() => this.quizzesService.quizzesQuery.data()?.items ?? []);

  constructor() {
    effect(() => {
      const id = this.programId();
      this.resourcesService.listParams.set({ programId: id, page: 0, size: 50 });
      this.quizzesService.listParams.set({ programId: id, page: 0, size: 10 });
    });
  }
}
