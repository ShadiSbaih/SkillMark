import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProgramsService } from '../../services/programs.service';
import { ResourcesService } from '../../services/resources.service';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-program-learn',
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
  templateUrl: './program-learn.html',
  styles: ``,
})
export class ProgramLearn {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly programsService = inject(ProgramsService);
  readonly resourcesService = inject(ResourcesService);
  readonly quizzesService = inject(QuizzesService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly resourcesQuery = this.resourcesService.resourcesQuery;
  readonly quizzesQuery = this.quizzesService.quizzesQuery;

  constructor() {
    effect(() => {
      const id = this.programId();
      this.resourcesService.listParams.set({ programId: id ?? null, page: 0, size: 50 });
      this.quizzesService.listParams.set({ programId: id ?? null, page: 0, size: 10 });
    });
  }

  readonly visibleResources = computed(
    () => this.resourcesQuery.data()?.items?.filter((r) => r.visibleToParticipants && r.status === 'ACTIVE') ?? []
  );

  readonly visibleQuizzes = computed(
    () => this.quizzesQuery.data()?.items?.filter((q) => q.visibleToParticipants && q.status === 'PUBLISHED') ?? []
  );

  typeIcon(type: string): string {
    switch (type) {
      case 'LINK': return '🔗';
      case 'FILE': return '📄';
      case 'IMAGE': return '🖼️';
      case 'VIDEO_LINK': return '🎬';
      default: return '📎';
    }
  }
}
