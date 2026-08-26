import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyAttempts } from './my-attempts';
import { AttemptsService } from '../../services/attempts.service';
import { AttemptResponse } from '../../core/models/attempt.model';
import { PageResponse } from '../../core/api/api-response.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: T | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

function createQueryState<T>(): QueryState<T> {
  return {
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn<() => void>(),
  };
}

class FakeAttemptsService {
  readonly mineParams = signal<{ page: number; size: number }>({
    page: 0,
    size: 10,
  });

  private queryState = signal<QueryState<PageResponse<AttemptResponse>>>(
    createQueryState<PageResponse<AttemptResponse>>()
  );

  get refetchSpy() {
    return this.queryState().refetch;
  }

  readonly myAttemptsQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
  };

  setPending() {
    this.queryState.set({
      ...createQueryState<PageResponse<AttemptResponse>>(),
      isPending: true,
      refetch: this.queryState().refetch,
    });
  }

  setError(error: Error) {
    this.queryState.set({
      ...createQueryState<PageResponse<AttemptResponse>>(),
      isError: true,
      error,
      refetch: this.queryState().refetch,
    });
  }

  setData(data: PageResponse<AttemptResponse>) {
    this.queryState.set({
      ...createQueryState<PageResponse<AttemptResponse>>(),
      data,
      refetch: this.queryState().refetch,
    });
  }
}

describe('MyAttempts', () => {
  let component: MyAttempts;
  let fixture: ComponentFixture<MyAttempts>;
  let attemptsService: FakeAttemptsService;

  const attempt: AttemptResponse = {
    attemptId: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptNumber: 1,
    expiresAt: '2026-01-01T01:00:00Z',
    totalPoints: 100,
    earnedPoints: 85,
    scorePercentage: 85,
    passed: true,
    status: 'SUBMITTED',
    startedAt: '2026-01-01T00:00:00Z',
    submittedAt: '2026-01-01T00:30:00Z',
    certificateIssued: false,
    certificateId: null,
  };

  const inProgressAttempt: AttemptResponse = {
    attemptId: 'attempt-2',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptNumber: 2,
    expiresAt: '2026-01-01T01:00:00Z',
    totalPoints: 100,
    earnedPoints: 0,
    scorePercentage: 0,
    passed: false,
    status: 'IN_PROGRESS',
    startedAt: '2026-01-01T00:00:00Z',
    submittedAt: null,
    certificateIssued: false,
    certificateId: null,
  };

  const attemptsPage: PageResponse<AttemptResponse> = {
    items: [attempt, inProgressAttempt],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    attemptsService = new FakeAttemptsService();

    await TestBed.configureTestingModule({
      imports: [MyAttempts],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: AttemptsService, useValue: attemptsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAttempts);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render page header title and subtitle', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('My attempts');
    expect(text).toContain('Your quiz attempts across all programs.');
  });

  it('should show loading state while attempts are pending', () => {
    attemptsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading attempts');
  });

  it('should show error state with retry when attempts query fails', () => {
    attemptsService.setError(new Error('Attempts failed'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Something went wrong');
    expect(text).toContain('Attempts failed');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(attemptsService.refetchSpy).toHaveBeenCalled();
  });

  it('should show empty state when no attempts exist', () => {
    attemptsService.setData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No attempts yet');
  });

  it('should render attempts table with required columns', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(4);
    expect(headers[0].textContent).toContain('Quiz');
    expect(headers[1].textContent).toContain('Score');
    expect(headers[2].textContent).toContain('Status');
    expect(headers[3].textContent).toContain('Submitted');
  });

  it('should link each quiz column to the attempt result page', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[href*="/attempts/"]');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toContain('/attempts/attempt-1/result');
    expect(links[1].getAttribute('href')).toContain('/attempts/attempt-2/result');
  });

  it('should render submitted score with percentage', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('85.0%');
  });

  it('should render a dash for non-submitted scores', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[1].textContent).toContain('—');
  });

  it('should render status badges for attempts', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('app-status-badge');
    expect(badges.length).toBe(2);
  });

  it('should render submitted date for submitted attempts', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Jan 1, 2026');
  });

  it('should render a dash when no submitted date exists', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[1].textContent).toContain('—');
  });

  it('should update mineParams when pagination emits a page change', () => {
    attemptsService.setData({
      ...attemptsPage,
      totalElements: 25,
      totalPages: 3,
    });
    fixture.detectChanges();

    component.onPageChange(2);
    expect(attemptsService.mineParams()).toEqual({ page: 1, size: 10 });
  });

  it('should not render pagination when only one page exists', () => {
    attemptsService.setData(attemptsPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pagination')).toBeNull();
  });

  it('should render pagination when multiple pages exist', () => {
    attemptsService.setData({
      ...attemptsPage,
      totalElements: 25,
      totalPages: 3,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pagination')).toBeTruthy();
  });
});
