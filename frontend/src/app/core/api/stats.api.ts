import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { OrganizationStatsResponse, ProgramStatsResponse, QuizStatsResponse, Uuid } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class StatsApi {
  private readonly api = inject(ApiClient);

  organization(organizationId: Uuid): Promise<OrganizationStatsResponse> {
    return this.api.get<OrganizationStatsResponse>(`/organizations/${organizationId}/stats`);
  }

  program(programId: Uuid): Promise<ProgramStatsResponse> {
    return this.api.get<ProgramStatsResponse>(`/programs/${programId}/stats`);
  }

  quiz(quizId: Uuid): Promise<QuizStatsResponse> {
    return this.api.get<QuizStatsResponse>(`/quizzes/${quizId}/stats`);
  }
}

