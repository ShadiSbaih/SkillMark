import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { environment } from '../../../environments/environment';
import { InvitationsApi } from '../../core/api/invitations.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-invitations-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, ConfirmDialogComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Program" title="Invitations" description="Create invitation codes and copy participant join links." />
    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light">Create invitation</h2>
        <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="create()">
          <label class="app-label">Description
            <textarea class="app-input app-focus min-h-24" placeholder="Cohort or invite context" formControlName="description"></textarea>
          </label>
          <label class="app-label">Max uses
            <input class="app-input app-focus" type="number" min="1" placeholder="Leave empty for unlimited" formControlName="maxUses" />
          </label>
          <label class="app-label">Expires at
            <input class="app-input app-focus" type="datetime-local" formControlName="expiresAt" />
          </label>
          <app-button type="submit" [disabled]="createMutation.isPending()">Create invitation</app-button>
        </form>
      </app-card>

      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No invitations yet" description="Create an invitation to let participants join this program." />
        } @else {
          <div class="app-table-shell">
            <table class="app-table">
              <thead><tr><th>Code</th><th>Description</th><th>Usage</th><th>Status</th><th></th></tr></thead>
              <tbody>
                @for (invitation of query.data()?.items ?? []; track invitation.id) {
                  <tr>
                    <td class="font-tabular">{{ invitation.code }}</td>
                    <td>{{ invitation.description || 'No description' }}</td>
                    <td class="font-tabular">{{ invitation.usedCount }} / {{ invitation.maxUses || 'unlimited' }}</td>
                    <td><app-status-badge [status]="invitation.status" /></td>
                    <td class="table-actions">
                      <app-button variant="secondary" (click)="copy(invitation.code)">Copy link</app-button>
                      <app-button variant="ghost" (click)="pendingDisableId = invitation.id">Disable</app-button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
        }
      </div>
    </section>

    <app-confirm-dialog
      [open]="!!pendingDisableId"
      title="Disable invitation"
      message="Disable this invitation link so new participants cannot use it?"
      (cancel)="pendingDisableId = null"
      (confirm)="disable(pendingDisableId!)"
    />
  `,
})
export class InvitationsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(InvitationsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);
  pendingDisableId: string | null = null;
  readonly form = this.fb.group({
    description: [''],
    maxUses: [null as number | null],
    expiresAt: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['invitations', this.programId, this.page()],
    enabled: !!this.programId,
    queryFn: () => this.api.list(this.programId, this.page(), 10),
  }));

  readonly createMutation = injectMutation(() => ({
    mutationFn: () => {
      const raw = this.form.getRawValue();
      return this.api.create(this.programId, {
        description: raw.description,
        maxUses: raw.maxUses,
        expiresAt: raw.expiresAt ? new Date(raw.expiresAt).toISOString() : null,
      });
    },
    onSuccess: async () => {
      this.form.reset();
      await this.queryClient.invalidateQueries({ queryKey: ['invitations', this.programId] });
      toast.success('Invitation created');
    },
  }));

  readonly disableMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.disable(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['invitations', this.programId] });
      toast.warning('Invitation disabled');
    },
  }));

  create(): void {
    this.createMutation.mutate();
  }

  disable(id: string): void {
    this.pendingDisableId = null;
    this.disableMutation.mutate(id);
  }

  copy(code: string): void {
    const url = `${environment.appBaseUrl}/join/${code}`;
    void navigator.clipboard.writeText(url);
    toast.info('Invitation link copied to clipboard');
  }
}
