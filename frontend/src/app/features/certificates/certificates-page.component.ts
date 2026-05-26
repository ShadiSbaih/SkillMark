import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { CertificatesApi } from '../../core/api/certificates.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-certificates-page',
  standalone: true,
  imports: [RouterLink, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Certificates" [title]="organizationId ? 'Organization certificates' : 'My certificates'" description="Review issued certificates and verification codes." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if ((query.data()?.items?.length ?? 0) === 0) {
      <app-empty-state title="No certificates found" description="Certificates appear after passing eligible quizzes or manual issue." />
    } @else {
      <div class="grid gap-3">
        @for (certificate of query.data()?.items ?? []; track certificate.id) {
          <app-card>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <a [routerLink]="['/certificates', certificate.id]" class="text-lg font-light">{{ certificate.title }}</a>
                <p class="font-tabular text-xs text-[var(--color-ink-mute)]">{{ certificate.certificateNumber }} · {{ certificate.verificationCode }}</p>
                <p class="text-sm text-[var(--color-ink-mute)]">{{ certificate.participantNameSnapshot }} · {{ certificate.programTitleSnapshot }}</p>
              </div>
              <app-status-badge [status]="certificate.status" />
            </div>
          </app-card>
        }
      </div>
      <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
    }
  `,
})
export class CertificatesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CertificatesApi);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? '';
  readonly page = signal(0);
  readonly query = injectQuery(() => ({
    queryKey: ['certificates', this.organizationId || 'me', this.page()],
    queryFn: () => this.organizationId ? this.api.organizationCertificates(this.organizationId, this.page(), 10) : this.api.mine(this.page(), 10),
  }));
}

@Component({
  selector: 'app-certificate-detail-page',
  standalone: true,
  imports: [ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as certificate) {
      <app-page-header eyebrow="Certificate" [title]="certificate.title" [description]="certificate.participantNameSnapshot">
        @if (certificate.pdfUrl) {
          <a [href]="certificate.pdfUrl" target="_blank" rel="noopener"><app-button>Download PDF</app-button></a>
        }
        <app-button variant="secondary" (click)="revoke(certificate.id)">Revoke</app-button>
      </app-page-header>
      <section class="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <app-card>
          <div class="flex justify-between gap-3">
            <div>
              <p class="font-tabular text-2xl font-light">{{ certificate.certificateNumber }}</p>
              <p class="font-tabular mt-1 text-sm text-[var(--color-ink-mute)]">Verification {{ certificate.verificationCode }}</p>
            </div>
            <app-status-badge [status]="certificate.status" />
          </div>
          <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div><dt class="text-xs text-[var(--color-ink-mute)]">Program</dt><dd>{{ certificate.programTitleSnapshot }}</dd></div>
            <div><dt class="text-xs text-[var(--color-ink-mute)]">Quiz</dt><dd>{{ certificate.quizTitleSnapshot }}</dd></div>
            <div><dt class="text-xs text-[var(--color-ink-mute)]">Organization</dt><dd>{{ certificate.organizationNameSnapshot }}</dd></div>
            <div><dt class="text-xs text-[var(--color-ink-mute)]">Issued</dt><dd class="font-tabular">{{ certificate.issuedAt }}</dd></div>
          </dl>
        </app-card>
        <app-card tone="dark">
          <p class="text-sm opacity-75">QR code</p>
          @if (certificate.qrCodeUrl) {
            <img class="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-canvas)] p-2" [src]="certificate.qrCodeUrl" alt="Certificate QR code" />
          } @else {
            <p class="mt-4 text-sm opacity-80">No QR image is attached.</p>
          }
        </app-card>
      </section>
    }
  `,
})
export class CertificateDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CertificatesApi);
  private readonly queryClient = inject(QueryClient);
  readonly certificateId = this.route.snapshot.paramMap.get('certificateId') ?? '';
  readonly query = injectQuery(() => ({ queryKey: ['certificates', this.certificateId], queryFn: () => this.api.get(this.certificateId) }));
  readonly revokeMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.revoke(id, { reason: 'Revoked from frontend' }),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.warning('Certificate revoked');
    },
  }));

  revoke(id: string): void {
    this.revokeMutation.mutate(id);
  }
}
