import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { InvitationsService } from '../../services/invitations.service';
import { ProgramsService } from '../../services/programs.service';
import { Invitation, InvitationStatus } from '../../core/models/invitation.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
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
    PaginationComponent,
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
  readonly programsService = inject(ProgramsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());

  readonly pageTitle = computed(() => {
    const title = this.programQuery.data()?.title;
    return title ? `Invitations: ${title}` : 'Invitations';
  });

  readonly invitationsQuery = this.invitationsService.invitationsQuery;
  readonly maxUses = signal<number | null>(100);
  readonly emails = signal<string>('');
  readonly lastCreated = signal<Invitation | null>(null);

  readonly isCreating = computed(() => this.invitationsService.createMutation.isPending());

  readonly pageInfo = computed(() => {
    const data = this.invitationsQuery.data();
    const page = data?.page ?? 0;
    const totalPages = data?.totalPages ?? 0;
    return {
      page,
      size: data?.size ?? 10,
      totalElements: data?.totalElements ?? 0,
      totalPages,
      hasNext: page + 1 < totalPages,
      hasPrevious: page > 0,
    };
  });

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
    navigator.clipboard.writeText(url).then(
      () => toast.success('Invitation link copied'),
      () => toast.error('Failed to copy link')
    );
  }

  createInvitation(): void {
    const programId = this.programId();
    if (!programId) return;

    const max = this.maxUses();
    const rawEmails = this.emails().split(',').map((e) => e.trim()).filter(Boolean);
    const request = {
      description: null,
      maxUses: max !== null && !Number.isNaN(max) ? max : null,
      expiresAt: null,
      emails: rawEmails.length > 0 ? rawEmails : null,
    };

    this.invitationsService.createMutation.mutate(
      { programId, request },
      {
        onSuccess: (created) => {
          this.lastCreated.set(created);
          this.emails.set('');
          this.maxUses.set(100);
          toast.success(
            rawEmails.length > 0
              ? 'Invitation created and sent by email'
              : 'Invitation created'
          );
        },
        onError: (error) => {
          toast.error(error.message ?? 'Failed to create invitation');
        },
      }
    );
  }

  disable(invitationId: string): void {
    this.invitationsService.disableMutation.mutate(invitationId, {
      onSuccess: () => toast.success('Invitation disabled'),
      onError: (error) => toast.error(error.message ?? 'Failed to disable invitation'),
    });
  }

  goToPage(page: number): void {
    const id = this.programId();
    this.invitationsService.listParams.update((params) => ({
      ...params,
      programId: id ?? null,
      page,
    }));
  }

  trackById(_index: number, invitation: Invitation): string {
    return invitation.id;
  }
}
