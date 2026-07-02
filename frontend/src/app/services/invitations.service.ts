import { Injectable, inject, signal } from '@angular/core';
import {
  injectQuery,
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { PageResponse } from '../core/api/api-response.model';
import {
  CreateInvitationRequest,
  Invitation,
  UpdateInvitationStatusRequest,
} from '../core/models/invitation.model';

@Injectable({ providedIn: 'root' })
export class InvitationsService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly listParams = signal<{
    programId: string | null;
    page: number;
    size: number;
  }>({
    programId: null,
    page: 0,
    size: 10,
  });

  readonly invitationsQuery = injectQuery(() => {
    const params = this.listParams();
    return {
      queryKey: ['invitations', params.programId, params.page, params.size] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<Invitation>(`programs/${params.programId}/invitations`, {
            page: params.page,
            size: params.size,
          })
        ),
      enabled: !!params.programId,
    };
  });

  readonly createMutation = injectMutation(() => ({
    mutationFn: ({
      programId,
      request,
    }: {
      programId: string;
      request: CreateInvitationRequest;
    }) =>
      lastValueFrom(
        this.api.post<Invitation>(`programs/${programId}/invitations`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['invitations', variables.programId],
      });
    },
  }));

  readonly disableMutation = injectMutation(() => ({
    mutationFn: (invitationId: string) =>
      lastValueFrom(
        this.api.post<Invitation>(`invitations/${invitationId}/disable`, null)
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  }));

  readonly updateStatusMutation = injectMutation(() => ({
    mutationFn: ({
      invitationId,
      request,
    }: {
      invitationId: string;
      request: UpdateInvitationStatusRequest;
    }) =>
      lastValueFrom(
        this.api.patch<Invitation>(`invitations/${invitationId}/status`, request)
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  }));

  readonly joinMutation = injectMutation(() => ({
    mutationFn: (code: string) =>
      lastValueFrom(
        this.api.post<Invitation>(`invitations/${code}/join`, null)
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  }));
}
