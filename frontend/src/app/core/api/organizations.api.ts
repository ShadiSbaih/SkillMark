import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import {
  AuditLogResponse,
  CreateOrganizationRequest,
  OrganizationResponse,
  PageResponse,
  UpdateOrganizationRequest,
  Uuid,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class OrganizationsApi {
  private readonly api = inject(ApiClient);

  list(page = 0, size = 10): Promise<PageResponse<OrganizationResponse>> {
    return this.api.page<OrganizationResponse>('/organizations', { page, size });
  }

  get(id: Uuid): Promise<OrganizationResponse> {
    return this.api.get<OrganizationResponse>(`/organizations/${id}`);
  }

  create(request: CreateOrganizationRequest): Promise<OrganizationResponse> {
    return this.api.post<OrganizationResponse>('/organizations', request);
  }

  update(id: Uuid, request: UpdateOrganizationRequest): Promise<OrganizationResponse> {
    return this.api.put<OrganizationResponse>(`/organizations/${id}`, request);
  }

  delete(id: Uuid): Promise<void> {
    return this.api.delete<void>(`/organizations/${id}`);
  }

  auditLogs(id: Uuid, page = 0, size = 10): Promise<PageResponse<AuditLogResponse>> {
    return this.api.page<AuditLogResponse>(`/organizations/${id}/audit-logs`, { page, size });
  }
}

