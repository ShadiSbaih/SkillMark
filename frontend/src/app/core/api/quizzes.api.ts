import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import {
  CreateOptionRequest,
  CreateQuestionRequest,
  CreateQuizRequest,
  OptionResponse,
  PageResponse,
  QuestionResponse,
  QuizResponse,
  QuizStatus,
  UpdateQuizRequest,
  Uuid,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class QuizzesApi {
  private readonly api = inject(ApiClient);

  list(page = 0, size = 10): Promise<PageResponse<QuizResponse>> {
    return this.api.page<QuizResponse>('/quizzes', { page, size });
  }

  listByProgram(programId: Uuid, page = 0, size = 10): Promise<PageResponse<QuizResponse>> {
    return this.api.page<QuizResponse>(`/programs/${programId}/quizzes`, { page, size });
  }

  get(quizId: Uuid): Promise<QuizResponse> {
    return this.api.get<QuizResponse>(`/quizzes/${quizId}`);
  }

  create(programId: Uuid, request: CreateQuizRequest): Promise<QuizResponse> {
    return this.api.post<QuizResponse>(`/programs/${programId}/quizzes`, request);
  }

  update(quizId: Uuid, request: UpdateQuizRequest): Promise<QuizResponse> {
    return this.api.put<QuizResponse>(`/quizzes/${quizId}`, request);
  }

  archive(quizId: Uuid): Promise<void> {
    return this.api.delete<void>(`/quizzes/${quizId}`);
  }

  addQuestion(quizId: Uuid, request: CreateQuestionRequest): Promise<QuestionResponse> {
    return this.api.post<QuestionResponse>(`/quizzes/${quizId}/questions`, request);
  }

  updateQuestion(questionId: Uuid, request: CreateQuestionRequest): Promise<QuestionResponse> {
    return this.api.put<QuestionResponse>(`/questions/${questionId}`, request);
  }

  deleteQuestion(questionId: Uuid): Promise<void> {
    return this.api.delete<void>(`/questions/${questionId}`);
  }

  addOption(questionId: Uuid, request: CreateOptionRequest): Promise<OptionResponse> {
    return this.api.post<OptionResponse>(`/questions/${questionId}/options`, request);
  }

  updateOption(optionId: Uuid, request: CreateOptionRequest): Promise<OptionResponse> {
    return this.api.put<OptionResponse>(`/options/${optionId}`, request);
  }

  deleteOption(optionId: Uuid): Promise<void> {
    return this.api.delete<void>(`/options/${optionId}`);
  }

  publish(quizId: Uuid): Promise<QuizResponse> {
    return this.api.post<QuizResponse>(`/quizzes/${quizId}/publish`);
  }

  updateStatus(quizId: Uuid, status: QuizStatus): Promise<QuizResponse> {
    return this.api.patch<QuizResponse>(`/quizzes/${quizId}/status`, { status });
  }

  updateVisibility(quizId: Uuid, visibleToParticipants: boolean): Promise<QuizResponse> {
    return this.api.patch<QuizResponse>(`/quizzes/${quizId}/visibility`, { visibleToParticipants });
  }
}

