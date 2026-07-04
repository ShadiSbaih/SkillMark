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
  AttemptResponse,
  AttemptResultResponse,
  StartAttemptResponse,
  SubmitAttemptRequest,
} from '../core/models/attempt.model';

@Injectable({ providedIn: 'root' })
export class AttemptsService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly mineParams = signal<{ page: number; size: number }>({
    page: 0,
    size: 10,
  });

  readonly myAttemptsQuery = injectQuery(() => {
    const params = this.mineParams();
    return {
      queryKey: ['attempts', 'me', params.page, params.size] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<AttemptResponse>('me/attempts', {
            page: params.page,
            size: params.size,
          })
        ),
    };
  });

  getQuizAttemptsQuery(quizId: () => string | null, page: () => number, size: () => number) {
    return injectQuery(() => ({
      queryKey: ['attempts', 'quiz', quizId(), page(), size()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<AttemptResponse>(`quizzes/${quizId()}/attempts`, {
            page: page(),
            size: size(),
          })
        ),
      enabled: !!quizId(),
    }));
  }

  getAttemptQuery(attemptId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['attempt', attemptId()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<AttemptResponse>(`quiz-attempts/${attemptId()}`)
        ),
      enabled: !!attemptId(),
    }));
  }

  readonly startMutation = injectMutation(() => ({
    mutationFn: ({
      quizId,
    }: {
      quizId: string;
      onSuccess?: (response: StartAttemptResponse) => void;
    }) =>
      lastValueFrom(
        this.api.post<StartAttemptResponse>(`quizzes/${quizId}/attempts`, null)
      ),
    onSuccess: (data, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['attempts', 'me'] });
      variables.onSuccess?.(data);
    },
  }));

  readonly submitMutation = injectMutation(() => ({
    mutationFn: ({
      attemptId,
      request,
    }: {
      attemptId: string;
      request: SubmitAttemptRequest;
    }) =>
      lastValueFrom(
        this.api.post<AttemptResultResponse>(
          `quiz-attempts/${attemptId}/submit`,
          request
        )
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['attempt', variables.attemptId],
      });
      this.queryClient.invalidateQueries({ queryKey: ['attempts', 'me'] });
    },
  }));
}
