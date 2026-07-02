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
  CreateQuestionRequest,
  CreateQuizRequest,
  Option as QuizOption,
  Question,
  Quiz,
  UpdateQuizRequest,
} from '../core/models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizzesService {
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

  readonly quizzesQuery = injectQuery(() => {
    const params = this.listParams();
    return {
      queryKey: ['quizzes', 'program', params] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<Quiz>(`programs/${params.programId}/quizzes`, {
            page: params.page,
            size: params.size,
          })
        ),
      enabled: !!params.programId,
    };
  });

  getQuizQuery(quizId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['quiz', quizId()] as const,
      queryFn: () => lastValueFrom(this.api.get<Quiz>(`quizzes/${quizId()}`)),
      enabled: !!quizId(),
    }));
  }

  readonly createMutation = injectMutation(() => ({
    mutationFn: ({
      programId,
      request,
    }: {
      programId: string;
      request: CreateQuizRequest;
    }) =>
      lastValueFrom(
        this.api.post<Quiz>(`programs/${programId}/quizzes`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['quizzes', 'program', { programId: variables.programId }],
      });
    },
  }));

  readonly updateMutation = injectMutation(() => ({
    mutationFn: ({
      quizId,
      request,
    }: {
      quizId: string;
      request: UpdateQuizRequest;
    }) =>
      lastValueFrom(this.api.put<Quiz>(`quizzes/${quizId}`, request)),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  }));

  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (quizId: string) =>
      lastValueFrom(this.api.delete<void>(`quizzes/${quizId}`)),
    onSuccess: (_, quizId) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  }));

  readonly publishMutation = injectMutation(() => ({
    mutationFn: (quizId: string) =>
      lastValueFrom(this.api.post<Quiz>(`quizzes/${quizId}/publish`, null)),
    onSuccess: (_, quizId) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  }));

  readonly archiveMutation = injectMutation(() => ({
    mutationFn: ({
      quizId,
      status,
    }: {
      quizId: string;
      status: 'ARCHIVED' | 'DRAFT' | 'PUBLISHED';
    }) =>
      lastValueFrom(
        this.api.patch<Quiz>(`quizzes/${quizId}/status`, { status })
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  }));

  readonly updateVisibilityMutation = injectMutation(() => ({
    mutationFn: ({
      quizId,
      visibleToParticipants,
    }: {
      quizId: string;
      visibleToParticipants: boolean;
    }) =>
      lastValueFrom(
        this.api.patch<Quiz>(`quizzes/${quizId}/visibility`, {
          visibleToParticipants,
        })
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  }));

  readonly addQuestionMutation = injectMutation(() => ({
    mutationFn: ({
      quizId,
      request,
    }: {
      quizId: string;
      request: CreateQuestionRequest;
    }) =>
      lastValueFrom(
        this.api.post<Question>(`quizzes/${quizId}/questions`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  }));

  readonly updateQuestionMutation = injectMutation(() => ({
    mutationFn: ({
      questionId,
      quizId,
      request,
    }: {
      questionId: string;
      quizId: string;
      request: CreateQuestionRequest;
    }) =>
      lastValueFrom(
        this.api.put<Question>(`questions/${questionId}`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  }));

  readonly deleteQuestionMutation = injectMutation(() => ({
    mutationFn: ({ questionId, quizId }: { questionId: string; quizId: string }) =>
      lastValueFrom(this.api.delete<void>(`questions/${questionId}`)),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  }));

  readonly addOptionMutation = injectMutation(() => ({
    mutationFn: ({
      questionId,
      quizId,
      request,
    }: {
      questionId: string;
      quizId: string;
      request: { text: string; isCorrect: boolean; position: number };
    }) =>
      lastValueFrom(
        this.api.post<QuizOption>(`questions/${questionId}/options`, request)
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  }));

  readonly updateOptionMutation = injectMutation(() => ({
    mutationFn: ({
      optionId,
      quizId,
      request,
    }: {
      optionId: string;
      quizId: string;
      request: { text: string; isCorrect: boolean; position: number };
    }) =>
      lastValueFrom(this.api.put<QuizOption>(`options/${optionId}`, request)),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  }));

  readonly deleteOptionMutation = injectMutation(() => ({
    mutationFn: ({ optionId, quizId }: { optionId: string; quizId: string }) =>
      lastValueFrom(this.api.delete<void>(`options/${optionId}`)),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  }));
}
