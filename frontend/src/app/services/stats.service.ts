import { Injectable, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import {
  OrganizationStatsResponse,
  ProgramStatsResponse,
  QuizStatsResponse,
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
}
