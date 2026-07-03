import { Injectable, inject, signal } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { Enrollment, CreateEnrollmentRequest } from '../core/models/enrollment.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly mineParams = signal<{ page: number; size: number }>({
    page: 0,
    size: 10,
  });

  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 10,
  });

  readonly myEnrollmentsQuery = injectQuery(() => {
    const params = this.mineParams();
    return {
      queryKey: ['enrollments', 'me', params.page, params.size] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<Enrollment>('enrollments/me', {
            page: params.page,
            size: params.size,
          })
        ),
    };
  });

  readonly programEnrollmentsQuery = injectQuery(() => {
    const params = this.listParams();
    return {
      queryKey: ['enrollments', 'program', params.programId, params.page, params.size] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<Enrollment>(`programs/${params.programId}/enrollments`, {
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
      request: CreateEnrollmentRequest;
    }) =>
      lastValueFrom(
        this.api.post<Enrollment>(`programs/${programId}/enrollments`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['enrollments', 'program', variables.programId],
      });
    },
  }));

  readonly removeMutation = injectMutation(() => ({
    mutationFn: ({
      programId,
      userId,
    }: {
      programId: string;
      userId: string;
    }) =>
      lastValueFrom(
        this.api.delete<void>(`programs/${programId}/enrollments/${userId}`)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['enrollments', 'program', variables.programId],
      });
    },
  }));
}
