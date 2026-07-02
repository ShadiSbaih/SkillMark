import { Component, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProgramsService } from '../../services/programs.service';
import { QuizzesService } from '../../services/quizzes.service';
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
  readonly router = inject(Router);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
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

  publish(): void {
    const id = this.programId();
    if (!id) return;
    this.programsService.publishMutation.mutate(id, {
      onSuccess: () => this.programQuery.refetch(),
    });
  }

  archive(): void {
    const id = this.programId();
    if (!id) return;
    this.programsService.archiveMutation.mutate(id, {
      onSuccess: () => this.programQuery.refetch(),
    });
  }

  goBack(): void {
    this.router.navigate(['/organizations']);
  }
}
