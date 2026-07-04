import { TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizzesService } from './quizzes.service';
import { ApiClientService } from '../core/api/api-client.service';
import { CreateQuestionRequest, Question, Quiz } from '../core/models/quiz.model';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let apiClient: ApiClientService;

  const quiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Sample Quiz',
    passingScore: 70,
    durationMinutes: 30,
    maxAttempts: 3,
    certificateEnabled: false,
    certificateIssueMode: 'NONE',
    visibleToParticipants: true,
    isPublished: false,
    status: 'DRAFT',
    createdAt: '2026-07-04T10:00:00Z',
    questions: [],
  };

  const question: Question = {
    id: 'question-1',
    text: 'What is 2+2?',
    type: 'SINGLE_CHOICE',
    points: 1,
    position: 1,
    options: [],
  };

  beforeEach(() => {
    apiClient = {
      getPage: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClientService;

    TestBed.configureTestingModule({
      providers: [
        QuizzesService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(QuizzesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish a quiz via PATCH /quizzes/:id/status', async () => {
    vi.mocked(apiClient.patch).mockReturnValue(of(quiz));

    const result = await service.publishMutation.mutate('quiz-1');

    expect(result).toEqual(quiz);
    expect(apiClient.patch).toHaveBeenCalledWith('quizzes/quiz-1/status', {
      status: 'PUBLISHED',
    });
  });

  it('should archive a quiz via PATCH /quizzes/:id/status', async () => {
    vi.mocked(apiClient.patch).mockReturnValue(of({ ...quiz, status: 'ARCHIVED' }));

    const result = await service.archiveMutation.mutate({
      quizId: 'quiz-1',
      status: 'ARCHIVED',
    });

    expect(result.status).toBe('ARCHIVED');
    expect(apiClient.patch).toHaveBeenCalledWith('quizzes/quiz-1/status', {
      status: 'ARCHIVED',
    });
  });

  it('should update a question under the quiz', async () => {
    vi.mocked(apiClient.put).mockReturnValue(of(question));

    const request: CreateQuestionRequest = {
      text: 'Updated',
      type: 'SINGLE_CHOICE',
      points: 2,
      position: 1,
      options: [],
    };

    const result = await service.updateQuestionMutation.mutate({
      quizId: 'quiz-1',
      questionId: 'question-1',
      request,
    });

    expect(result).toEqual(question);
    expect(apiClient.put).toHaveBeenCalledWith(
      'quizzes/quiz-1/questions/question-1',
      request
    );
  });

  it('should delete a question under the quiz', async () => {
    vi.mocked(apiClient.delete).mockReturnValue(of(void 0));

    await service.deleteQuestionMutation.mutate({
      quizId: 'quiz-1',
      questionId: 'question-1',
    });

    expect(apiClient.delete).toHaveBeenCalledWith(
      'quizzes/quiz-1/questions/question-1'
    );
  });

  it('should add an option under a quiz question', async () => {
    vi.mocked(apiClient.post).mockReturnValue(of(question));

    const request = { text: 'Option A', isCorrect: true, position: 1 };

    await service.addOptionMutation.mutate({
      quizId: 'quiz-1',
      questionId: 'question-1',
      request,
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      'quizzes/quiz-1/questions/question-1/options',
      request
    );
  });

  it('should update an option under a quiz question', async () => {
    vi.mocked(apiClient.put).mockReturnValue(of(question));

    const request = { text: 'Updated option', isCorrect: false, position: 2 };

    await service.updateOptionMutation.mutate({
      quizId: 'quiz-1',
      questionId: 'question-1',
      optionId: 'option-1',
      request,
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      'quizzes/quiz-1/questions/question-1/options/option-1',
      request
    );
  });

  it('should delete an option under a quiz question', async () => {
    vi.mocked(apiClient.delete).mockReturnValue(of(void 0));

    await service.deleteOptionMutation.mutate({
      quizId: 'quiz-1',
      questionId: 'question-1',
      optionId: 'option-1',
    });

    expect(apiClient.delete).toHaveBeenCalledWith(
      'quizzes/quiz-1/questions/question-1/options/option-1'
    );
  });
});
