import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { ProgramEnrollmentsComponent } from './program-enrollments.component';
import { EnrollmentsService } from '../../services/enrollments.service';
import { Enrollment, EnrollmentStatus } from '../../core/models/enrollment.model';
import { PageResponse } from '../../core/api/api-response.model';

class FakeEnrollmentsService {
  private queryState = signal({
    status: 'pending',
    isPending: true,
    isError: false,
    data: null as PageResponse<Enrollment> | null,
    error: null as Error | null,
    refetch: vi.fn(),
  });

  readonly mineParams = signal({ page: 0, size: 10 });

  readonly myEnrollmentsQuery = {
    status: () => this.queryState().status,
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
  };

  setPending() {
    this.queryState.set({
      status: 'pending',
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: vi.fn(),
    });
  }

  setError(error: Error) {
    this.queryState.set({
      status: 'error',
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: vi.fn(),
    });
  }

  setData(data: PageResponse<Enrollment>) {
    this.queryState.set({
      status: 'success',
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
    });
  }
}

describe('ProgramEnrollmentsComponent /my-enrollments', () => {
  let component: ProgramEnrollmentsComponent;
  let fixture: ComponentFixture<ProgramEnrollmentsComponent>;
  let enrollmentsService: FakeEnrollmentsService;

  const enrollment: Enrollment = {
    id: 'enrollment-1',
    programId: 'program-1',
    userId: 'user-1',
    userName: 'Ada Lovelace',
    status: 'ACTIVE',
    enrolledAt: '2026-02-14T10:00:00Z',
  };

  beforeEach(async () => {
    enrollmentsService = new FakeEnrollmentsService();

    await TestBed.configureTestingModule({
      imports: [ProgramEnrollmentsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: EnrollmentsService, useValue: enrollmentsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { routeConfig: { path: 'my-enrollments' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramEnrollmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    enrollmentsService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should detect my-enrollments route', () => {
    expect(component.isMyEnrollments).toBe(true);
  });

  it('should show loading state while fetching', () => {
    enrollmentsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading your enrollments...');
  });

  it('should show error state with retry', () => {
    enrollmentsService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-button');
    retryButton.click();
    expect(enrollmentsService.myEnrollmentsQuery.refetch).toHaveBeenCalled();
  });

  it('should show empty state when no enrollments', () => {
    enrollmentsService.setData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No enrollments yet');
  });

  it('should render enrollment cards with status badge and continue link', () => {
    enrollmentsService.setData({
      items: [enrollment],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Program program-1');
    expect(fixture.nativeElement.textContent).toContain('ACTIVE');
    expect(fixture.nativeElement.textContent).toContain('Continue learning');

    const link = fixture.nativeElement.querySelector('a[href="/programs/program-1/learn"]');
    expect(link).toBeTruthy();
  });

  it('should map status to badge variants', () => {
    const cases: { status: EnrollmentStatus; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }[] = [
      { status: 'ACTIVE', variant: 'success' },
      { status: 'COMPLETED', variant: 'info' },
      { status: 'REMOVED', variant: 'danger' },
    ];

    cases.forEach(({ status, variant }) => {
      expect(component.statusVariant(status)).toBe(variant);
    });
  });
});

describe('ProgramEnrollmentsComponent owner route', () => {
  let component: ProgramEnrollmentsComponent;
  let fixture: ComponentFixture<ProgramEnrollmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramEnrollmentsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: EnrollmentsService, useValue: new FakeEnrollmentsService() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { routeConfig: { path: ':programId/enrollments' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramEnrollmentsComponent);
    component = fixture.componentInstance;
  });

  it('should not render my-enrollments view on owner route', () => {
    fixture.detectChanges();

    expect(component.isMyEnrollments).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('My Enrollments');
  });
});
