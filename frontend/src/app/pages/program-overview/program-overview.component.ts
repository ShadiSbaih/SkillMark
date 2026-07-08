import { Component, computed, effect, inject } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { ResourcesService } from '../../services/resources.service';
import { StatsService } from '../../services/stats.service';
import { OrganizationsService } from '../../services/organizations.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ResourceResponse, ResourceType } from '../../core/models/resource.model';
import { Quiz } from '../../core/models/quiz.model';

@Component({
  selector: 'app-program-overview',
  standalone: true,
  imports: [
    RouterLink,
    StatusBadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './program-overview.component.html',
  styleUrl: './program-overview.component.scss',
})
export class ProgramOverviewComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly programsService = inject(ProgramsService);
  readonly quizzesService = inject(QuizzesService);
  readonly resourcesService = inject(ResourcesService);
  readonly statsService = inject(StatsService);
  readonly organizationsService = inject(OrganizationsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly quizzesQuery = this.quizzesService.quizzesQuery;
  readonly resourcesQuery = this.resourcesService.resourcesQuery;
  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());

  readonly organizationId = computed(() => this.programQuery.data()?.organizationId ?? null);
  readonly organizationQuery = this.organizationsService.getOrganizationQuery(() => this.organizationId());

  readonly breadcrumbs = computed(() => {
    const org = this.organizationQuery.data();
    const program = this.programQuery.data();
    return [
      { label: 'Organizations', route: ['/organizations'] },
      { label: org?.name ?? 'Organization', route: org ? ['/organizations', org.id] : undefined },
      { label: program?.title ?? 'Program' },
    ];
  });

  readonly resources = computed(() => this.resourcesQuery.data()?.items?.slice(0, 5) ?? []);
  readonly quizzes = computed(() => this.quizzesQuery.data()?.items?.slice(0, 5) ?? []);

  constructor() {
    effect(() => {
      const id = this.programId();
      this.quizzesService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 10,
      });
      this.resourcesService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 50,
      });
    });
  }

  typeIcon(type: ResourceType): string {
    switch (type) {
      case 'LINK':
        return '🔗';
      case 'FILE':
        return '📄';
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO_LINK':
        return '🎬';
      default:
        return '📎';
    }
  }

  openResource(resource: ResourceResponse): void {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  }

  quizSubtitle(quiz: Quiz): string {
    const questions = quiz.questions?.length ?? 0;
    return `${questions} question${questions === 1 ? '' : 's'} · ${quiz.passingScore}% to pass`;
  }
}
