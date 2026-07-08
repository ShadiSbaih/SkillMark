import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyEnrollments } from './my-enrollments';
import { EnrollmentsService } from '../../services/enrollments.service';
import { Enrollment } from '../../core/models/enrollment.model';
import { PageResponse } from '../../core/api/api-response.model';

interface MyEnrollmentsQueryState {
  status: 'pending' | 'error' | 'success';
  isPending: boolean;
  isError: boolean;
  data: PageResponse<Enrollment> | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

class FakeEnrollmentsService {
  readonly mineParams = signal<{ page: number; size: number }>({
    page: 0,
    size: 10,
  });

  private readonly _refetchSpy = vi.fn();
  private queryState = signal<MyEnrollmentsQueryState>({
    status: 'pending',
    isPending: true,
    isError: false,
    data: null,
    error: null,
    refetch: this._refetchSpy,
  });

  readonly myEnrollmentsQuery = {
    status: () => this.queryState().status,
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this._refetchSpy,
  };

  get refetchSpy() {
    return this._refetchSpy;
  }

  setPending() {
    this.queryState.set({
      status: 'pending',
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: this._refetchSpy,
    });
  }

  setError(error: Error) {
    this.queryState.set({
      status: 'error',
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this._refetchSpy,
    });
  }

  setData(data: PageResponse<Enrollment>) {
    this.queryState.set({
      status: 'success',
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this._refetchSpy,
    });
  }
}

describe('MyEnrollments', () => {
  let component: MyEnrollments;
  let fixture: ComponentFixture<MyEnrollments>;
  let enrollmentsService: FakeEnrollmentsService;

  const enrollment: Enrollment & {
    programTitle: string;
    organizationName: string;
  } = {
    id: 'enrollment-1',
    programId: 'program-1',
    userId: 'user-1',
    userName: 'Ada Lovelace',
    userEmail: null,
    userAvatarUrl: null,
    status: 'ACTIVE',
    enrolledAt: '2026-02-14T10:00:00Z',
    programTitle: 'Foundations of Testing',
    organizationName: 'Acme Inc',
  };

  const pageResponse: PageResponse<Enrollment> = {
    items: [enrollment],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    enrollmentsService = new FakeEnrollmentsService();

    await TestBed.configureTestingModule({
      imports: [MyEnrollments],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: EnrollmentsService, useValue: enrollmentsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyEnrollments);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    enrollmentsService.setPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
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

    const refetchSpy = enrollmentsService.refetchSpy;
    const retryButton =
      fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(refetchSpy).toHaveBeenCalled();
  });

  it('should show empty state when there are no enrollments', () => {
    enrollmentsService.setData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No enrollments');
  });

  it('should render the list of enrollments with program title, organization name, and enrolled date', () => {
    enrollmentsService.setData(pageResponse);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(enrollment.programTitle);
    expect(text).toContain(enrollment.organizationName);
    expect(text).toContain('Feb 14, 2026');
  });

  it('should link each enrollment to the learn page', () => {
    enrollmentsService.setData(pageResponse);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector(
      'a[href="/programs/program-1/learn"]'
    );
    expect(anchor).toBeTruthy();
  });

  it('should navigate pages using the pagination component', () => {
    enrollmentsService.setData({
      items: [enrollment],
      page: 0,
      size: 10,
      totalElements: 25,
      totalPages: 3,
    });
    fixture.detectChanges();

    let previousButton = getButtonByText(fixture, 'Previous');
    let nextButton = getButtonByText(fixture, 'Next');

    expect(previousButton?.disabled).toBe(true);
    expect(nextButton?.disabled).toBe(false);

    nextButton?.click();
    fixture.detectChanges();

    expect(enrollmentsService.mineParams()).toEqual({ page: 1, size: 10 });

    previousButton = getButtonByText(fixture, 'Previous');
    previousButton?.click();
    fixture.detectChanges();

    expect(enrollmentsService.mineParams()).toEqual({ page: 0, size: 10 });
  });

  function getButtonByText(
    fixtureRef: ComponentFixture<MyEnrollments>,
    text: string
  ): HTMLButtonElement | undefined {
    return Array.from<HTMLButtonElement>(
      fixtureRef.nativeElement.querySelectorAll('button')
    ).find((button) => button.textContent?.trim() === text);
  }
});
