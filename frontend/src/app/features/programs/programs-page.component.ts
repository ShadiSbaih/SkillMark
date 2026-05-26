import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { ProgramsApi } from '../../core/api/programs.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-programs-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, ConfirmDialogComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Organization" title="Programs" description="Create workshops and manage publication state." />
    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light">Create program</h2>
        <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="create()">
          <label class="app-label">Title *
            <input class="app-input app-focus" placeholder="Program title" formControlName="title" />
          </label>
          <label class="app-label">Description
            <textarea class="app-input app-focus min-h-24" placeholder="What participants will learn" formControlName="description"></textarea>
          </label>
          <label class="app-label">Cover image URL
            <input class="app-input app-focus" placeholder="https://..." formControlName="coverImageUrl" />
          </label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="app-label">Start date
              <input class="app-input app-focus" type="date" formControlName="startDate" />
            </label>
            <label class="app-label">End date
              <input class="app-input app-focus" type="date" formControlName="endDate" />
            </label>
          </div>
          <app-button type="submit" [disabled]="form.invalid || createMutation.isPending()">Create program</app-button>
        </form>
      </app-card>

      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No programs yet" description="Create your first program to add resources, quizzes, and invitations." />
        } @else {
          <div class="app-table-shell">
            <table class="app-table">
              <thead><tr><th>Program</th><th>Dates</th><th>Status</th><th></th></tr></thead>
              <tbody>
                @for (program of query.data()?.items ?? []; track program.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/programs', program.id]" class="table-primary-link">{{ program.title }}</a>
                      <p>{{ program.description || 'No description' }}</p>
                    </td>
                    <td class="font-tabular">{{ program.startDate || 'No start' }} -> {{ program.endDate || 'No end' }}</td>
                    <td><app-status-badge [status]="program.status" /></td>
                    <td class="table-actions">
                      <a [routerLink]="['/programs', program.id]"><app-button variant="secondary">Open</app-button></a>
                      <app-button variant="ghost" (click)="publish(program.id)">Publish</app-button>
                      <app-button variant="ghost" (click)="pendingArchiveId = program.id">Archive</app-button>
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
      [open]="!!pendingArchiveId"
      title="Archive program"
      message="Archive this program and remove it from active participant workflows?"
      (cancel)="pendingArchiveId = null"
      (confirm)="archive(pendingArchiveId!)"
    />
  `,
})
export class ProgramsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProgramsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? '';
  readonly page = signal(0);
  pendingArchiveId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    coverImageUrl: [''],
    startDate: [''],
    endDate: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['programs', this.organizationId, this.page()],
    enabled: !!this.organizationId,
    queryFn: () => this.api.listByOrganization(this.organizationId, this.page(), 10),
  }));

  readonly createMutation = injectMutation(() => ({
    mutationFn: () => this.api.create(this.organizationId, this.form.getRawValue()),
    onSuccess: async () => {
      this.form.reset();
      await this.queryClient.invalidateQueries({ queryKey: ['programs', this.organizationId] });
      toast.success('Program created');
    },
  }));

  readonly statusMutation = injectMutation(() => ({
    mutationFn: ({ id, action }: { id: string; action: 'publish' | 'archive' }) => action === 'publish' ? this.api.publish(id) : this.api.archive(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['programs', this.organizationId] });
      toast.success('Program status updated');
    },
  }));

  create(): void {
    if (this.form.valid) {
      this.createMutation.mutate();
    }
  }

  publish(id: string): void {
    this.statusMutation.mutate({ id, action: 'publish' });
  }

  archive(id: string): void {
    this.pendingArchiveId = null;
    this.statusMutation.mutate({ id, action: 'archive' });
  }
}
