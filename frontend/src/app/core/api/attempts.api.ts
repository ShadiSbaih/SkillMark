import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import {
  AttemptResponse,
  AttemptResultResponse,
  CertificateResponse,
  PageResponse,
  StartAttemptResponse,
  SubmitAttemptRequest,
  Uuid,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class AttemptsApi {
  private readonly api = inject(ApiClient);

  start(quizId: Uuid): Promise<StartAttemptResponse> {
    return this.api.post<StartAttemptResponse>(`/quizzes/${quizId}/attempts`);
  }

  submit(attemptId: Uuid, request: SubmitAttemptRequest): Promise<AttemptResultResponse> {
    return this.api.post<AttemptResultResponse>(`/quiz-attempts/${attemptId}/submit`, request);
  }

  mine(page = 0, size = 10): Promise<PageResponse<AttemptResponse>> {
    return this.api.page<AttemptResponse>('/quiz-attempts/me', { page, size });
  }

  get(attemptId: Uuid): Promise<AttemptResponse> {
    return this.api.get<AttemptResponse>(`/quiz-attempts/${attemptId}`);
  }

  listForQuiz(quizId: Uuid, page = 0, size = 10): Promise<PageResponse<AttemptResponse>> {
    return this.api.page<AttemptResponse>(`/quizzes/${quizId}/attempts`, { page, size });
  }

  issueCertificate(attemptId: Uuid, title?: string | null): Promise<CertificateResponse> {
    return this.api.post<CertificateResponse>(`/quiz-attempts/${attemptId}/certificate`, { title });
  }
}

