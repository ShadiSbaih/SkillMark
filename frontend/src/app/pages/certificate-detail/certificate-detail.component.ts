import { Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './certificate-detail.component.html',
  styleUrl: './certificate-detail.component.scss',
})
export class CertificateDetailComponent {
  private readonly certificatesService = inject(CertificatesService);
  private readonly clerk = inject(ClerkService);
  readonly router = inject(Router);

  readonly certificateId = input<string | null>(null);
  readonly query = this.certificatesService.getCertificateQuery(() => this.certificateId());

  readonly certificate = computed(() => {
    const cert = this.query.data();
    if (!cert) return null;
    
    // If this certificate belongs to the current user, use their Clerk profile name for a better display
    const clerkUser = this.clerk.user();
    if (clerkUser && clerkUser.id === cert.userId) {
      const bestName = clerkUser.fullName || clerkUser.username;
      if (bestName) {
        return { ...cert, participantNameSnapshot: bestName };
      }
    }
    
    return cert;
  });

  openPdf(): void {
    window.print();
  }
}
