import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { OrganizationsService } from '../../services/organizations.service';
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
    ButtonComponent,
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
  private readonly organizationsService = inject(OrganizationsService);

  readonly selectedOrg = signal<string | null>(null);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly organizationsQuery = this.organizationsService.organizationsQuery;
  readonly programsQuery = this.programsService.programsQuery;

  readonly organizations = computed(() => this.organizationsQuery.data()?.items ?? []);
  readonly programs = computed(() => this.programsQuery.data()?.items ?? []);

  private readonly organizationsMap = computed(() => {
    const map = new Map<string, string>();
    for (const org of this.organizations()) {
      map.set(org.id, org.name);
    }
    return map;
  });

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
      organizationId: this.selectedOrg(),
      page: this.page(),
      size: this.size(),
    });
  }

  onOrganizationChange(organizationId: string): void {
    this.selectedOrg.set(organizationId || null);
    this.page.set(0);
    this.updateParams();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.updateParams();
  }

  organizationName(organizationId: string): string {
    return this.organizationsMap().get(organizationId) ?? 'Unknown organization';
  }

  statusVariant(status: ProgramStatus): BadgeVariant {
    return STATUS_VARIANTS[status];
  }

  trackById(_index: number, program: ProgramResponse): string {
    return program.id;
  }

  private updateParams(): void {
    this.programsService.listParams.set({
      organizationId: this.selectedOrg(),
      page: this.page(),
      size: this.size(),
    });
  }
}
