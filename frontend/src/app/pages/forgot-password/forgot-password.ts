import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly isSuccess = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.auth.forgotPassword(this.form.getRawValue());
      this.isSuccess.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Request failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
