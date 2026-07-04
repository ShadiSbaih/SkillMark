import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProgramEnrollmentsComponent } from './program-enrollments.component';
import { EnrollmentsService } from '../../services/enrollments.service';
import { Enrollment, EnrollmentStatus } from '../../core/models/enrollment.model';
import { PageResponse } from '../../core/api/api-response.model';

class FakeEnrollmentsService {
  readonly queryState = signal({
    status: 'pending' as const,
    isPending: true,
    isError: false,
    data: null as PageResponse<Enrollment> | null,
    error: null as Error | null,
    refetch: vi.fn(),
  });

  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 10,
  });

  readonly programEnrollmentsQuery = {
    status: () => this.queryState().status,
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
  };

  readonly createMutation = {
    isPending: signal(false),
    mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    }),
  };

  readonly removeMutation = {
    isPending: signal(false),
    mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    }),
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

describe('ProgramEnrollmentsComponent', () => {
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
            paramMap: of({ get: (key: string) => (key === 'programId' ? 'program-1' : null) }),
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

  it('should set listParams from the route', () => {
    fixture.detectChanges();
    expect(enrollmentsService.listParams()).toEqual({
      programId: 'program-1',
      page: 0,
      size: 10,
    });
  });

  it('should show loading state while fetching', () => {
    enrollmentsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading enrollments...');
  });

  it('should show error state with retry', () => {
    enrollmentsService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-error-state app-button');
    retryButton.click();
    expect(enrollmentsService.programEnrollmentsQuery.refetch).toHaveBeenCalled();
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

  it('should render enrollment table with status badge and remove button', () => {
    enrollmentsService.setData({
      items: [enrollment],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('ACTIVE');
    expect(fixture.nativeElement.querySelector('app-button')).toBeTruthy();
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

  it('should open and close the enroll modal', () => {
    enrollmentsService.setData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    expect(component.showEnrollModal()).toBe(false);
    component.openEnrollModal();
    expect(component.showEnrollModal()).toBe(true);
    component.closeEnrollModal();
    expect(component.showEnrollModal()).toBe(false);
  });

  it('should call create mutation when enrolling a user', () => {
    fixture.detectChanges();
    component.openEnrollModal();
    component.enrollForm.setValue({ userId: 'user-2' });
    component.enrollUser();

    expect(enrollmentsService.createMutation.mutate).toHaveBeenCalledWith(
      { programId: 'program-1', request: { userId: 'user-2' } },
      expect.any(Object)
    );
  });

  it('should confirm and remove an enrollment', () => {
    fixture.detectChanges();
    component.confirmRemove('user-1');
    expect(component.removingUserId()).toBe('user-1');

    component.removeEnrollment();
    expect(enrollmentsService.removeMutation.mutate).toHaveBeenCalledWith(
      { programId: 'program-1', userId: 'user-1' },
      expect.any(Object)
    );
  });

  it('should navigate pages', () => {
    enrollmentsService.setData({
      items: [enrollment],
      page: 0,
      size: 10,
      totalElements: 20,
      totalPages: 2,
    });
    fixture.detectChanges();

    component.goToPage(1);
    expect(enrollmentsService.listParams()).toEqual({
      programId: 'program-1',
      page: 1,
      size: 10,
    });
  });
});
