import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { ResourcesApi } from '../../core/api/resources.api';
import { StorageApi } from '../../core/api/storage.api';
import { ResourceResponse } from '../../core/models/api.model';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Program" title="Resources" description="Manage links, files, images, and video links for participants." />
    <section class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <app-card>
        <h2 class="text-xl font-light">Add resource</h2>
        <form class="app-form mt-5" [formGroup]="form" (ngSubmit)="create()">
          <label class="app-label">Title *
            <input class="app-input app-focus" placeholder="Resource title" formControlName="title" />
          </label>
          <label class="app-label">Description
            <textarea class="app-input app-focus min-h-20" placeholder="Optional context for participants" formControlName="description"></textarea>
          </label>
          <label class="app-label">Type
            <select class="app-input app-focus" formControlName="type">
              <option value="LINK">LINK</option>
              <option value="VIDEO_LINK">VIDEO_LINK</option>
              <option value="FILE">FILE</option>
              <option value="IMAGE">IMAGE</option>
            </select>
          </label>
          <label class="app-label">URL *
            <input class="app-input app-focus" placeholder="https://..." formControlName="url" />
          </label>
          <label class="app-label">Position
            <input class="app-input app-focus" type="number" min="1" formControlName="position" />
          </label>
          <label class="app-label">Upload file
            <input class="app-input app-focus" type="file" (change)="prepareUpload($event)" />
          </label>
          <app-button type="submit" [disabled]="form.invalid || createMutation.isPending()">Create</app-button>
        </form>
      </app-card>
      <div>
        @if (query.isPending()) {
          <app-loading-state />
        } @else if ((query.data()?.items?.length ?? 0) === 0) {
          <app-empty-state title="No resources yet" description="Add a link or upload-backed resource for this program." />
        } @else {
          <div class="grid gap-4">
            @for (resource of query.data()?.items ?? []; track resource.id) {
              <app-card>
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <a [href]="resource.url" target="_blank" rel="noopener" class="text-lg font-light">{{ resource.title }}</a>
                    <p class="text-sm text-[var(--color-ink-mute)]">{{ resource.description || resource.type }}</p>
                    <p class="font-tabular mt-2 text-xs text-[var(--color-ink-mute)]">Position {{ resource.position }} · {{ resource.storageProvider }}</p>
                  </div>
                  <app-status-badge [status]="resource.status" />
                </div>
                <div class="mt-4">
                  <div class="flex flex-wrap gap-2">
                    <app-button variant="ghost" (click)="toggleVisibility(resource)">
                      {{ resource.visibleToParticipants ? 'Hide from participants' : 'Show to participants' }}
                    </app-button>
                    <app-button variant="ghost" (click)="archive(resource.id)">Archive</app-button>
                  </div>
                </div>
                <p class="mt-3 text-xs text-[var(--color-ink-mute)]">
                  {{ resource.visibleToParticipants ? 'Visible to participants' : 'Hidden from participants' }}
                </p>
              </app-card>
            }
          </div>
          <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
        }
      </div>
    </section>
  `,
})
export class ResourcesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ResourcesApi);
  private readonly storage = inject(StorageApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);
  private pendingFile?: File;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    type: this.fb.nonNullable.control<'LINK' | 'FILE' | 'IMAGE' | 'VIDEO_LINK'>('LINK'),
    url: ['', Validators.required],
    position: [1, Validators.required],
  });

  readonly query = injectQuery(() => ({
    queryKey: ['resources', this.programId, this.page()],
    enabled: !!this.programId,
    queryFn: () => this.api.list(this.programId, this.page(), 10),
  }));

  readonly createMutation = injectMutation(() => ({
    mutationFn: async () => {
      const raw = this.form.getRawValue();
      let url = raw.url;
      let objectKey: string | null = null;
      let storageProvider: 'EXTERNAL' | 'R2' = 'EXTERNAL';
      if (this.pendingFile) {
        objectKey = `${this.programId}/${Date.now()}-${this.pendingFile.name}`;
        const upload = await this.storage.createR2UploadUrl({
          programId: this.programId,
          objectKey,
          contentType: this.pendingFile.type,
        });
        await this.storage.uploadToR2(upload.uploadUrl, this.pendingFile, this.pendingFile.type);
        url = upload.publicUrl;
        storageProvider = 'R2';
      }
      return this.api.create(this.programId, { ...raw, url, objectKey, storageProvider });
    },
    onSuccess: async () => {
      this.form.reset({ title: '', description: '', type: 'LINK', url: '', position: 1 });
      this.pendingFile = undefined;
      await this.queryClient.invalidateQueries({ queryKey: ['resources', this.programId] });
      toast.success('Resource created');
    },
  }));

  readonly archiveMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.archive(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['resources', this.programId] });
      toast.warning('Resource archived');
    },
  }));

  readonly visibilityMutation = injectMutation(() => ({
    mutationFn: (resource: ResourceResponse) => this.api.updateVisibility(resource.id, !resource.visibleToParticipants),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['resources', this.programId] });
      toast.success('Resource visibility updated');
    },
  }));

  prepareUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pendingFile = input.files?.[0];
    if (this.pendingFile) {
      this.form.patchValue({ type: this.pendingFile.type.startsWith('image/') ? 'IMAGE' : 'FILE', url: this.pendingFile.name });
    }
  }

  create(): void {
    if (this.form.valid) {
      this.createMutation.mutate();
    }
  }

  archive(id: string): void {
    this.archiveMutation.mutate(id);
  }

  toggleVisibility(resource: ResourceResponse): void {
    this.visibilityMutation.mutate(resource);
  }
}

