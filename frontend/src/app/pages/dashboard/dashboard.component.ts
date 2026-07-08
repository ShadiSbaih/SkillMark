import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrganizationsService } from '../../services/organizations.service';
import { CertificatesService } from '../../services/certificates.service';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    CardComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly organizationsService = inject(OrganizationsService);
  private readonly certificatesService = inject(CertificatesService);
  private readonly attemptsService = inject(AttemptsService);

  readonly organizationsQuery = this.organizationsService.organizationsQuery;
  readonly organizations = computed(
    () => this.organizationsQuery.data()?.items ?? []
  );

  readonly certificatesQuery = this.certificatesService.myCertificatesQuery;
  readonly certificates = computed(
    () => this.certificatesQuery.data()?.items ?? []
  );

  readonly attemptsQuery = this.attemptsService.myAttemptsQuery;
  readonly attempts = computed(() => this.attemptsQuery.data()?.items ?? []);

  readonly hasAnyError = computed(
    () =>
      !!this.organizationsQuery.error() ||
      !!this.certificatesQuery.error() ||
      !!this.attemptsQuery.error()
  );

  readonly firstErrorMessage = computed(() => {
    const messages = [
      this.organizationsQuery.error(),
      this.certificatesQuery.error(),
      this.attemptsQuery.error(),
    ]
      .filter(Boolean)
      .map((err) =>
        err instanceof Error ? err.message : 'Failed to load dashboard'
      );
    return messages[0] ?? 'Failed to load dashboard';
  });

  readonly allPending = computed(
    () =>
      this.organizationsQuery.isPending() &&
      this.certificatesQuery.isPending() &&
      this.attemptsQuery.isPending()
  );

  readonly stats = computed(() => {
    const orgs = this.organizations();
    const certs = this.certificates();
    const attempts = this.attempts();
    const submitted = attempts.filter((a) => a.status === 'SUBMITTED');
    const passed = submitted.filter((a) => a.passed).length;
    const passRate = submitted.length ? (passed / submitted.length) * 100 : 0;
    return {
      organizations: orgs.length,
      certificates: certs.length,
      attempts: attempts.length,
      passRate,
    };
  });

  retryAll(): void {
    this.organizationsQuery.refetch();
    this.certificatesQuery.refetch();
    this.attemptsQuery.refetch();
  }
}
