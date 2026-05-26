import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { environment } from '../../../environments/environment';
import { InvitationsApi } from '../../core/api/invitations.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-invitations-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Program" title="Invitations" description="Create invitation codes and copy participant join links." />
    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light">Create invitation</h2>
        <form class="mt-5 grid gap-3" [formGroup]="form" (ngSubmit)="create()">
          <textarea class="app-focus min-h-24 rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Description" formControlName="description"></textarea>
          <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="number" min="1" placeholder="Max uses" formControlName="maxUses" />
          <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="datetime-local" formControlName="expiresAt" />
          <app-button type="submit" [disabled]="createMutation.isPending()">Create</app-button>
        </form>
      </app-card>
      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No invitations yet" description="Create an invitation to let participants join this program." />
        } @else {
          <div class="grid gap-4">
            @for (invitation of query.data()?.items ?? []; track invitation.id) {
              <app-card>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="font-tabular text-lg font-light">{{ invitation.code }}</p>
                    <p class="text-sm text-[var(--color-ink-mute)]">{{ invitation.description || 'No description' }}</p>
                    <p class="font-tabular mt-2 text-xs text-[var(--color-ink-mute)]">{{ invitation.usedCount }} / {{ invitation.maxUses || '∞' }} used</p>
                  </div>
                  <app-status-badge [status]="invitation.status" />
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <app-button variant="secondary" (click)="copy(invitation.code)">Copy join link</app-button>
                  <app-button variant="ghost" (click)="disable(invitation.id)">Disable</app-button>
                </div>
              </app-card>
            }
          </div>
          <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
        }
      </div>
    </section>
  `,
})
export class InvitationsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(InvitationsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);
  readonly form = this.fb.group({
    description: [''],
    maxUses: [null as number | null],
    expiresAt: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['invitations', this.programId, this.page()],
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
    this.disableMutation.mutate(id);
  }

  copy(code: string): void {
    const url = `${environment.certificateVerifyBaseUrl}/join/${code}`;
    void navigator.clipboard.writeText(url);
    toast.info('Invitation link copied');
  }
}

