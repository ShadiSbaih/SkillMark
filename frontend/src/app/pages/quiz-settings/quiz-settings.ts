import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CertificateIssueMode, UpdateQuizRequest } from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './quiz-settings.html',
  styles: ``,
})
export class QuizSettings {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);

  readonly quizId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('quizId'))),
    { initialValue: null }
  );

  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());
  readonly loadedOnce = signal(false);
  readonly showDeleteDialog = signal(false);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    instructions: [''],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    maxAttempts: [1, [Validators.required, Validators.min(1)]],
    certificateEnabled: [true],
    certificateIssueMode: ['AUTO' as CertificateIssueMode],
  });

  readonly certificateEnabled = computed(() => this.form.value.certificateEnabled);
  readonly isPublished = computed(() => this.quizQuery.data()?.status === 'PUBLISHED');

  readonly breadcrumbs = computed(() => {
    const quiz = this.quizQuery.data();
    return [
      { label: 'Programs', route: ['/programs'] },
      { label: 'Program', route: quiz?.programId ? ['/programs', quiz.programId] : undefined },
      { label: quiz?.title ?? 'Quiz', route: quiz ? ['/quizzes', quiz.id] : undefined },
      { label: 'Settings' },
    ];
  });

  readonly statusVariant = computed(() => {
    switch (this.quizQuery.data()?.status) {
      case 'PUBLISHED':
        return 'success';
      case 'ARCHIVED':
        return 'danger';
      default:
        return 'warning';
    }
  });

  constructor() {
    effect(() => {
      const quiz = this.quizQuery.data();
      if (quiz && !this.loadedOnce()) {
        this.loadedOnce.set(true);
        this.form.patchValue({
          title: quiz.title,
          description: quiz.description ?? '',
          instructions: quiz.instructions ?? '',
          passingScore: quiz.passingScore,
          durationMinutes: quiz.durationMinutes,
          maxAttempts: quiz.maxAttempts,
          certificateEnabled: quiz.certificateEnabled,
          certificateIssueMode: quiz.certificateIssueMode,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('Please fix the errors in the form.');
      return;
    }

    const id = this.quizId();
    if (!id) return;

    const value = this.form.getRawValue();
    const request: UpdateQuizRequest = {
      title: value.title ?? '',
      description: value.description || undefined,
      instructions: value.instructions || undefined,
      passingScore: value.passingScore ?? 70,
      durationMinutes: value.durationMinutes ?? 30,
      maxAttempts: value.maxAttempts ?? 1,
      certificateEnabled: value.certificateEnabled ?? true,
      certificateIssueMode: value.certificateEnabled ? (value.certificateIssueMode ?? 'AUTO') : 'NONE',
    };

    this.quizzesService.updateMutation.mutate(
      { quizId: id, request },
      {
        onSuccess: () => toast.success('Quiz settings saved.'),
        onError: (error) => toast.error(error?.message ?? 'Failed to save settings.'),
      }
    );
  }

  openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
  }

  deleteQuiz(): void {
    const id = this.quizId();
    if (!id) return;

    this.quizzesService.deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Quiz deleted.');
        const programId = this.quizQuery.data()?.programId;
        void this.router.navigate(programId ? ['/programs', programId] : ['/programs']);
      },
      onError: (error) => {
        this.showDeleteDialog.set(false);
        toast.error(error?.message ?? 'Failed to delete quiz.');
      },
    });
  }

  goBack(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id]);
  }
}
