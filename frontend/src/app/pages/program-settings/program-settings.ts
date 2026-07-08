import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ProgramsService } from '../../services/programs.service';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramStatus } from '../../core/models/program.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

function toDatetimeLocalValue(dateValue: string | null): string {
  if (!dateValue) return '';
  const datePart = dateValue.slice(0, 10);
  return `${datePart}T00:00`;
}

function toDateOnly(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

@Component({
  selector: 'app-program-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    BreadcrumbComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './program-settings.html',
  styles: ``,
})
export class ProgramSettings {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly programsService = inject(ProgramsService);
  readonly organizationsService = inject(OrganizationsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly organizationQuery = this.organizationsService.getOrganizationQuery(
    () => this.programQuery.data()?.organizationId ?? null
  );
  readonly showDeleteDialog = signal(false);

  readonly statusOptions: { value: ProgramStatus; label: string }[] = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    status: ['DRAFT' as ProgramStatus, Validators.required],
    description: ['', Validators.maxLength(500)],
    startDate: [''],
    endDate: [''],
  });

  constructor() {
    effect(() => {
      const program = this.programQuery.data();
      if (program) {
        this.form.patchValue({
          title: program.title,
          status: program.status,
          description: program.description ?? '',
          startDate: toDatetimeLocalValue(program.startDate),
          endDate: toDatetimeLocalValue(program.endDate),
        });
      }
    });
  }

  onSubmit(): void {
    const id = this.programId();
    const program = this.programQuery.data();
    if (!id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const newStatus = value.status ?? program?.status ?? 'DRAFT';

    const update = (): void => {
      this.programsService.updateMutation.mutate(
        {
          programId: id,
          request: {
            title: value.title ?? '',
            description: value.description || undefined,
            startDate: toDateOnly(value.startDate),
            endDate: toDateOnly(value.endDate),
          },
        },
        {
          onSuccess: () => toast.success('Program updated'),
          onError: (error: Error) => toast.error(error.message || 'Failed to update program'),
        }
      );
    };

    if (newStatus !== program?.status) {
      if (newStatus === 'PUBLISHED') {
        this.programsService.publishMutation.mutate(id, {
          onSuccess: update,
          onError: (error: Error) => toast.error(error.message || 'Failed to publish program'),
        });
        return;
      }
      if (newStatus === 'ARCHIVED') {
        this.programsService.archiveMutation.mutate(id, {
          onSuccess: update,
          onError: (error: Error) => toast.error(error.message || 'Failed to archive program'),
        });
        return;
      }
    }

    update();
  }

  openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
  }

  deleteProgram(): void {
    const id = this.programId();
    if (!id) return;

    this.programsService.deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Program deleted');
        this.router.navigate(['/organizations']);
      },
      onError: (error: Error) => toast.error(error.message || 'Failed to delete program'),
    });
  }
}
