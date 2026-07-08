import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.html',
})
export class VerifyEmail {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isLoading.set(false);
      this.error.set('Verification token is missing.');
      return;
    }

    this.verify(token);
  }

  private async verify(token: string): Promise<void> {
    try {
      await this.auth.verifyEmail({ token });
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Email verification failed.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
