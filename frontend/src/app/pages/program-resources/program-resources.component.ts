import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ResourcesService } from '../../services/resources.service';
import { ProgramsService } from '../../services/programs.service';
import { ResourceResponse, ResourceType } from '../../core/models/resource.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-program-resources',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    FormFieldComponent,
  ],
  templateUrl: './program-resources.component.html',
  styleUrl: './program-resources.component.scss',
})
export class ProgramResourcesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly resourcesService = inject(ResourcesService);
  readonly programsService = inject(ProgramsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());
  readonly resourcesQuery = this.resourcesService.resourcesQuery;

  readonly showForm = signal(false);
  readonly resourceTypes: ResourceType[] = ['LINK', 'FILE', 'IMAGE', 'VIDEO_LINK'];

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    type: 'LINK' as ResourceType,
    url: ['', Validators.required],
  });

  readonly pageTitle = computed(() => {
    const title = this.programQuery.data()?.title;
    return title ? `Resources: ${title}` : 'Resources';
  });

  readonly isSubmitting = computed(() => this.resourcesService.createMutation.isPending());

  constructor() {
    effect(() => {
      const id = this.programId();
      this.resourcesService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 50,
      });
    });
  }

  typeLabel(type: ResourceType): string {
    switch (type) {
      case 'LINK':
        return 'Link';
      case 'FILE':
        return 'File';
      case 'IMAGE':
        return 'Image';
      case 'VIDEO_LINK':
        return 'Video link';
      default:
        return type;
    }
  }

  typeIcon(type: ResourceType): string {
    switch (type) {
      case 'LINK':
        return '🔗';
      case 'FILE':
        return '📄';
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO_LINK':
        return '🎬';
      default:
        return '📎';
    }
  }

  visibilityStatus(resource: ResourceResponse): string {
    return resource.visibleToParticipants ? 'Visible' : 'Hidden';
  }

  openForm(): void {
    this.showForm.set(true);
    this.form.reset({
      title: '',
      type: 'LINK',
      url: '',
    });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({
      title: '',
      type: 'LINK',
      url: '',
    });
  }

  onSubmit(): void {
    const programId = this.programId();
    if (!programId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      title: value.title ?? '',
      type: value.type as ResourceType,
      url: value.url ?? '',
    };

    this.resourcesService.createMutation.mutate(
      { programId, request },
      {
        onSuccess: () => {
          toast.success('Resource created');
          this.closeForm();
        },
        onError: (error: Error) => toast.error(error.message || 'Failed to create resource'),
      }
    );
  }

  deleteResource(resource: ResourceResponse): void {
    if (!confirm(`Delete "${resource.title}"? This action cannot be undone.`)) {
      return;
    }
    this.resourcesService.deleteMutation.mutate(resource.id, {
      onSuccess: () => toast.success('Resource deleted'),
      onError: (error: Error) => toast.error(error.message || 'Failed to delete resource'),
    });
  }

  toggleVisibility(resource: ResourceResponse): void {
    this.resourcesService.updateVisibilityMutation.mutate(
      {
        resourceId: resource.id,
        request: { visibleToParticipants: !resource.visibleToParticipants },
      },
      {
        onSuccess: () => toast.success('Visibility updated'),
        onError: (error: Error) => toast.error(error.message || 'Failed to update visibility'),
      }
    );
  }

  openLink(resource: ResourceResponse): void {
    const url = resource.url;
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  goBack(): void {
    this.router.navigate(['/programs', this.programId()]);
  }
}
