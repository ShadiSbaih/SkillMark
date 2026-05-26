import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { StatsApi } from '../../core/api/stats.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-organization-detail-page',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent, StatCardComponent, StatusBadgeComponent],
  template: `
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as org) {
      @if (isSettings) {
        <app-page-header eyebrow="Organization" [breadcrumb]="'Organizations / ' + org.name + ' / Settings'" [title]="'Settings: ' + org.name" [description]="org.description || 'Update organization details'">
          <a [routerLink]="['/organizations', org.id]"><app-button variant="secondary">Overview</app-button></a>
        </app-page-header>

        <section class="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <app-card>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-light tracking-[-0.2px]">Organization details</h2>
              <app-status-badge [status]="org.status" />
            </div>
            <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="save(org.id)">
              <label class="app-label">Name *
                <input class="app-input app-focus" formControlName="name" />
              </label>
              <label class="app-label">Description
                <textarea class="app-input app-focus min-h-28" formControlName="description"></textarea>
              </label>
              <label class="app-label">Logo URL
                <input class="app-input app-focus" formControlName="logoUrl" />
              </label>
              <app-button type="submit" [disabled]="form.invalid || updateMutation.isPending()">Save changes</app-button>
            </form>
          </app-card>

          <app-card tone="dark">
            <p class="text-sm opacity-75">Created</p>
            <p class="font-tabular mt-2 text-lg">{{ org.createdAt | date:'medium' }}</p>
            <div class="mt-6 grid gap-2 text-sm">
              <a [routerLink]="['/organizations', org.id, 'stats']" class="tile dark">Statistics</a>
              <a [routerLink]="['/organizations', org.id, 'audit-logs']" class="tile dark">Audit logs</a>
              <a [routerLink]="['/organizations', org.id, 'certificates']" class="tile dark">Certificates</a>
            </div>
          </app-card>
        </section>
      } @else {
        <app-page-header eyebrow="Organization" [breadcrumb]="'Organizations / ' + org.name" [title]="org.name" [description]="org.description || 'Organization dashboard'">
          <a [routerLink]="['/organizations', org.id, 'programs']"><app-button>Programs</app-button></a>
          <a [routerLink]="['/organizations', org.id, 'members']"><app-button variant="secondary">Members</app-button></a>
        </app-page-header>

        <section class="ui-stat-grid">
          <app-stat-card label="Programs" [value]="statsQuery.data()?.totalPrograms ?? 0" />
          <app-stat-card label="Members" [value]="statsQuery.data()?.totalMembers ?? 0" />
          <app-stat-card label="Quizzes" [value]="statsQuery.data()?.totalQuizzes ?? 0" />
          <app-stat-card label="Certificates" [value]="statsQuery.data()?.totalCertificates ?? 0" tone="dark" />
        </section>

        <section class="dashboard-tool-grid">
          <a [routerLink]="['/organizations', org.id, 'members']" class="portal-link-card app-focus"><strong>Members</strong><span>Manage owners and participants.</span></a>
          <a [routerLink]="['/organizations', org.id, 'programs']" class="portal-link-card app-focus"><strong>Programs</strong><span>Create workshops and training tracks.</span></a>
          <a [routerLink]="['/organizations', org.id, 'certificates']" class="portal-link-card app-focus"><strong>Certificates</strong><span>Review all issued credentials.</span></a>
          <a [routerLink]="['/organizations', org.id, 'audit-logs']" class="portal-link-card app-focus"><strong>Audit Logs</strong><span>Inspect organization activity.</span></a>
        </section>
      }
    }
  `,
})
export class OrganizationDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(OrganizationsApi);
  private readonly stats = inject(StatsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? this.route.snapshot.paramMap.get('organizationId') ?? '';
  readonly isSettings = this.route.snapshot.routeConfig?.path?.endsWith('/settings') ?? false;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    logoUrl: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['organizations', this.organizationId],
    enabled: !!this.organizationId,
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

  readonly statsQuery = injectQuery(() => ({
    queryKey: ['organization-stats', this.organizationId],
    enabled: !!this.organizationId && !this.isSettings,
    queryFn: () => this.stats.organization(this.organizationId),
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

