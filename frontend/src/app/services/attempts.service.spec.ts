import { TestBed } from '@angular/core/testing';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AttemptsService } from './attempts.service';
import { ApiClientService } from '../core/api/api-client.service';
import { PageResponse } from '../core/api/api-response.model';
import {
  AttemptResponse,
  AttemptResultResponse,
  AttemptStatus,
  StartAttemptResponse,
  SubmitAttemptRequest,
} from '../core/models/attempt.model';
import {
  CertificateResponse,
  ManualCertificateRequest,
} from '../core/models/certificate.model';

describe('AttemptsService', () => {
  let service: AttemptsService;
  let apiClient: ApiClientService;

  const attemptStatus: AttemptStatus = 'IN_PROGRESS';

  const startResponse: StartAttemptResponse = {
    attemptId: 'attempt-1',
    quizId: 'quiz-1',
    attemptNumber: 1,
    status: attemptStatus,
    startedAt: '2026-07-03T10:00:00Z',
    expiresAt: '2026-07-03T11:00:00Z',
  };

  const attemptResponse: AttemptResponse = {
    attemptId: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptNumber: 1,
    expiresAt: '2026-07-03T11:00:00Z',
    totalPoints: 100,
    earnedPoints: 85,
    scorePercentage: 85,
    passed: true,
    status: 'SUBMITTED',
    startedAt: '2026-07-03T10:00:00Z',
    submittedAt: '2026-07-03T10:30:00Z',
    certificateIssued: false,
    certificateId: null,
  };

  const resultResponse: AttemptResultResponse = {
    attemptId: 'attempt-1',
    totalPoints: 100,
    earnedPoints: 85,
    scorePercentage: 85,
    passed: true,
    status: 'SUBMITTED',
    submittedAt: '2026-07-03T10:30:00Z',
    certificateIssued: false,
    certificateId: null,
  };

  const pageResponse: PageResponse<AttemptResponse> = {
    items: [attemptResponse],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    apiClient = {
      getPage: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
    } as unknown as ApiClientService;

    TestBed.configureTestingModule({
      providers: [
        AttemptsService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(AttemptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default mineParams to page 0 and size 10', () => {
    expect(service.mineParams()).toEqual({ page: 0, size: 10 });
  });

  it('should expose myAttemptsQuery using the current mineParams', async () => {
    vi.mocked(apiClient.getPage).mockReturnValue(of(pageResponse));

    await service.myAttemptsQuery.refetch();

    expect(apiClient.getPage).toHaveBeenCalledWith('me/attempts', {
      page: 0,
      size: 10,
    });
  });

  it('should update myAttemptsQuery when mineParams change', async () => {
    vi.mocked(apiClient.getPage).mockReturnValue(of(pageResponse));

    service.mineParams.set({ page: 1, size: 20 });

    await service.myAttemptsQuery.refetch();

    expect(apiClient.getPage).toHaveBeenCalledWith('me/attempts', {
      page: 1,
      size: 20,
    });
  });

  it('should expose an attempt query for the given attempt id', async () => {
    vi.mocked(apiClient.get).mockReturnValue(of(attemptResponse));

    const query = TestBed.runInInjectionContext(() =>
      service.getAttemptQuery(() => 'attempt-1')
    );
    await query.refetch();

    expect(apiClient.get).toHaveBeenCalledWith('quiz-attempts/attempt-1');
  });

  it('should not fetch the attempt query when the id is null', () => {
    TestBed.runInInjectionContext(() =>
      service.getAttemptQuery(() => null)
    );

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should start an attempt for a quiz', async () => {
    vi.mocked(apiClient.post).mockReturnValue(of(startResponse));

    const result = await service.startMutation.mutateAsync({
      quizId: 'quiz-1',
    });

    expect(result).toEqual(startResponse);
    expect(apiClient.post).toHaveBeenCalledWith(
      'quizzes/quiz-1/attempts',
      null
    );
  });

  it('should invoke the onSuccess callback after starting an attempt', async () => {
    vi.mocked(apiClient.post).mockReturnValue(of(startResponse));

    await service.startMutation.mutateAsync({
      quizId: 'quiz-1',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      'quizzes/quiz-1/attempts',
      null
    );
  });

  it('should submit an attempt with the given answers', async () => {
    vi.mocked(apiClient.post).mockReturnValue(of(resultResponse));

    const request: SubmitAttemptRequest = {
      answers: [
        { questionId: 'question-1', selectedOptionId: 'option-1' },
        { questionId: 'question-2', selectedOptionId: 'option-2' },
      ],
    };

    const result = await service.submitMutation.mutateAsync({
      attemptId: 'attempt-1',
      request,
    });

    expect(result).toEqual(resultResponse);
    expect(apiClient.post).toHaveBeenCalledWith(
      'quiz-attempts/attempt-1/submit',
      request
    );
  });

  it('should issue a certificate for an attempt without a title', async () => {
    const certificateResponse: CertificateResponse = {
      id: 'cert-1',
      certificateNumber: 'CERT-001',
      verificationCode: 'ABC123',
      organizationId: 'org-1',
      programId: 'program-1',
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptId: 'attempt-1',
      title: 'Certificate of Completion',
      participantNameSnapshot: 'Test User',
      quizTitleSnapshot: 'Test Quiz',
      programTitleSnapshot: 'Test Program',
      organizationNameSnapshot: 'Test Organization',
      status: 'ACTIVE',
      issuedAt: '2026-07-03T10:30:00Z',
      revokedAt: null,
      pdfUrl: null,
      pdfObjectKey: null,
      qrCodeUrl: null,
      qrCodeObjectKey: null,
    };

    vi.mocked(apiClient.post).mockReturnValue(of(certificateResponse));

    const result = await service.issueCertificateForAttempt.mutateAsync({
      attemptId: 'attempt-1',
    });

    expect(result).toEqual(certificateResponse);
    expect(apiClient.post).toHaveBeenCalledWith(
      'quiz-attempts/attempt-1/certificate',
      null
    );
  });

  it('should issue a certificate for an attempt with a custom title', async () => {
    const certificateResponse: CertificateResponse = {
      id: 'cert-2',
      certificateNumber: 'CERT-002',
      verificationCode: 'DEF456',
      organizationId: 'org-1',
      programId: 'program-1',
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptId: 'attempt-1',
      title: 'Custom Title',
      participantNameSnapshot: 'Test User',
      quizTitleSnapshot: 'Test Quiz',
      programTitleSnapshot: 'Test Program',
      organizationNameSnapshot: 'Test Organization',
      status: 'ACTIVE',
      issuedAt: '2026-07-03T10:30:00Z',
      revokedAt: null,
      pdfUrl: null,
      pdfObjectKey: null,
      qrCodeUrl: null,
      qrCodeObjectKey: null,
    };

    vi.mocked(apiClient.post).mockReturnValue(of(certificateResponse));

    const request: ManualCertificateRequest = { title: 'Custom Title' };

    const result = await service.issueCertificateForAttempt.mutateAsync({
      attemptId: 'attempt-1',
      request,
    });

    expect(result).toEqual(certificateResponse);
    expect(apiClient.post).toHaveBeenCalledWith(
      'quiz-attempts/attempt-1/certificate',
      request
    );
  });
});
