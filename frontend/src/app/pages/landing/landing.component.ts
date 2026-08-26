import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly certificatesService = inject(CertificatesService);
  private readonly router = inject(Router);

  readonly verificationCode = signal('');

  readonly verifyQuery = this.certificatesService.verifyPublicCertificateQuery(
    () => null
  );

  verify(): void {
    const code = this.verificationCode().trim().toUpperCase();
    if (!code) {
      return;
    }
    this.router.navigate(['/verify', code]);
  }
}
