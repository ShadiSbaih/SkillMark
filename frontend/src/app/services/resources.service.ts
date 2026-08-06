import { Injectable, inject, signal } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { CreateResourceRequest, ResourceResponse, UpdateResourceVisibilityRequest } from '../core/models/resource.model';
import { R2UploadUrlRequest, R2UploadUrlResponse } from '../core/models/storage.model';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 50,
  });

  readonly resourcesQuery = injectQuery(() => {
    const params = this.listParams();
    return {
      queryKey: ['resources', params] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<ResourceResponse>(
            `programs/${params.programId}/resources`,
            { page: params.page, size: params.size }
          )
        ),
      enabled: !!params.programId,
    };
  });

  getResourceQuery(resourceId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['resource', resourceId()] as const,
      queryFn: () => lastValueFrom(this.api.get<ResourceResponse>(`resources/${resourceId()}`)),
      enabled: !!resourceId(),
    }));
  }

  readonly createMutation = injectMutation(() => ({
    mutationFn: ({
      programId,
      request,
    }: {
      programId: string;
      request: CreateResourceRequest;
    }) =>
      lastValueFrom(
        this.api.post<ResourceResponse>(`programs/${programId}/resources`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['resources', { programId: variables.programId }],
      });
    },
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: ({
      resourceId,
      request,
    }: {
      resourceId: string;
      request: CreateResourceRequest;
    }) =>
      lastValueFrom(
        this.api.put<ResourceResponse>(`resources/${resourceId}`, request)
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  }));

  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (resourceId: string) =>
      lastValueFrom(this.api.delete<void>(`resources/${resourceId}`)),
    onSuccess: (_, resourceId) => {
      this.queryClient.removeQueries({ queryKey: ['resource', resourceId] });
      this.queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  }));

  readonly updateVisibilityMutation = injectMutation(() => ({
    mutationFn: ({
      resourceId,
      request,
    }: {
      resourceId: string;
      request: UpdateResourceVisibilityRequest;
    }) =>
      lastValueFrom(
        this.api.patch<ResourceResponse>(`resources/${resourceId}/visibility`, request)
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  }));

  readonly uploadUrlMutation = injectMutation(() => ({
    mutationFn: (request: R2UploadUrlRequest) =>
      lastValueFrom(this.api.post<R2UploadUrlResponse>('storage/upload-urls', request)),
  }));
}
