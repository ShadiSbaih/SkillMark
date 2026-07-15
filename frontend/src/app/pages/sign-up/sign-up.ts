import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService, RegisterRequest } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSuccess = signal(false);

  readonly redirect = signal<string | null>(this.route.snapshot.queryParamMap.get('redirect'));

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    organizationName: [''],
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

    const orgName = values.organizationName.trim();
    const request: RegisterRequest = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      ...(orgName ? { role: 'OWNER', organizationName: orgName } : {}),
    };

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.auth.register(request);
      this.isSuccess.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
