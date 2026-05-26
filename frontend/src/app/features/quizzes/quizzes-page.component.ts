import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { QuizResponse } from '../../core/models/api.model';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-quizzes-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, ConfirmDialogComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Program" title="Quizzes" description="Create draft assessments and publish them after adding questions." />
    <section class="quizzes-layout" [class.has-form]="!!programId">
      @if (programId) {
        <app-card>
          <h2 class="text-xl font-light">Create quiz</h2>
          <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="create()">
            <label class="app-label">Title *
              <input class="app-input app-focus" placeholder="Quiz title" formControlName="title" />
            </label>
            <label class="app-label">Description
              <textarea class="app-input app-focus min-h-20" placeholder="Participant-facing context" formControlName="description"></textarea>
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="app-label">Passing score
                <input class="app-input app-focus" type="number" min="0" max="100" formControlName="passingScore" />
              </label>
              <label class="app-label">Duration minutes
                <input class="app-input app-focus" type="number" min="1" formControlName="durationMinutes" />
              </label>
            </div>
            <label class="app-label">Max attempts
              <input class="app-input app-focus" type="number" min="1" formControlName="maxAttempts" />
            </label>
            <label class="form-check"><input type="checkbox" formControlName="certificateEnabled" /> Certificate enabled</label>
            <label class="app-label">Certificate issue mode
              <select class="app-input app-focus" formControlName="certificateIssueMode">
                <option value="AUTO">AUTO</option>
                <option value="MANUAL">MANUAL</option>
                <option value="NONE">NONE</option>
              </select>
            </label>
            <app-button type="submit" [disabled]="form.invalid || createMutation.isPending()">Create quiz</app-button>
          </form>
        </app-card>
      }

      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No quizzes found" description="Create or publish quizzes to make them available." />
        } @else {
          <div class="app-table-shell">
            <table class="app-table">
              <thead><tr><th>Quiz</th><th>Rules</th><th>Status</th><th>Visibility</th><th></th></tr></thead>
              <tbody>
                @for (quiz of query.data()?.items ?? []; track quiz.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/quizzes', quiz.id]" class="table-primary-link">{{ quiz.title }}</a>
                      <p>{{ quiz.description || 'No description' }}</p>
                    </td>
                    <td class="font-tabular">{{ quiz.durationMinutes }} min · pass {{ quiz.passingScore }}% · {{ quiz.questions.length }} questions</td>
                    <td><app-status-badge [status]="quiz.status" /></td>
                    <td>{{ quiz.visibleToParticipants ? 'Visible' : 'Hidden' }}</td>
                    <td class="table-actions">
                      <a [routerLink]="['/quizzes', quiz.id, 'builder']"><app-button variant="secondary">Builder</app-button></a>
                      <a [routerLink]="['/quizzes', quiz.id, 'attempt']"><app-button variant="ghost">Take</app-button></a>
                      <app-button variant="ghost" (click)="publish(quiz.id)">Publish</app-button>
                      <app-button variant="ghost" (click)="toggleVisibility(quiz)">{{ quiz.visibleToParticipants ? 'Hide' : 'Show' }}</app-button>
                      <app-button variant="ghost" (click)="pendingArchiveId = quiz.id">Archive</app-button>
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
      title="Archive quiz"
      message="Archive this quiz and stop using it for active participant attempts?"
      (cancel)="pendingArchiveId = null"
      (confirm)="archive(pendingArchiveId!)"
    />
  `,
})
export class QuizzesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(QuizzesApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);
  pendingArchiveId: string | null = null;

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

  readonly archiveMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.archive(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.warning('Quiz archived');
    },
  }));

  readonly visibilityMutation = injectMutation(() => ({
    mutationFn: (quiz: QuizResponse) => this.api.updateVisibility(quiz.id, !quiz.visibleToParticipants),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz visibility updated');
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

  archive(id: string): void {
    this.pendingArchiveId = null;
    this.archiveMutation.mutate(id);
  }

  toggleVisibility(quiz: QuizResponse): void {
    this.visibilityMutation.mutate(quiz);
  }
}
