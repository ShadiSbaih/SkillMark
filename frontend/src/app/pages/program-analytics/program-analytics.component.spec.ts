import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramAnalyticsComponent } from './program-analytics.component';
import { ProgramsService } from '../../services/programs.service';
import { StatsService } from '../../services/stats.service';
import { ProgramResponse } from '../../core/models/program.model';
import {
  ProgramCompletionStatsResponse,
  ProgramEnrollmentTimelineResponse,
  ProgramStatsResponse,
} from '../../core/models/stats.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: T | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

function createQueryState<T>(): QueryState<T> {
  return { isPending: false, isError: false, data: null, error: null, refetch: vi.fn() };
}

class FakeProgramsService {
  private readonly queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());

  getProgramQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setData(data: ProgramResponse) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), data, refetch: this.queryState().refetch });
  }
}

class FakeStatsService {
  private readonly programStats = signal<QueryState<ProgramStatsResponse>>(createQueryState<ProgramStatsResponse>());
  private readonly enrollmentTimeline = signal<QueryState<ProgramEnrollmentTimelineResponse>>(createQueryState<ProgramEnrollmentTimelineResponse>());
  private readonly completion = signal<QueryState<ProgramCompletionStatsResponse>>(createQueryState<ProgramCompletionStatsResponse>());

  getProgramStatsQuery() {
    return this.query(this.programStats);
  }

  getProgramEnrollmentTimelineQuery() {
    return this.query(this.enrollmentTimeline);
  }

  getProgramCompletionStatsQuery() {
    return this.query(this.completion);
  }

  private query<T>(state: ReturnType<typeof signal<QueryState<T>>>) {
    return {
      isPending: () => state().isPending,
      isError: () => state().isError,
      data: () => state().data,
      error: () => state().error,
      refetch: state().refetch,
    };
  }

  setProgramStats(data: ProgramStatsResponse) {
    this.programStats.set({ ...createQueryState<ProgramStatsResponse>(), data, refetch: this.programStats().refetch });
  }

  setCompletion(data: ProgramCompletionStatsResponse) {
    this.completion.set({ ...createQueryState<ProgramCompletionStatsResponse>(), data, refetch: this.completion().refetch });
  }
}

describe('ProgramAnalyticsComponent', () => {
  let component: ProgramAnalyticsComponent;
  let fixture: ComponentFixture<ProgramAnalyticsComponent>;
  let programsService: FakeProgramsService;
  let statsService: FakeStatsService;

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Sample Program',
    description: 'A sample program',
    coverImageUrl: null,
    status: 'PUBLISHED',
    isPublished: true,
    startDate: null,
    endDate: null,
    createdAt: '2026-07-01T10:00:00Z',
  };

  const programStats: ProgramStatsResponse = {
    totalEnrollments: 20,
    activeEnrollments: 18,
    resourcesCount: 5,
    quizzesCount: 2,
    attemptsCount: 15,
    passedParticipants: 12,
    certificatesIssued: 10,
    averageScore: 80,
  };

  const completion: ProgramCompletionStatsResponse = {
    totalEnrollments: 20,
    activeEnrollments: 18,
    completedEnrollments: 16,
    attemptedQuizzes: 15,
    passedQuizzes: 12,
    certificatesIssued: 10,
    enrollmentToAttemptRate: 75,
    attemptToPassRate: 80,
    enrollmentToCertificateRate: 50,
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [ProgramAnalyticsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => 'program-1' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    programsService.setData(program);
    statsService.setProgramStats(programStats);
    statsService.setCompletion(completion);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display program title and funnel rates', () => {
    programsService.setData(program);
    statsService.setProgramStats(programStats);
    statsService.setCompletion(completion);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sample Program Analytics');
    expect(text).toContain('20');
    expect(text).toContain('Enrollments');
    expect(text).toContain('Certificates');
  });
});
