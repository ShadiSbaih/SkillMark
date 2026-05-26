import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-quizzes-page',
  standalone: true,
  imports: [NgTemplateOutlet, ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Program" title="Quizzes" description="Create draft assessments and publish them after adding questions." />
    @if (programId) {
      <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <app-card>
          <h2 class="text-xl font-light">Create quiz</h2>
          <form class="mt-5 grid gap-3" [formGroup]="form" (ngSubmit)="create()">
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Title *" formControlName="title" />
            <textarea class="app-focus min-h-20 rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Description" formControlName="description"></textarea>
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="number" min="0" max="100" formControlName="passingScore" />
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="number" min="1" formControlName="durationMinutes" />
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="number" min="1" formControlName="maxAttempts" />
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="certificateEnabled" /> Certificate enabled</label>
            <select class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" formControlName="certificateIssueMode">
              <option value="AUTO">AUTO</option>
              <option value="MANUAL">MANUAL</option>
              <option value="NONE">NONE</option>
            </select>
            <app-button type="submit" [disabled]="form.invalid || createMutation.isPending()">Create</app-button>
          </form>
        </app-card>
        <ng-container *ngTemplateOutlet="listTpl" />
      </section>
    } @else {
      <ng-container *ngTemplateOutlet="listTpl" />
    }

    <ng-template #listTpl>
      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No quizzes found" description="Create or publish quizzes to make them available." />
        } @else {
          <div class="grid gap-4">
            @for (quiz of query.data()?.items ?? []; track quiz.id) {
              <app-card>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <a [routerLink]="['/quizzes', quiz.id]" class="text-xl font-light tracking-[-0.2px]">{{ quiz.title }}</a>
                    <p class="text-sm text-[var(--color-ink-mute)]">{{ quiz.description || 'No description' }}</p>
                    <p class="font-tabular mt-2 text-xs text-[var(--color-ink-mute)]">{{ quiz.durationMinutes }} min · pass {{ quiz.passingScore }}% · {{ quiz.questions.length }} questions</p>
                  </div>
                  <app-status-badge [status]="quiz.status" />
                </div>
                <div class="mt-5 flex flex-wrap gap-2">
                  <a [routerLink]="['/quizzes', quiz.id, 'builder']"><app-button variant="secondary">Builder</app-button></a>
                  <a [routerLink]="['/quizzes', quiz.id, 'attempt']"><app-button variant="ghost">Take quiz</app-button></a>
                  <app-button variant="ghost" (click)="publish(quiz.id)">Publish</app-button>
                </div>
              </app-card>
            }
          </div>
          <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
        }
      </div>
    </ng-template>
  `,
})
export class QuizzesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(QuizzesApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    maxAttempts: [1, [Validators.required, Validators.min(1)]],
    certificateEnabled: [true],
    certificateIssueMode: this.fb.nonNullable.control<'AUTO' | 'MANUAL' | 'NONE'>('AUTO'),
  });

  readonly query = injectQuery(() => ({
    queryKey: ['quizzes', this.programId || 'all', this.page()],
    queryFn: () => this.programId ? this.api.listByProgram(this.programId, this.page(), 10) : this.api.list(this.page(), 10),
  }));

  readonly createMutation = injectMutation(() => ({
    mutationFn: () => this.api.create(this.programId, this.form.getRawValue()),
    onSuccess: async () => {
      this.form.reset({ title: '', description: '', passingScore: 70, durationMinutes: 30, maxAttempts: 1, certificateEnabled: true, certificateIssueMode: 'AUTO' });
      await this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz created');
    },
  }));

  readonly publishMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.publish(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz published');
    },
  }));

  create(): void {
    if (this.programId && this.form.valid) {
      this.createMutation.mutate();
    }
  }

  publish(id: string): void {
    this.publishMutation.mutate(id);
  }
}
