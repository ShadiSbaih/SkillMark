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
  CreateProgramRequest,
  ProgramResponse,
  UpdateProgramRequest,
} from '../core/models/program.model';

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly listParams = signal<{ organizationId: string | null; page: number; size: number }>({
    organizationId: null,
    page: 0,
    size: 10,
  });

  readonly programsQuery = injectQuery(() => {
    const params = this.listParams();
    return {
      queryKey: ['programs', params] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<ProgramResponse>(
            `organizations/${params.organizationId}/programs`,
            {
              page: params.page,
              size: params.size,
            }
          )
        ),
      enabled: !!params.organizationId,
    };
  });

  getProgramQuery(programId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['program', programId()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<ProgramResponse>(`programs/${programId()}`)
        ),
      enabled: !!programId(),
    }));
  }

  readonly createMutation = injectMutation(() => ({
    mutationFn: ({
      organizationId,
      request,
    }: {
      organizationId: string;
      request: CreateProgramRequest;
    }) =>
      lastValueFrom(
        this.api.post<ProgramResponse>(`organizations/${organizationId}/programs`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['programs', { organizationId: variables.organizationId }],
      });
    },
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: ({
      programId,
      request,
    }: {
      programId: string;
      request: UpdateProgramRequest;
    }) =>
      lastValueFrom(
        this.api.put<ProgramResponse>(`programs/${programId}`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      this.queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  }));

  readonly publishMutation = injectMutation(() => ({
    mutationFn: (programId: string) =>
      lastValueFrom(
        this.api.patch<ProgramResponse>(`programs/${programId}/status`, {
          status: 'PUBLISHED',
        })
      ),
    onSuccess: (_, programId) => {
      this.queryClient.invalidateQueries({ queryKey: ['program', programId] });
      this.queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  }));

  readonly archiveMutation = injectMutation(() => ({
    mutationFn: (programId: string) =>
      lastValueFrom(
        this.api.patch<ProgramResponse>(`programs/${programId}/status`, {
          status: 'ARCHIVED',
        })
      ),
    onSuccess: (_, programId) => {
      this.queryClient.invalidateQueries({ queryKey: ['program', programId] });
      this.queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  }));

  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (programId: string) =>
      lastValueFrom(this.api.delete<void>(`programs/${programId}`)),
    onSuccess: (_, programId) => {
      this.queryClient.invalidateQueries({ queryKey: ['program', programId] });
      this.queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  }));
}
