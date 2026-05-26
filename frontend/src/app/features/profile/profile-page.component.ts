import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth/auth.service';
import { UserApi } from '../../core/api/users.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent],
  template: `
    <app-page-header eyebrow="Profile" title="Your local Skillmark profile" description="These fields are synced with the backend user profile linked to Clerk." />

    @if (query.isPending()) {
      <app-loading-state />
    } @else {
      <app-card>
        <form class="grid gap-4" [formGroup]="form" (ngSubmit)="save()">
          <label class="grid gap-1 text-sm">
            Name
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2" formControlName="name" />
          </label>
          <label class="grid gap-1 text-sm">
            Email
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2" formControlName="email" />
          </label>
          <label class="grid gap-1 text-sm">
            Avatar URL
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2" formControlName="avatarUrl" />
          </label>
          <div class="flex gap-2">
            <app-button type="submit" [disabled]="form.invalid || mutation.isPending()">Save profile</app-button>
            <app-button variant="ghost" type="button" (click)="signOut()">Sign out</app-button>
          </div>
        </form>
      </app-card>
    }
  `,
})
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(UserApi);
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    avatarUrl: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const user = await this.auth.refreshProfile();
      this.form.patchValue({
        name: user.name ?? '',
        email: user.email ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
      return user;
    },
  }));

  readonly mutation = injectMutation(() => ({
    mutationFn: () => this.api.updateMe(this.form.getRawValue()),
    onSuccess: async (user) => {
      this.auth.currentUser.set(user);
      await this.queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated');
    },
  }));

  save(): void {
    if (this.form.valid) {
      this.mutation.mutate();
    }
  }

  signOut(): void {
    void this.auth.signOut();
  }
}

