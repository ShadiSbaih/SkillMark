import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AttemptResultComponent } from './attempt-result.component';
import { AttemptsService } from '../../services/attempts.service';
import { QuizzesService } from '../../services/quizzes.service';
import { AttemptResponse } from '../../core/models/attempt.model';
import { Quiz } from '../../core/models/quiz.model';
import { CertificateResponse } from '../../core/models/certificate.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: T | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

class FakeAttemptsService {
  private readonly refetchSpy = vi.fn();
  private queryState = signal<QueryState<AttemptResponse>>({
    isPending: true,
    isError: false,
    data: null,
    error: null,
    refetch: this.refetchSpy,
  });

  issueCertificateMutate = vi.fn();

  getAttemptQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.refetchSpy,
    };
  }

  setPending() {
    this.queryState.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: this.refetchSpy,
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this.refetchSpy,
    });
  }

  setData(data: AttemptResponse) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this.refetchSpy,
    });
  }

  readonly issueCertificateForAttempt = {
    isPending: () => false,
    mutate: this.issueCertificateMutate,
  } as unknown as ReturnType<typeof vi.fn>;
}

class FakeQuizzesService {
  private queryState = signal<QueryState<Quiz>>({
    isPending: true,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn(),
  });

  getQuizQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: vi.fn(),
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: vi.fn(),
    });
  }

  setData(data: Quiz) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
    });
  }
}

describe('AttemptResultComponent', () => {
  let component: AttemptResultComponent;
  let fixture: ComponentFixture<AttemptResultComponent>;
  let attemptsService: FakeAttemptsService;
  let quizzesService: FakeQuizzesService;
  let router: Router;

  const baseAttempt: AttemptResponse = {
    attemptId: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptNumber: 1,
    expiresAt: '2026-01-01T00:00:00Z',
    totalPoints: 10,
    earnedPoints: 8,
    scorePercentage: 80,
    passed: true,
    status: 'SUBMITTED',
    startedAt: '2026-01-01T00:00:00Z',
    submittedAt: '2026-01-01T01:00:00Z',
    certificateIssued: true,
    certificateId: 'cert-1',
  };

  const baseQuiz: Quiz = {
    id: 'quiz-1',
    programId: 'program-1',
    organizationId: 'org-1',
    title: 'Sample Quiz',
    description: 'A sample quiz for testing.',
    passingScore: 70,
    durationMinutes: 10,
    maxAttempts: 3,
    certificateEnabled: true,
    certificateIssueMode: 'AUTO',
    visibleToParticipants: true,
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-01-01T00:00:00Z',
    questions: [],
  };

  beforeEach(async () => {
    attemptsService = new FakeAttemptsService();
    quizzesService = new FakeQuizzesService();

    await TestBed.configureTestingModule({
      imports: [AttemptResultComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: AttemptsService, useValue: attemptsService },
        { provide: QuizzesService, useValue: quizzesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => 'attempt-1',
            } as unknown as ParamMap),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttemptResultComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render loading state while attempt query is pending', () => {
    attemptsService.setPending();
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading result...');
  });

  it('should render error state and call refetch on retry when attempt query errors', () => {
    attemptsService.setError(new Error('Failed to fetch attempt'));
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain(
      'Failed to fetch attempt'
    );

    const refetchSpy = attemptsService.getAttemptQuery().refetch;
    const retryButton =
      fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(refetchSpy).toHaveBeenCalled();
  });

  it('should render failed badge and no certificate section for a failed attempt', () => {
    attemptsService.setData({
      ...baseAttempt,
      earnedPoints: 4,
      scorePercentage: 40,
      passed: false,
      certificateIssued: false,
      certificateId: null,
    });
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Failed');
    expect(text).toContain('4 / 10');
    expect(text).toContain('(40%)');
    expect(text).not.toContain('View certificate');
    expect(text).not.toContain('Issue certificate');
  });

  it('should render passed badge and view certificate link when certificate exists', () => {
    attemptsService.setData(baseAttempt);
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Passed');
    expect(text).toContain('View certificate');
    expect(text).not.toContain('Issue certificate');

    const viewLink = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    ).find((el) => el.textContent?.includes('View certificate'));
    expect(viewLink).toBeTruthy();
    expect(viewLink?.getAttribute('href')).toBe('/certificates/cert-1');
  });

  it('should navigate to certificate when view certificate link is clicked', () => {
    attemptsService.setData(baseAttempt);
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    component.viewCertificate('cert-1');

    expect(router.navigate).toHaveBeenCalledWith(['/certificates', 'cert-1']);
  });

  it('should show issue certificate button when passed but no certificate exists', () => {
    attemptsService.setData({
      ...baseAttempt,
      certificateIssued: false,
      certificateId: null,
    });
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Passed');
    expect(text).toContain('Issue certificate');
    expect(text).not.toContain('View certificate');
  });

  it('should issue certificate and navigate on success', () => {
    attemptsService.setData({
      ...baseAttempt,
      certificateIssued: false,
      certificateId: null,
    });
    quizzesService.setData(baseQuiz);
    fixture.detectChanges();

    const certificate: CertificateResponse = {
      id: 'cert-2',
      certificateNumber: 'CERT-002',
      verificationCode: 'verify-2',
      organizationId: 'org-1',
      programId: 'program-1',
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptId: 'attempt-1',
      title: 'Sample Quiz Certificate',
      participantNameSnapshot: 'Test User',
      quizTitleSnapshot: 'Sample Quiz',
      programTitleSnapshot: 'Program',
      organizationNameSnapshot: 'Org',
      status: 'ACTIVE',
      issuedAt: '2026-01-01T02:00:00Z',
      revokedAt: null,
      pdfUrl: null,
      pdfObjectKey: null,
      qrCodeUrl: null,
      qrCodeObjectKey: null,
    };

    attemptsService.issueCertificateMutate.mockImplementation(
      (_vars, options) => {
        options?.onSuccess?.(certificate);
      }
    );

    component.issueCertificate();

    expect(attemptsService.issueCertificateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ attemptId: 'attempt-1' }),
      expect.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/certificates', 'cert-2']);
  });
});
