import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ProgramsService } from '../../services/programs.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-program-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    ButtonComponent,
    CardComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './program-settings.html',
  styles: ``,
})
export class ProgramSettings {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly programsService = inject(ProgramsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    coverImageUrl: [''],
    startDate: [''],
    endDate: [''],
  });

  constructor() {
    effect(() => {
      const program = this.programQuery.data();
      if (program) {
        this.form.patchValue({
          title: program.title,
          description: program.description ?? '',
          coverImageUrl: program.coverImageUrl ?? '',
          startDate: program.startDate ? program.startDate.slice(0, 10) : '',
          endDate: program.endDate ? program.endDate.slice(0, 10) : '',
        });
      }
    });
  }

  onSubmit(): void {
    const id = this.programId();
    if (!id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.programsService.updateMutation.mutate(
      {
        programId: id,
        request: {
          title: value.title ?? '',
          description: value.description || undefined,
          coverImageUrl: value.coverImageUrl || undefined,
          startDate: value.startDate || undefined,
          endDate: value.endDate || undefined,
        },
      },
      {
        onSuccess: () => toast.success('Program updated'),
        onError: (error: Error) => toast.error(error.message || 'Failed to update program'),
      }
    );
  }

  deleteProgram(): void {
    const id = this.programId();
    const orgId = this.programQuery.data()?.organizationId;
    if (!id) return;
    if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      return;
    }
    this.programsService.deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Program deleted');
        this.router.navigate(['/organizations', orgId ?? '']);
      },
      onError: (error: Error) => toast.error(error.message || 'Failed to delete program'),
    });
  }
}
