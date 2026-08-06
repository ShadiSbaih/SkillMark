import { Component, computed, inject, signal, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { ProgramResponse, ProgramStatus } from '../../core/models/program.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const STATUS_VARIANTS: Record<ProgramStatus, BadgeVariant> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'danger',
};

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    RouterLink,
    BadgeComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './programs.component.html',
  styles: ``,
})
export class ProgramsComponent {
  readonly router = inject(Router);
  private readonly programsService = inject(ProgramsService);

  readonly page = signal(0);
  readonly size = signal(10);

  readonly programsQuery = this.programsService.programsQuery;
  readonly programs = computed(() => this.programsQuery.data()?.items ?? []);

  readonly pageInfo = computed(() => {
    const data = this.programsQuery.data();
    return {
      page: data?.page ?? 0,
      size: data?.size ?? this.size(),
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
      hasNext: (data?.page ?? 0) + 1 < (data?.totalPages ?? 0),
      hasPrevious: (data?.page ?? 0) > 0,
    };
  });

  constructor() {
    this.programsService.listParams.set({
      page: this.page(),
      size: this.size(),
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.updateParams();
  }



  statusVariant(status: ProgramStatus): BadgeVariant {
    return STATUS_VARIANTS[status];
  }

  trackById(_index: number, program: ProgramResponse): string {
    return program.id;
  }

  private updateParams(): void {
    this.programsService.listParams.set({
      page: this.page(),
      size: this.size(),
    });
  }
}
