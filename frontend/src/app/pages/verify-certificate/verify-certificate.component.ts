import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PublicCertificateVerificationResponse } from '../../core/models/certificate.model';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './verify-certificate.component.html',
  styleUrl: './verify-certificate.component.scss',
})
export class VerifyCertificateComponent {
  private readonly certificatesService = inject(CertificatesService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly inputCode = signal('');
  readonly submittedCode = signal<string | null>(null);

  readonly routeCode = computed(() => {
    const code = this.route.snapshot.paramMap.get('verificationCode');
    return code?.trim() ? code.trim().toUpperCase() : null;
  });

  readonly verificationCode = computed(() => this.routeCode() ?? this.submittedCode());
  readonly hasCode = computed(() => !!this.verificationCode());

  readonly query = this.certificatesService.verifyPublicCertificateQuery(() => this.verificationCode());

  readonly result = computed<PublicCertificateVerificationResponse | null | undefined>(() =>
    this.hasCode() ? this.query.data() : null
  );

  constructor() {
    const code = this.routeCode();
    if (code) {
      this.inputCode.set(code);
      this.submittedCode.set(code);
    }
  }

  verify(): void {
    const code = this.inputCode().trim().toUpperCase();
    if (!code) {
      return;
    }
    this.submittedCode.set(code);
    this.router.navigate(['/verify', code], { replaceUrl: true });
  }

  statusVariant(status: string): 'success' | 'danger' | 'default' {
    return status === 'ACTIVE' ? 'success' : status === 'REVOKED' ? 'danger' : 'default';
  }
}
