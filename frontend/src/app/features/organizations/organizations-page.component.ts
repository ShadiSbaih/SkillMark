import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-organizations-page',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header eyebrow="Owner" title="Organizations" description="Create and manage organizations that own programs, members, quizzes, and certificates." />

    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light tracking-[-0.2px]">Create organization</h2>
        <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="create()">
          <label class="app-label">Name *
            <input class="app-input app-focus" placeholder="Organization name" formControlName="name" />
          </label>
          <label class="app-label">Description
            <textarea class="app-input app-focus min-h-28" placeholder="Short internal summary" formControlName="description"></textarea>
          </label>
          <label class="app-label">Logo URL
            <input class="app-input app-focus" placeholder="https://..." formControlName="logoUrl" />
          </label>
          <app-button type="submit" [disabled]="form.invalid || createMutation.isPending()">Create</app-button>
        </form>
      </app-card>

      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if (query.isError()) {
          <app-error-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No organizations yet" description="Create an organization to unlock owner workflows." />
        } @else {
          <div class="grid gap-4">
            @for (org of query.data()?.items ?? []; track org.id) {
              <app-card>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <a [routerLink]="['/organizations', org.id]" class="text-xl font-light tracking-[-0.2px] text-[var(--color-ink)]">{{ org.name }}</a>
                    <p class="mt-1 text-sm leading-6 text-[var(--color-ink-mute)]">{{ org.description || 'No description' }}</p>
                    <p class="font-tabular mt-2 text-xs text-[var(--color-ink-mute)]">Created {{ org.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <app-status-badge [status]="org.status" />
                </div>
                <div class="mt-5 flex flex-wrap gap-2">
                  <a [routerLink]="['/organizations', org.id]"><app-button variant="secondary">Overview</app-button></a>
                  <a [routerLink]="['/organizations', org.id, 'programs']"><app-button variant="ghost">Programs</app-button></a>
                  <a [routerLink]="['/organizations', org.id, 'members']"><app-button variant="ghost">Members</app-button></a>
                </div>
              </app-card>
            }
          </div>
          <app-pagination
            [page]="page()"
            [totalPages]="query.data()?.totalPages ?? 0"
            [totalElements]="query.data()?.totalElements ?? 0"
            (pageChange)="page.set($event)"
          />
        }
      </div>
    </section>
  `,
})
export class OrganizationsPageComponent {
  private readonly api = inject(OrganizationsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);

  readonly page = signal(0);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    logoUrl: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['organizations', this.page()],
    queryFn: () => this.api.list(this.page(), 10),
  }));

  readonly createMutation = injectMutation(() => ({
    mutationFn: () => this.api.create(this.form.getRawValue()),
    onSuccess: async () => {
      this.form.reset();
      await this.queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
  }));

  create(): void {
    if (this.form.valid) {
      this.createMutation.mutate();
    }
  }
}

