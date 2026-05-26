import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { CreateResourceRequest, PageResponse, ResourceResponse, Uuid } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class ResourcesApi {
  private readonly api = inject(ApiClient);

  list(programId: Uuid, page = 0, size = 10): Promise<PageResponse<ResourceResponse>> {
    return this.api.page<ResourceResponse>(`/programs/${programId}/resources`, { page, size });
  }

  get(resourceId: Uuid): Promise<ResourceResponse> {
    return this.api.get<ResourceResponse>(`/resources/${resourceId}`);
  }

  create(programId: Uuid, request: CreateResourceRequest): Promise<ResourceResponse> {
    return this.api.post<ResourceResponse>(`/programs/${programId}/resources`, request);
  }

  update(resourceId: Uuid, request: CreateResourceRequest): Promise<ResourceResponse> {
    return this.api.put<ResourceResponse>(`/resources/${resourceId}`, request);
  }

  archive(resourceId: Uuid): Promise<void> {
    return this.api.delete<void>(`/resources/${resourceId}`);
  }

  updateVisibility(resourceId: Uuid, visibleToParticipants: boolean): Promise<ResourceResponse> {
    return this.api.patch<ResourceResponse>(`/resources/${resourceId}/visibility`, { visibleToParticipants });
  }
}

