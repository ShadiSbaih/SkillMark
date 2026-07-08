import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProgramEnrollmentsComponent } from './program-enrollments.component';
import { EnrollmentsService } from '../../services/enrollments.service';
import { ProgramsService } from '../../services/programs.service';
import { Enrollment } from '../../core/models/enrollment.model';
import { ProgramResponse } from '../../core/models/program.model';
import { PageResponse } from '../../core/api/api-response.model';

class FakeEnrollmentsService {
  private readonly refetchSpy = vi.fn();

  readonly listParams = signal<{
    programId: string | null;
    page: number;
    size: number;
  }>({
    programId: null,
    page: 0,
    size: 10,
  });

  readonly queryState = signal({
    status: 'pending' as 'pending' | 'error' | 'success',
    isPending: true,
    isError: false,
    data: null as PageResponse<Enrollment> | null,
    error: null as Error | null,
    refetch: this.refetchSpy,
  });

  readonly programEnrollmentsQuery = {
    status: () => this.queryState().status,
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.refetchSpy,
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
      refetch: this.refetchSpy,
    });
  }

  setError(error: Error) {
    this.queryState.set({
      status: 'error',
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this.refetchSpy,
    });
  }

  setData(data: PageResponse<Enrollment>) {
    this.queryState.set({
      status: 'success',
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this.refetchSpy,
    });
  }
}

class FakeProgramsService {
  private readonly refetchSpy = vi.fn();
  readonly queryState = signal({
    isPending: false,
    isError: false,
    data: null as ProgramResponse | null,
    error: null as Error | null,
    refetch: this.refetchSpy,
  });

  getProgramQuery(_programId: () => string | null) {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.refetchSpy,
    };
  }

  setProgram(program: ProgramResponse) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data: program,
      error: null,
      refetch: this.refetchSpy,
    });
  }
}

describe('ProgramEnrollmentsComponent', () => {
  let component: ProgramEnrollmentsComponent;
  let fixture: ComponentFixture<ProgramEnrollmentsComponent>;
  let enrollmentsService: FakeEnrollmentsService;
  let programsService: FakeProgramsService;

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Foundations of Testing',
    description: null,
    coverImageUrl: null,
    status: 'PUBLISHED',
    isPublished: true,
    startDate: null,
    endDate: null,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const enrollment: Enrollment = {
    id: 'enrollment-1',
    programId: 'program-1',
    userId: 'user-1',
    userName: 'Ada Lovelace',
    userEmail: 'ada@example.com',
    userAvatarUrl: null,
    status: 'ACTIVE',
    enrolledAt: '2026-02-14T10:00:00Z',
  };

  beforeEach(async () => {
    enrollmentsService = new FakeEnrollmentsService();
    programsService = new FakeProgramsService();
    programsService.setProgram(program);

    await TestBed.configureTestingModule({
      imports: [ProgramEnrollmentsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: EnrollmentsService, useValue: enrollmentsService },
        { provide: ProgramsService, useValue: programsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => (key === 'programId' ? 'program-1' : null),
            }),
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

  it('should show the program title in the header', () => {
    fixture.detectChanges();
    expect(component.pageTitle()).toBe('Enrollments: Foundations of Testing');
    expect(fixture.nativeElement.textContent).toContain('Enrollments: Foundations of Testing');
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

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
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

  it('should render enrollment table with participant and remove button', () => {
    enrollmentsService.setData({
      items: [enrollment],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('ada@example.com');
    expect(fixture.nativeElement.textContent).toContain('Remove');
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
