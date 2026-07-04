import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { CertificateResponse } from '../../core/models/certificate.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-organization-certificates',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './organization-certificates.html',
  styleUrl: './organization-certificates.scss',
})
export class OrganizationCertificates {
  private readonly route = inject(ActivatedRoute);
  private readonly certificatesService = inject(CertificatesService);

  readonly organizationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: this.route.snapshot.paramMap.get('orgId') }
  );

  readonly page = signal(0);
  readonly size = signal(10);

  readonly certificatesQuery = this.certificatesService.organizationCertificatesQuery(
    this.organizationId,
    this.page,
    this.size
  );

  readonly certificates = computed(() => this.certificatesQuery.data()?.items ?? []);
  readonly totalPages = computed(() => this.certificatesQuery.data()?.totalPages ?? 0);

  revoke(certificate: CertificateResponse): void {
    const reason = window.prompt('Enter revocation reason');
    if (!reason) return;
    this.certificatesService.revokeMutation.mutate(
      { certificateId: certificate.id, request: { reason } },
      {
        onSuccess: () => toast.success('Certificate revoked'),
        onError: (err) => toast.error(err.message ?? 'Failed to revoke certificate'),
      }
    );
  }

  previousPage(): void {
    this.page.update((p) => Math.max(0, p - 1));
  }

  nextPage(): void {
    this.page.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }
}
