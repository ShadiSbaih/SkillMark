import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { certificates, Certificate } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './verify-certificate.component.html',
  styleUrl: './verify-certificate.component.scss',
})
export class VerifyCertificateComponent {
  code = 'A3FX9KL2MN8PQR7Z';
  result: Certificate | null = certificates[0] ?? null;
  searched = true;

  constructor(route: ActivatedRoute) {
    const paramCode = route.snapshot.paramMap.get('verificationCode');
    if (paramCode) {
      this.code = paramCode;
      this.verify();
    }
  }

  verify(): void {
    this.searched = true;
    const normalized = this.code.trim().toUpperCase();
    this.result = certificates.find((certificate) => certificate.verificationCode === normalized) ?? null;
  }
}
