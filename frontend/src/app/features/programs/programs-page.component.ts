import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { ProgramsApi } from '../../core/api/programs.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-programs-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Organization" title="Programs" description="Create workshops and manage publication state." />
    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light">Create program</h2>
        <form class="mt-5 grid gap-3" [formGroup]="form" (ngSubmit)="create()">
          <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Title *" formControlName="title" />
          <textarea class="app-focus min-h-24 rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Description" formControlName="description"></textarea>
          <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Cover image URL" formControlName="coverImageUrl" />
          <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="date" formControlName="startDate" />
          <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="date" formControlName="endDate" />
          <app-button type="submit" [disabled]="form.invalid || createMutation.isPending()">Create</app-button>
        </form>
      </app-card>
      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No programs yet" description="Create your first program to add resources, quizzes, and invitations." />
        } @else {
          <div class="grid gap-4">
            @for (program of query.data()?.items ?? []; track program.id) {
              <app-card>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <a [routerLink]="['/programs', program.id]" class="text-xl font-light tracking-[-0.2px]">{{ program.title }}</a>
                    <p class="mt-1 text-sm text-[var(--color-ink-mute)]">{{ program.description || 'No description' }}</p>
                    <p class="font-tabular mt-2 text-xs text-[var(--color-ink-mute)]">{{ program.startDate || 'No start date' }} → {{ program.endDate || 'No end date' }}</p>
                  </div>
                  <app-status-badge [status]="program.status" />
                </div>
                <div class="mt-5 flex flex-wrap gap-2">
                  <a [routerLink]="['/programs', program.id]"><app-button variant="secondary">Open</app-button></a>
                  <app-button variant="ghost" (click)="publish(program.id)">Publish</app-button>
                  <app-button variant="ghost" (click)="archive(program.id)">Archive</app-button>
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
export class ProgramsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProgramsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? '';
  readonly page = signal(0);
  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    coverImageUrl: [''],
    startDate: [''],
    endDate: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['programs', this.organizationId, this.page()],
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
    this.statusMutation.mutate({ id, action: 'archive' });
  }
}
