import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CertificatesService } from '../../services/certificates.service';
import { OrganizationsService } from '../../services/organizations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-organization-certificates',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    CardComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './organization-certificates.html',
  styleUrl: './organization-certificates.scss',
})
export class OrganizationCertificates {
  private readonly route = inject(ActivatedRoute);
  private readonly certificatesService = inject(CertificatesService);
  private readonly organizationsService = inject(OrganizationsService);

  readonly organizationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: this.route.snapshot.paramMap.get('orgId') }
  );

  readonly page = signal(0);
  readonly size = signal(10);

  readonly organizationQuery = this.organizationsService.getOrganizationQuery(this.organizationId);
  readonly organization = computed(() => this.organizationQuery.data());
  readonly certificatesQuery = this.certificatesService.organizationCertificatesQuery(
    this.organizationId,
    this.page,
    this.size
  );

  readonly certificates = computed(() => this.certificatesQuery.data()?.items ?? []);
  readonly pageInfo = computed(() => {
    const data = this.certificatesQuery.data();
    return {
      page: data?.page ?? 0,
      size: data?.size ?? 10,
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
      hasNext: (data?.page ?? 0) + 1 < (data?.totalPages ?? 0),
      hasPrevious: (data?.page ?? 0) > 0,
    };
  });

  goToPage(page: number): void {
    this.page.set(page);
  }
}
