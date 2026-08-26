import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly redirectUrl = signal<string | null>(this.route.snapshot.queryParamMap.get('redirect'));

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const user = await this.auth.login(this.form.getRawValue());
      const redirect = this.redirectUrl();
      if (redirect) {
        await this.router.navigate([redirect]);
      } else {
        await this.router.navigate([user.role === 'ADMIN' ? '/programs' : '/my-enrollments']);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  loginAsAdminDemo(): void {
    this.redirectUrl.set(null);
    this.form.patchValue({
      email: 'maya.owner@skillmark.local',
      password: 'Skillmark2024!'
    });
    this.onSubmit();
  }

  loginAsStudentDemo(): void {
    this.redirectUrl.set(null);
    this.form.patchValue({
      email: 'omar.learner@skillmark.local',
      password: 'Skillmark2024!'
    });
    this.onSubmit();
  }
}
