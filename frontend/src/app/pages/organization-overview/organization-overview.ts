import { Component, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramsService } from '../../services/programs.service';
import { StatsService } from '../../services/stats.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-organization-overview',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './organization-overview.html',
  styleUrl: './organization-overview.scss',
})
export class OrganizationOverview {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);
  private readonly programsService = inject(ProgramsService);
  private readonly statsService = inject(StatsService);

  readonly orgId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: null }
  );

  readonly organizationQuery = this.organizationsService.getOrganizationQuery(() => this.orgId());
  readonly programsQuery = this.programsService.programsQuery;
  readonly statsQuery = this.statsService.getOrganizationStatsQuery(() => this.orgId());

  readonly org = computed(() => this.organizationQuery.data());
  readonly programs = computed(() => this.programsQuery.data()?.items ?? []);
  readonly stats = computed(() => this.statsQuery.data());

  constructor() {
    effect(() => {
      const id = this.orgId();
      this.programsService.listParams.set({
        organizationId: id ?? null,
        page: 0,
        size: 10,
      });
    });
  }

  retry(): void {
    this.organizationQuery.refetch();
    this.programsQuery.refetch();
    this.statsQuery.refetch();
  }
}
