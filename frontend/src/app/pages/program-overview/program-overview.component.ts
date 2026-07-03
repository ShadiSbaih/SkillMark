import { Component, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
import { ResourcesService } from '../../services/resources.service';
import { EnrollmentsService } from '../../services/enrollments.service';
import { StatsService } from '../../services/stats.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-program-overview',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './program-overview.component.html',
  styleUrl: './program-overview.component.scss',
})
export class ProgramOverviewComponent {
  private readonly route = inject(ActivatedRoute);
  readonly programsService = inject(ProgramsService);
  readonly quizzesService = inject(QuizzesService);
  readonly resourcesService = inject(ResourcesService);
  readonly enrollmentsService = inject(EnrollmentsService);
  readonly statsService = inject(StatsService);
  readonly router = inject(Router);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly quizzesQuery = this.quizzesService.quizzesQuery;
  readonly resourcesQuery = this.resourcesService.resourcesQuery;
  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());

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

  readonly badgeVariant = computed(() => {
    const status = this.programQuery.data()?.status;
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
  });

  readonly canPublish = computed(() => this.programQuery.data()?.status === 'DRAFT');
  readonly canArchive = computed(() => this.programQuery.data()?.status !== 'ARCHIVED');
  readonly canDelete = computed(() => this.programQuery.data()?.status === 'ARCHIVED');

  publish(): void {
    const id = this.programId();
    if (!id) return;
    this.programsService.publishMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Program published');
        this.programQuery.refetch();
      },
      onError: (error: Error) => toast.error(error.message || 'Failed to publish program'),
    });
  }

  archive(): void {
    const id = this.programId();
    if (!id) return;
    this.programsService.archiveMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Program archived');
        this.programQuery.refetch();
      },
      onError: (error: Error) => toast.error(error.message || 'Failed to archive program'),
    });
  }

  deleteProgram(): void {
    const id = this.programId();
    const orgId = this.programQuery.data()?.organizationId;
    if (!id) return;
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      return;
    }
    this.programsService.deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Program deleted');
        this.router.navigate(['/organizations', orgId ?? '']);
      },
      onError: (error: Error) => toast.error(error.message || 'Failed to delete program'),
    });
  }

  goBack(): void {
    this.router.navigate(['/organizations']);
  }

  navigate(path: string[]): void {
    const id = this.programId();
    if (!id) return;
    this.router.navigate(['/programs', id, ...path]);
  }
}
