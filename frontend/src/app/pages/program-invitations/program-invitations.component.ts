import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InvitationsService } from '../../services/invitations.service';
import { Invitation, InvitationStatus } from '../../core/models/invitation.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-program-invitations',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './program-invitations.component.html',
  styleUrl: './program-invitations.component.scss',
})
export class ProgramInvitationsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly invitationsService = inject(InvitationsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly invitationsQuery = this.invitationsService.invitationsQuery;

  readonly showCreateForm = signal(false);
  readonly description = signal('');
  readonly maxUses = signal<number | null>(100);
  readonly expiresAt = signal('');

  constructor() {
    effect(() => {
      const id = this.programId();
      this.invitationsService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 10,
      });
    });
  }

  readonly isCreating = computed(() => this.invitationsService.createMutation.isPending());

  badgeVariant(status: InvitationStatus) {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DISABLED':
        return 'danger';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  }

  joinUrl(code: string): string {
    return `${window.location.origin}/join/${code}`;
  }

  copyCode(code: string): void {
    const url = this.joinUrl(code);
    navigator.clipboard.writeText(url).catch(() => {
      // Silently ignore clipboard errors.
    });
  }

  createInvitation(): void {
    const programId = this.programId();
    if (!programId) return;

    const max = this.maxUses();
    const request = {
      description: this.description().trim() || null,
      maxUses: max !== null && !Number.isNaN(max) ? max : null,
      expiresAt: this.expiresAt() || null,
    };

    this.invitationsService.createMutation.mutate(
      { programId, request },
      {
        onSuccess: () => {
          this.description.set('');
          this.maxUses.set(100);
          this.expiresAt.set('');
          this.showCreateForm.set(false);
        },
      }
    );
  }

  disable(invitationId: string): void {
    this.invitationsService.disableMutation.mutate(invitationId);
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((value) => !value);
  }
}
