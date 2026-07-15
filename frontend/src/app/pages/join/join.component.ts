import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Invitation } from '../../core/models/invitation.model';
import { InvitationsService } from '../../services/invitations.service';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    CardComponent,
    ErrorStateComponent,
    FormFieldComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss',
})
export class JoinComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly invitationsService = inject(InvitationsService);
  private readonly auth = inject(AuthService);

  readonly code = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('code'))),
    { initialValue: null }
  );

  readonly inputCode = signal('');
  readonly error = signal<string | null>(null);
  readonly joining = signal(false);
  private readonly attempted = signal<Set<string>>(new Set());

  constructor() {
    // Keep the public preview query pointed at the current code.
    effect(() => {
      this.invitationsService.previewCode.set(this.code());
    });

    // Unauthenticated recipients are sent to sign-in, preserving the join link.
    effect(() => {
      const code = this.code();
      if (code && !this.auth.isSignedIn()) {
        this.router.navigate(['/sign-in'], { queryParams: { redirect: `/join/${code}` } });
      }
    });

    // Authenticated recipients auto-join once the preview has loaded.
    effect(() => {
      const code = this.code();
      const preview = this.invitationsService.previewQuery.data();
      if (!code || !this.auth.isSignedIn()) {
        return;
      }
      if (this.invitationsService.previewQuery.isLoading() || this.invitationsService.previewQuery.isPending()) {
        return;
      }
      if (this.attempted().has(code)) {
        return;
      }
      this.attempted.update((set) => new Set(set).add(code));
      this.join(code, preview?.valid ?? true);
    });
  }

  join(code: string, valid: boolean = true): void {
    if (!valid) {
      this.error.set('This invitation is no longer valid.');
      return;
    }
    this.error.set(null);
    this.joining.set(true);
    this.invitationsService.joinMutation.mutate(code, {
      onSuccess: (invitation: Invitation) => this.navigateOnSuccess(invitation),
      onError: (error) => {
        this.joining.set(false);
        this.error.set(error.message ?? 'Failed to join the program.');
      },
    });
  }

  accept(): void {
    const code = this.code();
    if (code) {
      this.join(code);
    }
  }

  submitInput(): void {
    const code = this.inputCode().trim();
    if (code) {
      this.join(code);
    }
  }

  retry(): void {
    const code = this.code();
    if (code) {
      this.join(code);
    } else {
      this.submitInput();
    }
  }

  private navigateOnSuccess(invitation: Invitation): void {
    if (invitation.programId) {
      this.router.navigate(['/programs', invitation.programId, 'learn']);
    } else {
      this.router.navigate(['/organizations']);
    }
  }
}
