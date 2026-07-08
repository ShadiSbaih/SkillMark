import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Invitation } from '../../core/models/invitation.model';
import { InvitationsService } from '../../services/invitations.service';
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

  readonly code = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('code'))),
    { initialValue: null }
  );

  readonly inputCode = signal('');
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const code = this.code();
      this.invitationsService.previewCode.set(code);
      this.error.set(null);
    });
  }

  join(code: string): void {
    this.error.set(null);
    this.invitationsService.joinMutation.mutate(code, {
      onSuccess: (invitation) => {
        this.navigateOnSuccess(invitation);
      },
      onError: (error) => {
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
