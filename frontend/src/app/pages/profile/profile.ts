import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth/auth.service';
import { UsersService } from '../../services/users.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    FormFieldComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './profile.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  readonly usersService = inject(UsersService);

  readonly meQuery = this.usersService.meQuery;

  readonly authUser = this.auth.user;
  readonly avatarUrl = computed(() => this.meQuery.data()?.avatarUrl ?? undefined);
  readonly displayName = computed(() => this.meQuery.data()?.name ?? this.authUser()?.name ?? '');
  readonly email = computed(() => this.meQuery.data()?.email ?? this.authUser()?.email ?? '');

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    effect(() => {
      const user = this.meQuery.data();
      if (user) {
        this.form.patchValue({
          name: user.name ?? '',
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.usersService.updateMeMutation.mutate(
      {
        name: value.name ?? '',
      },
      {
        onSuccess: () => toast.success('Profile updated'),
        onError: (error: Error) => toast.error(error.message || 'Failed to update profile'),
      }
    );
  }
}
