import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { CertificatesService } from '../../services/certificates.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
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
  readonly router = inject(Router);

  readonly certificateId = input<string | null>(null);
  readonly query = this.certificatesService.getCertificateQuery(() => this.certificateId());

  readonly certificate = computed(() => this.query.data());
  readonly verificationUrl = computed(() => {
    const code = this.certificate()?.verificationCode;
    return code ? `${environment.appBaseUrl}/verify/${code}` : null;
  });

  statusVariant(status: string): 'success' | 'danger' | 'default' {
    return status === 'ACTIVE' ? 'success' : status === 'REVOKED' ? 'danger' : 'default';
  }

  openPdf(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  async share(): Promise<void> {
    const url = this.verificationUrl();
    if (!url) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Skillmark certificate', url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Verification link copied to clipboard');
    }
  }
}
