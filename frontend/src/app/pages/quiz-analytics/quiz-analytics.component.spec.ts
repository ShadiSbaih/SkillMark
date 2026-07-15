import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizAnalyticsComponent } from './quiz-analytics.component';
import { QuizzesService } from '../../services/quizzes.service';
import { StatsService } from '../../services/stats.service';
import { Quiz } from '../../core/models/quiz.model';
import {
  QuizAttemptTimelineResponse,
  QuizQuestionStatsResponse,
  QuizScoreDistributionResponse,
  QuizStatsResponse,
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

class FakeQuizzesService {
  private readonly queryState = signal<QueryState<Quiz>>(createQueryState<Quiz>());

  getQuizQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setData(data: Quiz) {
    this.queryState.set({ ...createQueryState<Quiz>(), data, refetch: this.queryState().refetch });
  }
}

class FakeStatsService {
  private readonly quizStats = signal<QueryState<QuizStatsResponse>>(createQueryState<QuizStatsResponse>());
  private readonly questionStats = signal<QueryState<QuizQuestionStatsResponse[]>>(createQueryState<QuizQuestionStatsResponse[]>());
  private readonly scoreDistribution = signal<QueryState<QuizScoreDistributionResponse>>(createQueryState<QuizScoreDistributionResponse>());
  private readonly timeline = signal<QueryState<QuizAttemptTimelineResponse>>(createQueryState<QuizAttemptTimelineResponse>());

  getQuizStatsQuery() {
    return this.query(this.quizStats);
  }

  getQuizQuestionStatsQuery() {
    return this.query(this.questionStats);
  }

  getQuizScoreDistributionQuery() {
    return this.query(this.scoreDistribution);
  }

  getQuizAttemptTimelineQuery() {
    return this.query(this.timeline);
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

  setQuizStats(data: QuizStatsResponse) {
    this.quizStats.set({ ...createQueryState<QuizStatsResponse>(), data, refetch: this.quizStats().refetch });
  }

  setScoreDistribution(data: QuizScoreDistributionResponse) {
    this.scoreDistribution.set({ ...createQueryState<QuizScoreDistributionResponse>(), data, refetch: this.scoreDistribution().refetch });
  }

  setTimeline(data: QuizAttemptTimelineResponse) {
    this.timeline.set({ ...createQueryState<QuizAttemptTimelineResponse>(), data, refetch: this.timeline().refetch });
  }
}

describe('QuizAnalyticsComponent', () => {
  let component: QuizAnalyticsComponent;
  let fixture: ComponentFixture<QuizAnalyticsComponent>;
  let quizzesService: FakeQuizzesService;
  let statsService: FakeStatsService;

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
    isPublished: true,
    status: 'PUBLISHED',
    createdAt: '2026-07-01T10:00:00Z',
    questions: [],
  };

  const stats: QuizStatsResponse = {
    attemptsCount: 10,
    submittedAttempts: 8,
    averageScore: 75,
    highestScore: 100,
    lowestScore: 40,
    passCount: 6,
    failCount: 2,
    passRate: 75,
  };

  const scoreDistribution: QuizScoreDistributionResponse = {
    buckets: [{ label: '70-79', minScore: 70, maxScore: 79, count: 3 }],
  };

  const timeline: QuizAttemptTimelineResponse = {
    daily: [{ label: '2026-07-01', started: 1, submitted: 1, passed: 1 }],
    weekly: [{ label: '2026-W26', started: 1, submitted: 1, passed: 1 }],
  };

  beforeEach(async () => {
    quizzesService = new FakeQuizzesService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [QuizAnalyticsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: QuizzesService, useValue: quizzesService },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => 'quiz-1' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizAnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    quizzesService.setData(quiz);
    statsService.setQuizStats(stats);
    statsService.setScoreDistribution(scoreDistribution);
    statsService.setTimeline(timeline);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display quiz title and stats', () => {
    quizzesService.setData(quiz);
    statsService.setQuizStats(stats);
    statsService.setScoreDistribution(scoreDistribution);
    statsService.setTimeline(timeline);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sample Quiz Analytics');
    expect(text).toContain('10');
    expect(text).toContain('75%');
  });
});
