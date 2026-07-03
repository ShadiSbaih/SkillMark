import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ResourcesService } from '../../services/resources.service';
import { ResourceResponse, ResourceType, StorageProvider } from '../../core/models/resource.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-program-resources',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './program-resources.component.html',
  styleUrl: './program-resources.component.scss',
})
export class ProgramResourcesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly resourcesService = inject(ResourcesService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly resourcesQuery = this.resourcesService.resourcesQuery;

  readonly showModal = signal(false);
  readonly editingResource = signal<ResourceResponse | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly resourceTypes: ResourceType[] = ['LINK', 'FILE', 'IMAGE', 'VIDEO_LINK'];

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    type: 'LINK' as ResourceType,
    url: [''],
    storageProvider: 'EXTERNAL' as StorageProvider,
    objectKey: [''],
    visibleToParticipants: true,
    position: [0],
  });

  constructor() {
    effect(() => {
      const id = this.programId();
      this.resourcesService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 50,
      });
    });

    effect(() => {
      const type = this.form.get('type')?.value as ResourceType;
      if (type === 'LINK' || type === 'VIDEO_LINK') {
        this.form.get('url')?.setValidators([Validators.required]);
        this.form.get('storageProvider')?.clearValidators();
        this.form.get('objectKey')?.clearValidators();
      } else {
        this.form.get('url')?.clearValidators();
        this.form.get('storageProvider')?.setValidators([Validators.required]);
        this.form.get('objectKey')?.setValidators([Validators.required]);
      }
      this.form.get('url')?.updateValueAndValidity();
      this.form.get('storageProvider')?.updateValueAndValidity();
      this.form.get('objectKey')?.updateValueAndValidity();
    });
  }

  readonly isLinkType = computed(() => {
    const type = this.form.get('type')?.value as ResourceType;
    return type === 'LINK' || type === 'VIDEO_LINK';
  });

  readonly isSubmitting = computed(
    () => this.resourcesService.createMutation.isPending() || this.resourcesService.updateMutation.isPending()
  );

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

  statusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'HIDDEN':
        return 'warning';
      case 'REMOVED':
        return 'danger';
      default:
        return 'default';
    }
  }

  openCreate(): void {
    this.editingResource.set(null);
    this.form.reset({
      title: '',
      description: '',
      type: 'LINK',
      url: '',
      storageProvider: 'EXTERNAL',
      objectKey: '',
      visibleToParticipants: true,
      position: 0,
    });
    this.selectedFile.set(null);
    this.showModal.set(true);
  }

  openEdit(resource: ResourceResponse): void {
    this.editingResource.set(resource);
    this.form.patchValue({
      title: resource.title,
      description: resource.description ?? '',
      type: resource.type,
      url: resource.url ?? '',
      storageProvider: resource.storageProvider ?? 'EXTERNAL',
      objectKey: resource.objectKey ?? '',
      visibleToParticipants: resource.visibleToParticipants,
      position: resource.position,
    });
    this.selectedFile.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingResource.set(null);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event, type: 'FILE' | 'IMAGE'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) {
      this.form.patchValue({
        title: this.form.value.title || file.name,
        storageProvider: type === 'IMAGE' ? 'CLOUDINARY' : 'R2',
        objectKey: file.name,
      });
    }
  }

  onSubmit(): void {
    const programId = this.programId();
    if (!programId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const baseRequest = {
      title: value.title ?? '',
      description: value.description || undefined,
      type: value.type as ResourceType,
      visibleToParticipants: value.visibleToParticipants ?? true,
      position: value.position ?? 0,
    };

    let request;
    if (this.isLinkType()) {
      request = { ...baseRequest, url: value.url || undefined };
    } else {
      request = {
        ...baseRequest,
        storageProvider: value.storageProvider as StorageProvider,
        objectKey: value.objectKey || undefined,
        url: value.url || undefined,
      };
    }

    const editing = this.editingResource();
    if (editing) {
      this.resourcesService.updateMutation.mutate(
        { resourceId: editing.id, request },
        {
          onSuccess: () => {
            toast.success('Resource updated');
            this.closeModal();
          },
          onError: (error: Error) => toast.error(error.message || 'Failed to update resource'),
        }
      );
    } else {
      this.resourcesService.createMutation.mutate(
        { programId, request },
        {
          onSuccess: () => {
            toast.success('Resource created');
            this.closeModal();
          },
          onError: (error: Error) => toast.error(error.message || 'Failed to create resource'),
        }
      );
    }
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

  goBack(): void {
    this.router.navigate(['/programs', this.programId()]);
  }
}
