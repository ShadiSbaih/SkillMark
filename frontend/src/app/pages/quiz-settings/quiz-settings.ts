import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CertificateIssueMode, UpdateQuizRequest } from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ModalComponent,
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
  readonly showDeleteModal = signal(false);
  readonly showArchiveModal = signal(false);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    maxAttempts: [1, [Validators.required, Validators.min(1)]],
    certificateEnabled: [true],
    certificateIssueMode: ['AUTO' as CertificateIssueMode],
  });

  readonly certificateEnabled = computed(() => this.form.value.certificateEnabled);
  readonly isPublished = computed(() => this.quizQuery.data()?.status === 'PUBLISHED');
  readonly isArchived = computed(() => this.quizQuery.data()?.status === 'ARCHIVED');

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

  openArchiveModal(): void {
    this.showArchiveModal.set(true);
  }

  closeArchiveModal(): void {
    this.showArchiveModal.set(false);
  }

  confirmArchive(): void {
    const id = this.quizId();
    if (!id) return;
    this.quizzesService.archiveMutation.mutate(
      { quizId: id, status: 'ARCHIVED' },
      {
        onSuccess: () => {
          this.showArchiveModal.set(false);
          toast.success('Quiz archived.');
        },
        onError: (error) => {
          this.showArchiveModal.set(false);
          toast.error(error?.message ?? 'Failed to archive quiz.');
        },
      }
    );
  }

  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  confirmDelete(): void {
    const id = this.quizId();
    if (!id) return;
    this.quizzesService.deleteMutation.mutate(id, {
      onSuccess: () => {
        this.showDeleteModal.set(false);
        toast.success('Quiz deleted.');
        const programId = this.quizQuery.data()?.programId;
        void this.router.navigate(programId ? ['/programs', programId, 'quizzes'] : ['/programs']);
      },
      onError: (error) => {
        this.showDeleteModal.set(false);
        toast.error(error?.message ?? 'Failed to delete quiz.');
      },
    });
  }

  goBack(): void {
    const id = this.quizId();
    if (id) void this.router.navigate(['/quizzes', id]);
  }
}
