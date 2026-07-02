import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InvitationsService } from '../../services/invitations.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [
    CardComponent,
    ErrorStateComponent,
    LoadingStateComponent,
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

  readonly error = signal<string | null>(null);
  readonly hasAttempted = signal(false);

  constructor() {
    effect(() => {
      const code = this.code();
      if (code && !this.hasAttempted()) {
        this.hasAttempted.set(true);
        this.join(code);
      }
    });
  }

  join(code: string): void {
    this.error.set(null);
    this.invitationsService.joinMutation.mutate(code, {
      onSuccess: (invitation) => {
        this.router.navigate(['/programs', invitation.programId, 'learn']);
      },
      onError: (error) => {
        this.error.set(error.message ?? 'Failed to join the program.');
      },
    });
  }

  retry(): void {
    const code = this.code();
    if (code) {
      this.join(code);
    }
  }
}
