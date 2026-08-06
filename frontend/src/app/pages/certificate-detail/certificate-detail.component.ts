import { Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ButtonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './certificate-detail.component.html',
  styleUrl: './certificate-detail.component.scss',
})
export class CertificateDetailComponent {
  private readonly certificatesService = inject(CertificatesService);
  private readonly auth = inject(AuthService);
  readonly router = inject(Router);

  readonly certificateId = input<string | null>(null);
  readonly query = this.certificatesService.getCertificateQuery(() => this.certificateId());

  readonly certificate = computed(() => {
    const cert = this.query.data();
    if (!cert) return null;

    const authUser = this.auth.user();
    if (authUser && authUser.id === cert.userId && authUser.name) {
      return { ...cert, participantNameSnapshot: authUser.name };
    }

    return cert;
  });

  openPdf(): void {
    const cert = this.certificate();
    if (cert?.pdfUrl) {
      window.open(cert.pdfUrl, '_blank');
    }
  }
}
