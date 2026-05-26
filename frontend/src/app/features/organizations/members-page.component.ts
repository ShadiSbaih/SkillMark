import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { MembersApi } from '../../core/api/members.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Organization" title="Members" description="Add existing users by UUID and review membership status." />
    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light">Add member</h2>
        <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="add()">
          <label class="app-label">User UUID *
            <input class="app-input app-focus" placeholder="Paste backend user id" formControlName="userId" />
          </label>
          <label class="app-label">Role
            <select class="app-input app-focus" formControlName="role">
              <option value="PARTICIPANT">PARTICIPANT</option>
              <option value="OWNER">OWNER</option>
            </select>
          </label>
          <app-button type="submit" [disabled]="form.invalid || addMutation.isPending()">Add</app-button>
        </form>
      </app-card>
      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No members found" description="Memberships will appear here after users are added or join programs." />
        } @else {
          <div class="grid gap-3">
            @for (member of query.data()?.items ?? []; track member.id) {
              <app-card>
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-normal">{{ member.userName || member.userEmail }}</p>
                    <p class="text-xs text-[var(--color-ink-mute)]">{{ member.userEmail }} · {{ member.role }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <app-status-badge [status]="member.status" />
                    @if (member.role !== 'OWNER') {
                      <app-button variant="ghost" (click)="remove(member.userId)">Remove</app-button>
                    }
                  </div>
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
export class MembersPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MembersApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? '';
  readonly page = signal(0);

  readonly form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    role: this.fb.nonNullable.control<'OWNER' | 'PARTICIPANT'>('PARTICIPANT'),
  });

  readonly query = injectQuery(() => ({
    queryKey: ['members', this.organizationId, this.page()],
    enabled: !!this.organizationId,
    queryFn: () => this.api.list(this.organizationId, this.page(), 10),
  }));

  readonly addMutation = injectMutation(() => ({
    mutationFn: () => this.api.add(this.organizationId, this.form.getRawValue()),
    onSuccess: async () => {
      this.form.reset({ userId: '', role: 'PARTICIPANT' });
      await this.queryClient.invalidateQueries({ queryKey: ['members', this.organizationId] });
      toast.success('Member added');
    },
  }));

  readonly removeMutation = injectMutation(() => ({
    mutationFn: (userId: string) => this.api.remove(this.organizationId, userId),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['members', this.organizationId] });
      toast.success('Member removed');
    },
  }));

  add(): void {
    if (this.form.valid) {
      this.addMutation.mutate();
    }
  }

  remove(userId: string): void {
    this.removeMutation.mutate(userId);
  }
}

