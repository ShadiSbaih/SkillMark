import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { QuizzesService } from '../../services/quizzes.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CertificateIssueMode, CreateQuizRequest } from '../../core/models/quiz.model';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    PageHeaderComponent,
  ],
  templateUrl: './create-quiz.html',
  styles: ``,
})
export class CreateQuiz {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly quizzesService = inject(QuizzesService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('Please fix the errors in the form.');
      return;
    }

    const programId = this.programId();
    if (!programId) {
      toast.error('Program is required to create a quiz.');
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateQuizRequest = {
      title: value.title ?? '',
      description: value.description || undefined,
      passingScore: value.passingScore ?? 70,
      durationMinutes: value.durationMinutes ?? 30,
      maxAttempts: value.maxAttempts ?? 1,
      certificateEnabled: value.certificateEnabled ?? true,
      certificateIssueMode: value.certificateEnabled ? (value.certificateIssueMode ?? 'AUTO') : 'NONE',
    };

    this.quizzesService.createMutation.mutate(
      { programId, request },
      {
        onSuccess: (quiz) => {
          toast.success('Quiz created successfully.');
          void this.router.navigate(['/quizzes', quiz.id, 'builder']);
        },
        onError: (error) => {
          toast.error(error?.message ?? 'Failed to create quiz.');
        },
      }
    );
  }
}
