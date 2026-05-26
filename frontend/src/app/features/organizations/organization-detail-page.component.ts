import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-organization-detail-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as org) {
      <app-page-header eyebrow="Organization" [title]="org.name" [description]="org.description || 'Organization workspace'">
        <a [routerLink]="['/organizations', org.id, 'programs']"><app-button>Programs</app-button></a>
        <a [routerLink]="['/organizations', org.id, 'members']"><app-button variant="secondary">Members</app-button></a>
      </app-page-header>

      <section class="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <app-card>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-light tracking-[-0.2px]">Settings</h2>
            <app-status-badge [status]="org.status" />
          </div>
          <form class="mt-5 grid gap-3" [formGroup]="form" (ngSubmit)="save(org.id)">
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" formControlName="name" />
            <textarea class="app-focus min-h-28 rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" formControlName="description"></textarea>
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" formControlName="logoUrl" />
            <app-button type="submit" [disabled]="form.invalid || updateMutation.isPending()">Save</app-button>
          </form>
        </app-card>

        <app-card tone="dark">
          <p class="text-sm opacity-75">Created</p>
          <p class="font-tabular mt-2 text-lg">{{ org.createdAt | date:'medium' }}</p>
          <div class="mt-6 grid gap-2 text-sm">
            <a [routerLink]="['/organizations', org.id, 'stats']" class="rounded-lg bg-white/10 p-3">Statistics</a>
            <a [routerLink]="['/organizations', org.id, 'audit-logs']" class="rounded-lg bg-white/10 p-3">Audit logs</a>
            <a [routerLink]="['/organizations', org.id, 'certificates']" class="rounded-lg bg-white/10 p-3">Certificates</a>
          </div>
        </app-card>
      </section>
    }
  `,
})
export class OrganizationDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(OrganizationsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? this.route.snapshot.paramMap.get('organizationId') ?? '';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    logoUrl: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['organizations', this.organizationId],
    queryFn: async () => {
      const org = await this.api.get(this.organizationId);
      this.form.patchValue({
        name: org.name,
        description: org.description ?? '',
        logoUrl: org.logoUrl ?? '',
      });
      return org;
    },
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.update(id, this.form.getRawValue()),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization updated');
    },
  }));

  save(id: string): void {
    if (this.form.valid) {
      this.updateMutation.mutate(id);
    }
  }
}

