import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { AddMemberRequest, MembershipResponse, PageResponse, Uuid } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class MembersApi {
  private readonly api = inject(ApiClient);

  list(organizationId: Uuid, page = 0, size = 10): Promise<PageResponse<MembershipResponse>> {
    return this.api.page<MembershipResponse>(`/organizations/${organizationId}/members`, { page, size });
  }

  add(organizationId: Uuid, request: AddMemberRequest): Promise<MembershipResponse> {
    return this.api.post<MembershipResponse>(`/organizations/${organizationId}/members`, request);
  }

  remove(organizationId: Uuid, userId: Uuid): Promise<void> {
    return this.api.delete<void>(`/organizations/${organizationId}/members/${userId}`);
  }
}

