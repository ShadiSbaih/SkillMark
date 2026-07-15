import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ChartData } from 'chart.js';
import { OrganizationsService } from '../../services/organizations.service';
import { StatsService } from '../../services/stats.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumnDirective } from '../../shared/components/table/table-column.directive';

@Component({
  selector: 'app-organization-analytics',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    BreadcrumbComponent,
    ButtonComponent,
    ChartComponent,
    TableComponent,
    TableColumnDirective,
  ],
  templateUrl: './organization-analytics.component.html',
  styleUrl: './organization-analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationAnalyticsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);
  private readonly statsService = inject(StatsService);

  readonly orgId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: null }
  );

  readonly organizationQuery = this.organizationsService.getOrganizationQuery(() => this.orgId());
  readonly statsQuery = this.statsService.getOrganizationStatsQuery(() => this.orgId());
  readonly certificatesTimelineQuery = this.statsService.getOrganizationCertificatesTimelineQuery(() => this.orgId());

  readonly organization = computed(() => this.organizationQuery.data());
  readonly stats = computed(() => this.statsQuery.data());

  readonly hasError = computed(
    () =>
      this.organizationQuery.isError() ||
      this.statsQuery.isError() ||
      this.certificatesTimelineQuery.isError()
  );

  readonly isLoading = computed(
    () =>
      this.organizationQuery.isPending() ||
      this.statsQuery.isPending() ||
      this.certificatesTimelineQuery.isPending()
  );

  readonly certificatesTimelineChart = computed<ChartData>(() => {
    const daily = this.certificatesTimelineQuery.data()?.daily ?? [];
    return {
      labels: daily.map((d) => d.label),
      datasets: [
        {
          label: 'Issued',
          data: daily.map((d) => d.issued),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Revoked',
          data: daily.map((d) => d.revoked),
          backgroundColor: 'rgba(244, 63, 94, 0.7)',
          borderColor: 'rgba(244, 63, 94, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
      ],
    };
  });

  retry(): void {
    this.organizationQuery.refetch();
    this.statsQuery.refetch();
    this.certificatesTimelineQuery.refetch();
  }

  trackByProgram(index: number, item: { programId: string }): string {
    return item.programId;
  }
}
