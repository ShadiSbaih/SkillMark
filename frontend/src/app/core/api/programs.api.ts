import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import {
  CreateProgramRequest,
  PageResponse,
  ProgramResponse,
  ProgramStatus,
  UpdateProgramRequest,
  Uuid,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class ProgramsApi {
  private readonly api = inject(ApiClient);

  listByOrganization(organizationId: Uuid, page = 0, size = 10): Promise<PageResponse<ProgramResponse>> {
    return this.api.page<ProgramResponse>(`/organizations/${organizationId}/programs`, { page, size });
  }

  get(programId: Uuid): Promise<ProgramResponse> {
    return this.api.get<ProgramResponse>(`/programs/${programId}`);
  }

  create(organizationId: Uuid, request: CreateProgramRequest): Promise<ProgramResponse> {
    return this.api.post<ProgramResponse>(`/organizations/${organizationId}/programs`, request);
  }

  update(programId: Uuid, request: UpdateProgramRequest): Promise<ProgramResponse> {
    return this.api.put<ProgramResponse>(`/programs/${programId}`, request);
  }

  publish(programId: Uuid): Promise<ProgramResponse> {
    return this.api.post<ProgramResponse>(`/programs/${programId}/publish`);
  }

  archive(programId: Uuid): Promise<ProgramResponse> {
    return this.api.post<ProgramResponse>(`/programs/${programId}/archive`);
  }

  updateStatus(programId: Uuid, status: ProgramStatus): Promise<ProgramResponse> {
    return this.api.patch<ProgramResponse>(`/programs/${programId}/status`, { status });
  }

  delete(programId: Uuid): Promise<void> {
    return this.api.delete<void>(`/programs/${programId}`);
  }
}

