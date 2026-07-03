import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProgramOverviewComponent } from './program-overview.component';
import { ProgramsService } from '../../services/programs.service';
import { ProgramResponse } from '../../core/models/program.model';

class FakeProgramsService {
  publishIsPending = signal(false);
  archiveIsPending = signal(false);
  publishMutate = vi.fn();
  archiveMutate = vi.fn();

  readonly publishMutation = {
    isPending: () => this.publishIsPending(),
    mutate: this.publishMutate,
  } as unknown as ReturnType<typeof vi.fn>;

  readonly archiveMutation = {
    isPending: () => this.archiveIsPending(),
    mutate: this.archiveMutate,
  } as unknown as ReturnType<typeof vi.fn>;

  private queryState = signal({
    isPending: false,
    isError: false,
    data: null as ProgramResponse | null,
    error: null as Error | null,
    refetch: vi.fn(),
  });

  get refetchSpy() {
    return this.queryState().refetch;
  }

  getProgramQuery() {
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

  setData(data: ProgramResponse) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
    });
  }
}

describe('ProgramOverviewComponent', () => {
  let component: ProgramOverviewComponent;
  let fixture: ComponentFixture<ProgramOverviewComponent>;
  let programsService: FakeProgramsService;
  let router: Router;

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Git Fundamentals',
    description: 'Learn the basics of Git.',
    coverImageUrl: null,
    status: 'DRAFT',
    isPublished: false,
    startDate: null,
    endDate: null,
    createdAt: '2026-01-15T10:00:00Z',
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();

    await TestBed.configureTestingModule({
      imports: [ProgramOverviewComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramOverviewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    programsService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while fetching', () => {
    programsService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading program...');
  });

  it('should show error state with retry', () => {
    programsService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-button');
    retryButton.click();
    expect(programsService.refetchSpy).toHaveBeenCalled();
  });

  it('should display program details and stats', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Fundamentals');
    expect(fixture.nativeElement.textContent).toContain('Learn the basics of Git.');
    expect(fixture.nativeElement.textContent).toContain('DRAFT');
    expect(fixture.nativeElement.textContent).toContain('Quizzes');
    expect(fixture.nativeElement.textContent).toContain('Enrollments');
  });

  it('should enable publish when status is DRAFT', () => {
    programsService.setData(program);
    fixture.detectChanges();

    expect(component.canPublish()).toBe(true);
    expect(component.canArchive()).toBe(true);
  });

  it('should disable publish when status is PUBLISHED', () => {
    programsService.setData({ ...program, status: 'PUBLISHED', isPublished: true });
    fixture.detectChanges();

    expect(component.canPublish()).toBe(false);
    expect(component.canArchive()).toBe(true);
  });

  it('should disable archive when status is ARCHIVED', () => {
    programsService.setData({ ...program, status: 'ARCHIVED' });
    fixture.detectChanges();

    expect(component.canPublish()).toBe(false);
    expect(component.canArchive()).toBe(false);
  });

  it('should call publish mutation', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.publish();
    expect(programsService.publishMutate).toHaveBeenCalledWith('program-1', expect.any(Object));
  });

  it('should call archive mutation', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.archive();
    expect(programsService.archiveMutate).toHaveBeenCalledWith('program-1', expect.any(Object));
  });

  it('should navigate back', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/organizations']);
  });

  it('should navigate to quick action routes', () => {
    programsService.setData(program);
    fixture.detectChanges();

    component.router.navigate(['/programs', 'program-1', 'quizzes']);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'quizzes']);
  });
});
