import { Injectable, inject, signal } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { AddMemberRequest, MembershipResponse } from '../core/models/membership.model';

@Injectable({ providedIn: 'root' })
export class MembershipsService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly listParams = signal<{ organizationId: string | null; page: number; size: number }>({
    organizationId: null,
    page: 0,
    size: 10,
  });

  readonly membershipsQuery = injectQuery(() => {
    const params = this.listParams();
    return {
      queryKey: ['memberships', params] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<MembershipResponse>(
            `organizations/${params.organizationId}/members`,
            { page: params.page, size: params.size }
          )
        ),
      enabled: !!params.organizationId,
    };
  });

  readonly addMutation = injectMutation(() => ({
    mutationFn: ({
      organizationId,
      request,
    }: {
      organizationId: string;
      request: AddMemberRequest;
    }) =>
      lastValueFrom(
        this.api.post<MembershipResponse>(`organizations/${organizationId}/members`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['memberships', { organizationId: variables.organizationId }],
      });
    },
  }));

  readonly removeMutation = injectMutation(() => ({
    mutationFn: ({
      organizationId,
      userId,
    }: {
      organizationId: string;
      userId: string;
    }) =>
      lastValueFrom(
        this.api.delete<void>(`organizations/${organizationId}/members/${userId}`)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['memberships', { organizationId: variables.organizationId }],
      });
    },
  }));
}
