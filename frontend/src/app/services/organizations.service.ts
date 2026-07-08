import { Injectable, inject, signal } from '@angular/core';
import {
  injectQuery,
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { AuditLogResponse } from '../core/models/audit-log.model';
import {
  CreateOrganizationRequest,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from '../core/models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly listParams = signal({ page: 0, size: 10 });

  readonly organizationsQuery = injectQuery(() => ({
    queryKey: ['organizations', this.listParams()] as const,
    queryFn: () =>
      lastValueFrom(
        this.api.getPage<OrganizationResponse>('organizations', {
          page: this.listParams().page,
          size: this.listParams().size,
        })
      ),
  }));

  getOrganizationQuery(organizationId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['organization', organizationId()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<OrganizationResponse>(`organizations/${organizationId()}`)
        ),
      enabled: !!organizationId(),
    }));
  }

  auditLogsQuery(
    organizationId: () => string | null,
    page: () => number,
    size: () => number
  ) {
    return injectQuery(() => ({
      queryKey: ['audit-logs', organizationId(), page(), size()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<AuditLogResponse>(`organizations/${organizationId()}/audit-logs`, {
            page: page(),
            size: size(),
          })
        ),
      enabled: !!organizationId(),
    }));
  }

  readonly createMutation = injectMutation(() => ({
    mutationFn: (request: CreateOrganizationRequest) =>
      lastValueFrom(this.api.post<OrganizationResponse>('organizations', request)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: ({
      organizationId,
      request,
    }: {
      organizationId: string;
      request: UpdateOrganizationRequest;
    }) =>
      lastValueFrom(
        this.api.put<OrganizationResponse>(`organizations/${organizationId}`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId] });
      this.queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  }));

  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (organizationId: string) =>
      lastValueFrom(this.api.delete<void>(`organizations/${organizationId}`)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  }));
}
