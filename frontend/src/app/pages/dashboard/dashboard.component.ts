import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrganizationsService } from '../../services/organizations.service';
import { CertificatesService } from '../../services/certificates.service';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styles: ``,
})
export class DashboardComponent {
  private readonly organizationsService = inject(OrganizationsService);
  private readonly certificatesService = inject(CertificatesService);
  private readonly attemptsService = inject(AttemptsService);

  readonly organizationsQuery = this.organizationsService.organizationsQuery;
  readonly organizations = computed(() => this.organizationsQuery.data()?.items ?? []);

  readonly certificatesQuery = this.certificatesService.myCertificatesQuery;
  readonly certificates = computed(() => this.certificatesQuery.data()?.items ?? []);

  readonly attemptsQuery = this.attemptsService.myAttemptsQuery;
  readonly attempts = computed(() => this.attemptsQuery.data()?.items ?? []);

  readonly stats = computed(() => {
    const orgs = this.organizations();
    const attempts = this.attempts();
    const certs = this.certificates();
    const submitted = attempts.filter((a) => a.status === 'SUBMITTED');
    const avgScore = submitted.length
      ? submitted.reduce((sum, a) => sum + (a.scorePercentage ?? 0), 0) / submitted.length
      : 0;
    const passed = submitted.filter((a) => a.passed).length;
    const passRate = submitted.length ? (passed / submitted.length) * 100 : 0;
    return {
      organizations: orgs.length,
      members: 0,
      attempts: attempts.length,
      passRate,
      averageScore: avgScore,
    };
  });
}
