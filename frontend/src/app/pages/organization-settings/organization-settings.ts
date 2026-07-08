import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { OrganizationsService } from '../../services/organizations.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    ModalComponent,
  ],
  templateUrl: './organization-settings.html',
  styles: ``,
})
export class OrganizationSettings {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly organizationsService = inject(OrganizationsService);

  readonly organizationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: null }
  );

  readonly organizationQuery = this.organizationsService.getOrganizationQuery(() => this.organizationId());
  readonly showDeleteModal = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  constructor() {
    effect(() => {
      const organization = this.organizationQuery.data();
      if (organization) {
        this.form.patchValue({
          name: organization.name,
          description: organization.description ?? '',
        });
      }
    });
  }

  onSubmit(): void {
    const id = this.organizationId();
    if (!id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.organizationsService.updateMutation.mutate(
      {
        organizationId: id,
        request: {
          name: value.name ?? '',
          description: value.description || undefined,
        },
      },
      {
        onSuccess: () => toast.success('Organization updated'),
        onError: (error: Error) => toast.error(error.message || 'Failed to update organization'),
      }
    );
  }

  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  deleteOrganization(): void {
    const id = this.organizationId();
    if (!id) return;

    this.organizationsService.deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Organization deleted');
        this.router.navigate(['/organizations']);
      },
      onError: (error: Error) => toast.error(error.message || 'Failed to delete organization'),
    });
  }
}
