import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CertificatesApi } from '../../core/api/certificates.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-verification-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent, LoadingStateComponent, StatusBadgeComponent],
  template: `
    <section class="verification-page">
      <div class="verification-heading">
        <p class="app-eyebrow">Public verification</p>
        <h1 class="display-lg">Certificate Verification</h1>
        <p>Enter a verification code or open a verification link to confirm certificate status.</p>
      </div>

      <app-card>
        <form class="verify-form" (ngSubmit)="go()">
          <label class="app-label">
            Verification code
            <input
              class="app-input app-focus flex-1"
              name="code"
              [(ngModel)]="code"
              placeholder="Paste the public code"
              required
            />
          </label>
          <app-button type="submit">Verify</app-button>
        </form>
        <div class="verification-divider"><span>OR</span></div>
        <p class="verification-note">If the code is in the URL, Skillmark auto-loads the certificate on page open.</p>
      </app-card>

      <div class="mt-6">
        @if (activeCode()) {
          @if (query.isPending()) {
            <app-loading-state />
          } @else if (query.isError()) {
            <div class="verification-result not-found">
              <p class="result-kicker">Not found</p>
              <h2>No certificate matched this code.</h2>
              <p>Check the code and try again. Public verification does not require sign in.</p>
            </div>
          } @else if (query.data(); as certificate) {
            <app-card [tone]="certificate.isRevoked ? 'cream' : 'light'">
              <p class="result-kicker">{{ certificate.isRevoked ? 'Revoked certificate' : 'Valid certificate' }}</p>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm text-[var(--color-ink-mute)]">Certificate number</p>
                  <p class="font-tabular text-2xl font-light">{{ certificate.certificateNumber }}</p>
                </div>
                <app-status-badge [status]="certificate.status" />
              </div>
              <dl class="mt-6 grid gap-4 sm:grid-cols-2">
                <div><dt class="text-xs text-[var(--color-ink-mute)]">Participant</dt><dd>{{ certificate.participantName }}</dd></div>
                <div><dt class="text-xs text-[var(--color-ink-mute)]">Organization</dt><dd>{{ certificate.organizationName }}</dd></div>
                <div><dt class="text-xs text-[var(--color-ink-mute)]">Program</dt><dd>{{ certificate.programTitle }}</dd></div>
                <div><dt class="text-xs text-[var(--color-ink-mute)]">Quiz</dt><dd>{{ certificate.quizTitle }}</dd></div>
              </dl>
              @if (certificate.isRevoked) {
                <p class="mt-5 rounded-[var(--radius-lg)] border border-[rgb(var(--ruby-rgb)/0.18)] bg-[rgb(var(--ruby-rgb)/0.08)] p-3 text-sm text-[var(--color-ink-secondary)]">Revoked: {{ certificate.revokeReason || 'No reason provided' }}</p>
              } @else {
                <p class="verification-valid-note">This certificate is active and matches Skillmark records.</p>
              }
            </app-card>
          }
        }
      </div>
    </section>
  `,
})
export class VerificationPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly certificates = inject(CertificatesApi);

  readonly activeCode = signal(this.route.snapshot.paramMap.get('verificationCode') ?? '');
  code = this.activeCode();

  readonly query = injectQuery(() => ({
    queryKey: ['certificate-verification', this.activeCode()],
    enabled: !!this.activeCode(),
    queryFn: () => this.certificates.verify(this.activeCode()),
    retry: false,
  }));

  go(): void {
    const nextCode = this.code.trim();
    if (!nextCode) {
      return;
    }
    this.activeCode.set(nextCode);
    void this.router.navigate(['/verify', nextCode]);
  }
}

