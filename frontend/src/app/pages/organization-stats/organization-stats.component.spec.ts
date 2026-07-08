import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationStatsComponent } from './organization-stats.component';
import { OrganizationsService } from '../../services/organizations.service';
import { StatsService } from '../../services/stats.service';
import { OrganizationResponse } from '../../core/models/organization.model';
import { OrganizationStatsResponse } from '../../core/models/stats.model';

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
    refetch: vi.fn(),
  };
}

class FakeOrganizationsService {
  private readonly queryState = signal<QueryState<OrganizationResponse>>(
    createQueryState<OrganizationResponse>()
  );

  getOrganizationQuery() {
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
      ...createQueryState<OrganizationResponse>(),
      isPending: true,
      refetch: this.queryState().refetch,
    });
  }

  setData(data: OrganizationResponse) {
    this.queryState.set({
      ...createQueryState<OrganizationResponse>(),
      data,
      refetch: this.queryState().refetch,
    });
  }
}

class FakeStatsService {
  private readonly queryState = signal<QueryState<OrganizationStatsResponse>>(
    createQueryState<OrganizationStatsResponse>()
  );

  getOrganizationStatsQuery() {
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
      ...createQueryState<OrganizationStatsResponse>(),
      isPending: true,
      refetch: this.queryState().refetch,
    });
  }

  setData(data: OrganizationStatsResponse) {
    this.queryState.set({
      ...createQueryState<OrganizationStatsResponse>(),
      data,
      refetch: this.queryState().refetch,
    });
  }
}

describe('OrganizationStatsComponent', () => {
  let component: OrganizationStatsComponent;
  let fixture: ComponentFixture<OrganizationStatsComponent>;
  let organizationsService: FakeOrganizationsService;
  let statsService: FakeStatsService;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    slug: 'acme-inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    createdBy: 'Owner User',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

  const stats: OrganizationStatsResponse = {
    totalPrograms: 3,
    totalMembers: 7,
    totalEnrolledParticipants: 21,
    totalQuizzes: 5,
    totalAttempts: 42,
    totalCertificates: 6,
    averageScore: 87.5,
    passRate: 0.82,
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();
    statsService = new FakeStatsService();

    await TestBed.configureTestingModule({
      imports: [OrganizationStatsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: StatsService, useValue: statsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'org-1' }),
            snapshot: { paramMap: { get: () => 'org-1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationStatsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setPending();
    statsService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while queries are pending', () => {
    organizationsService.setPending();
    statsService.setPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading statistics...');
  });

  it('should display organization name and stats when data resolves', () => {
    organizationsService.setData(organization);
    statsService.setData(stats);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Inc');
    expect(text).toContain('Organization stats');
    expect(text).toContain('Programs');
    expect(text).toContain('3');
    expect(text).toContain('Members');
    expect(text).toContain('7');
    expect(text).toContain('Average score');
    expect(text).toContain('87.5');
  });
});
