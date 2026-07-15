import { Injectable, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import {
  OrganizationStatsResponse,
  OrganizationCertificatesTimelineResponse,
  ProgramStatsResponse,
  ProgramEnrollmentTimelineResponse,
  ProgramCompletionStatsResponse,
  QuizStatsResponse,
  QuizQuestionStatsResponse,
  QuizScoreDistributionResponse,
  QuizAttemptTimelineResponse,
} from '../core/models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly api = inject(ApiClientService);

  getOrganizationStatsQuery(organizationId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'organization', organizationId()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<OrganizationStatsResponse>(`organizations/${organizationId()}/stats`)
        ),
      enabled: !!organizationId(),
    }));
  }

  getProgramStatsQuery(programId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'program', programId()] as const,
      queryFn: () =>
        lastValueFrom(this.api.get<ProgramStatsResponse>(`programs/${programId()}/stats`)),
      enabled: !!programId(),
    }));
  }

  getQuizStatsQuery(quizId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'quiz', quizId()] as const,
      queryFn: () =>
        lastValueFrom(this.api.get<QuizStatsResponse>(`quizzes/${quizId()}/stats`)),
      enabled: !!quizId(),
    }));
  }

  getQuizQuestionStatsQuery(quizId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'quiz', quizId(), 'questions'] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<QuizQuestionStatsResponse[]>(`quizzes/${quizId()}/questions/stats`)
        ),
      enabled: !!quizId(),
    }));
  }

  getQuizScoreDistributionQuery(quizId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'quiz', quizId(), 'score-distribution'] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<QuizScoreDistributionResponse>(`quizzes/${quizId()}/score-distribution`)
        ),
      enabled: !!quizId(),
    }));
  }

  getQuizAttemptTimelineQuery(quizId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'quiz', quizId(), 'attempts-timeline'] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<QuizAttemptTimelineResponse>(`quizzes/${quizId()}/attempts/timeline`)
        ),
      enabled: !!quizId(),
    }));
  }

  getProgramEnrollmentTimelineQuery(programId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'program', programId(), 'enrollments-timeline'] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<ProgramEnrollmentTimelineResponse>(
            `programs/${programId()}/enrollments/timeline`
          )
        ),
      enabled: !!programId(),
    }));
  }

  getProgramCompletionStatsQuery(programId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'program', programId(), 'completion'] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<ProgramCompletionStatsResponse>(`programs/${programId()}/completion`)
        ),
      enabled: !!programId(),
    }));
  }

  getOrganizationCertificatesTimelineQuery(organizationId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['stats', 'organization', organizationId(), 'certificates-timeline'] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<OrganizationCertificatesTimelineResponse>(
            `organizations/${organizationId()}/certificates/timeline`
          )
        ),
      enabled: !!organizationId(),
    }));
  }
}
