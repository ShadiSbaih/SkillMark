import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import {
  CreateInvitationRequest,
  InvitationResponse,
  InvitationStatus,
  PageResponse,
  Uuid,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class InvitationsApi {
  private readonly api = inject(ApiClient);

  list(programId: Uuid, page = 0, size = 10): Promise<PageResponse<InvitationResponse>> {
    return this.api.page<InvitationResponse>(`/programs/${programId}/invitations`, { page, size });
  }

  create(programId: Uuid, request: CreateInvitationRequest): Promise<InvitationResponse> {
    return this.api.post<InvitationResponse>(`/programs/${programId}/invitations`, request);
  }

  join(code: string): Promise<InvitationResponse> {
    return this.api.post<InvitationResponse>(`/invitations/${code}/join`);
  }

  disable(invitationId: Uuid): Promise<InvitationResponse> {
    return this.api.post<InvitationResponse>(`/invitations/${invitationId}/disable`);
  }

  updateStatus(invitationId: Uuid, status: InvitationStatus): Promise<InvitationResponse> {
    return this.api.patch<InvitationResponse>(`/invitations/${invitationId}/status`, { status });
  }
}

