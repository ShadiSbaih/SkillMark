import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CertificatesApi } from '../../core/api/certificates.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { ErrorStateComponent } from '../../shared/ui/error-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-verification-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent, ErrorStateComponent, LoadingStateComponent, StatusBadgeComponent],
  template: `
    <section class="container-shell app-section">
      <app-card>
        <p class="app-eyebrow">Public verification</p>
        <h1 class="display-lg">Verify a certificate</h1>
        <form class="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" (ngSubmit)="go()">
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
      </app-card>

      <div class="mt-6">
        @if (activeCode()) {
          @if (query.isPending()) {
            <app-loading-state />
          } @else if (query.isError()) {
            <app-error-state title="Certificate not found" message="No public certificate matched that verification code." />
          } @else if (query.data(); as certificate) {
            <app-card [tone]="certificate.isRevoked ? 'cream' : 'light'">
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

