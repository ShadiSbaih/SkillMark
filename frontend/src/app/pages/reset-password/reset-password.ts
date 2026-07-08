import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.route.snapshot.queryParamMap.get('token'));
  readonly isLoading = signal(false);
  readonly isSuccess = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (values.password !== values.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    const token = this.token();
    if (!token) {
      this.error.set('Reset token is missing.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.auth.resetPassword({ token, password: values.password });
      this.isSuccess.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
