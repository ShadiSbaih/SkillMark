import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { OrganizationsService } from '../../services/organizations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-organization-stats',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    CardComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './organization-stats.component.html',
  styleUrl: './organization-stats.component.scss',
})
export class OrganizationStatsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly statsService = inject(StatsService);
  private readonly organizationsService = inject(OrganizationsService);

  readonly organizationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: this.route.snapshot.paramMap.get('orgId') }
  );

  readonly organizationQuery = this.organizationsService.getOrganizationQuery(this.organizationId);
  readonly statsQuery = this.statsService.getOrganizationStatsQuery(this.organizationId);
  readonly stats = computed(() => this.statsQuery.data());
  readonly organization = computed(() => this.organizationQuery.data());

  readonly metrics = computed(() => {
    const stats = this.stats();
    if (!stats) return [];
    return [
      { label: 'Programs', value: stats.totalPrograms },
      { label: 'Members', value: stats.totalMembers },
      { label: 'Enrolled participants', value: stats.totalEnrolledParticipants },
      { label: 'Quizzes', value: stats.totalQuizzes },
      { label: 'Attempts', value: stats.totalAttempts },
      { label: 'Certificates', value: stats.totalCertificates },
      { label: 'Average score', value: stats.averageScore, suffix: '%' },
      { label: 'Pass rate', value: stats.passRate, suffix: '%' },
    ];
  });
}
