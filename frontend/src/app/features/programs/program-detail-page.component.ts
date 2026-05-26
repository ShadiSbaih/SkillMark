import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { ProgramsApi } from '../../core/api/programs.api';
import { StatsApi } from '../../core/api/stats.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-program-detail-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, ConfirmDialogComponent, LoadingStateComponent, PageHeaderComponent, StatCardComponent, StatusBadgeComponent],
  template: `
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as program) {
      @if (isSettings) {
        <app-page-header eyebrow="Program" [breadcrumb]="'Programs / ' + program.title + ' / Settings'" [title]="'Settings: ' + program.title" [description]="program.description || 'Update program details'">
          <a [routerLink]="['/programs', program.id]"><app-button variant="secondary">Overview</app-button></a>
        </app-page-header>

        <section class="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <app-card>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-light">Program details</h2>
              <app-status-badge [status]="program.status" />
            </div>
            <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="save(program.id)">
              <label class="app-label">Title *
                <input class="app-input app-focus" formControlName="title" />
              </label>
              <label class="app-label">Description
                <textarea class="app-input app-focus min-h-28" formControlName="description"></textarea>
              </label>
              <label class="app-label">Cover image URL
                <input class="app-input app-focus" formControlName="coverImageUrl" />
              </label>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="app-label">Start date
                  <input class="app-input app-focus" type="date" formControlName="startDate" />
                </label>
                <label class="app-label">End date
                  <input class="app-input app-focus" type="date" formControlName="endDate" />
                </label>
              </div>
              <app-button type="submit" [disabled]="form.invalid || updateMutation.isPending()">Save changes</app-button>
            </form>
          </app-card>

          <app-card tone="dark">
            <p class="text-sm opacity-75">Program tools</p>
            <div class="mt-4 grid gap-2 text-sm">
              @for (link of links(program.id); track link.label) {
                <a [routerLink]="link.path" class="tile dark">{{ link.label }}</a>
              }
            </div>
          </app-card>
        </section>
      } @else {
        <app-page-header eyebrow="Program" [breadcrumb]="'Programs / ' + program.title" [title]="program.title" [description]="program.description || 'Program dashboard'">
          <app-button (click)="publish(program.id)">Publish</app-button>
          <app-button variant="secondary" (click)="confirmArchiveId = program.id">Archive</app-button>
        </app-page-header>

        <section class="ui-stat-grid">
          <app-stat-card label="Enrollments" [value]="statsQuery.data()?.totalEnrollments ?? 0" />
          <app-stat-card label="Resources" [value]="statsQuery.data()?.resourcesCount ?? 0" />
          <app-stat-card label="Quizzes" [value]="statsQuery.data()?.quizzesCount ?? 0" />
          <app-stat-card label="Certificates" [value]="statsQuery.data()?.certificatesIssued ?? 0" tone="dark" />
        </section>

        <section class="dashboard-tool-grid">
          @for (link of links(program.id); track link.label) {
            <a [routerLink]="link.path" class="portal-link-card app-focus"><strong>{{ link.label }}</strong><span>{{ link.description }}</span></a>
          }
        </section>
      }

      <app-confirm-dialog
        [open]="!!confirmArchiveId"
        title="Archive program"
        message="Participants will no longer see this program as active."
        (cancel)="confirmArchiveId = null"
        (confirm)="archive(confirmArchiveId!)"
      />
    }
  `,
})
export class ProgramDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProgramsApi);
  private readonly stats = inject(StatsApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly isSettings = this.route.snapshot.routeConfig?.path?.endsWith('/settings') ?? false;
  confirmArchiveId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    coverImageUrl: [''],
    startDate: [''],
    endDate: [''],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['programs', this.programId],
    enabled: !!this.programId,
    queryFn: async () => {
      const program = await this.api.get(this.programId);
      this.form.patchValue({
        title: program.title,
        description: program.description ?? '',
        coverImageUrl: program.coverImageUrl ?? '',
        startDate: program.startDate ?? '',
        endDate: program.endDate ?? '',
      });
      return program;
    },
  }));

  readonly statsQuery = injectQuery(() => ({
    queryKey: ['program-stats', this.programId],
    enabled: !!this.programId && !this.isSettings,
    queryFn: () => this.stats.program(this.programId),
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.update(id, this.form.getRawValue()),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program updated');
    },
  }));

  readonly statusMutation = injectMutation(() => ({
    mutationFn: ({ id, action }: { id: string; action: 'publish' | 'archive' }) => action === 'publish' ? this.api.publish(id) : this.api.archive(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program status updated');
    },
  }));

  links(id: string) {
    return [
      { label: 'Enrollments', path: ['/programs', id, 'enrollments'], description: 'View and remove enrolled participants.' },
      { label: 'Invitations', path: ['/programs', id, 'invitations'], description: 'Create and disable join links.' },
      { label: 'Resources', path: ['/programs', id, 'resources'], description: 'Manage links, files, images, and videos.' },
      { label: 'Quizzes', path: ['/programs', id, 'quizzes'], description: 'Create and publish assessments.' },
      { label: 'Statistics', path: ['/programs', id, 'stats'], description: 'Review program performance.' },
      { label: 'Participant view', path: ['/programs', id, 'learn'], description: 'Preview the learner experience.' },
    ];
  }

  save(id: string): void {
    if (this.form.valid) {
      this.updateMutation.mutate(id);
    }
  }

  publish(id: string): void {
    this.statusMutation.mutate({ id, action: 'publish' });
  }

  archive(id: string): void {
    this.confirmArchiveId = null;
    this.statusMutation.mutate({ id, action: 'archive' });
  }
}

