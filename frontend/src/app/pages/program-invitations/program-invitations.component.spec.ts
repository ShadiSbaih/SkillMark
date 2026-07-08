import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProgramInvitationsComponent } from './program-invitations.component';
import { InvitationsService } from '../../services/invitations.service';
import { ProgramsService } from '../../services/programs.service';
import { Invitation } from '../../core/models/invitation.model';
import { ProgramResponse } from '../../core/models/program.model';
import { PageResponse } from '../../core/api/api-response.model';

class FakeInvitationsService {
  readonly listParams = signal({
    programId: null as string | null,
    page: 0,
    size: 10,
  });

  private readonly refetchSpy = vi.fn();
  readonly queryState = signal({
    isPending: false,
    isError: false,
    data: null as PageResponse<Invitation> | null,
    error: null as Error | null,
    refetch: this.refetchSpy,
  });

  readonly createMutate = vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
    options?.onSuccess?.();
  });
  readonly disableMutate = vi.fn((_vars: string, options?: { onSuccess?: () => void }) => {
    options?.onSuccess?.();
  });

  readonly invitationsQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
    status: () => (this.queryState().isPending ? 'pending' : this.queryState().isError ? 'error' : 'success'),
  };

  readonly createMutation = {
    isPending: signal(false),
    mutate: this.createMutate,
  };

  readonly disableMutation = {
    isPending: signal(false),
    mutate: this.disableMutate,
  };

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

  setData(data: PageResponse<Invitation>) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
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

describe('ProgramInvitationsComponent', () => {
  let component: ProgramInvitationsComponent;
  let fixture: ComponentFixture<ProgramInvitationsComponent>;
  let invitationsService: FakeInvitationsService;
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

  const invitations: Invitation[] = [
    {
      id: 'inv-1',
      organizationId: 'org-1',
      programId: 'program-1',
      code: 'SPRING-2026',
      description: null,
      maxUses: 100,
      usedCount: 42,
      expiresAt: null,
      status: 'ACTIVE',
      disabledAt: null,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'inv-2',
      organizationId: 'org-1',
      programId: 'program-1',
      code: 'OLD-COHORT',
      description: null,
      maxUses: 50,
      usedCount: 50,
      expiresAt: null,
      status: 'DISABLED',
      disabledAt: '2026-02-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const pageResponse: PageResponse<Invitation> = {
    items: invitations,
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    invitationsService = new FakeInvitationsService();
    programsService = new FakeProgramsService();
    programsService.setProgram(program);

    await TestBed.configureTestingModule({
      imports: [ProgramInvitationsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: InvitationsService, useValue: invitationsService },
        { provide: ProgramsService, useValue: programsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramInvitationsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    invitationsService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set listParams from the route', () => {
    fixture.detectChanges();
    expect(invitationsService.listParams()).toEqual({
      programId: 'program-1',
      page: 0,
      size: 10,
    });
  });

  it('should show the program title in the header', () => {
    fixture.detectChanges();
    expect(component.pageTitle()).toBe('Invitations: Foundations of Testing');
    expect(fixture.nativeElement.textContent).toContain('Invitations: Foundations of Testing');
  });

  it('should show loading state while fetching', () => {
    invitationsService.setPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading invitations...');
  });

  it('should show error state with retry', () => {
    invitationsService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-error-state app-button');
    retryButton.click();
    expect(invitationsService.queryState).toBeDefined();
  });

  it('should render the invitations table', () => {
    invitationsService.setData(pageResponse);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('SPRING-2026');
    expect(fixture.nativeElement.textContent).toContain('OLD-COHORT');
    expect(fixture.nativeElement.textContent).toContain('42 / 100');
    expect(fixture.nativeElement.textContent).toContain('50 / 50');
    expect(fixture.nativeElement.textContent).toContain('ACTIVE');
    expect(fixture.nativeElement.textContent).toContain('DISABLED');
  });

  it('should show empty state when there are no invitations', () => {
    invitationsService.setData({ ...pageResponse, items: [], totalElements: 0 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No invitations yet');
  });

  it('should compute the correct badge variant for each status', () => {
    expect(component.badgeVariant('ACTIVE')).toBe('success');
    expect(component.badgeVariant('DISABLED')).toBe('danger');
    expect(component.badgeVariant('EXPIRED')).toBe('warning');
  });

  it('should build the join URL from a code', () => {
    expect(component.joinUrl('ABC-123')).toBe(`${window.location.origin}/join/ABC-123`);
  });

  it('should copy the join URL to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    component.copyCode('ABC-123');
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/join/ABC-123`);
  });

  it('should call create mutation with max uses', () => {
    fixture.detectChanges();
    component.maxUses.set(25);

    component.createInvitation();

    expect(invitationsService.createMutate).toHaveBeenCalledWith(
      {
        programId: 'program-1',
        request: {
          description: null,
          maxUses: 25,
          expiresAt: null,
        },
      },
      expect.any(Object)
    );
    expect(component.maxUses()).toBe(100);
  });

  it('should send null max uses when input is empty', () => {
    fixture.detectChanges();
    component.maxUses.set(NaN);

    component.createInvitation();

    expect(invitationsService.createMutate).toHaveBeenCalledWith(
      {
        programId: 'program-1',
        request: {
          description: null,
          maxUses: null,
          expiresAt: null,
        },
      },
      expect.any(Object)
    );
  });

  it('should call disable mutation', () => {
    fixture.detectChanges();
    component.disable('inv-1');
    expect(invitationsService.disableMutate).toHaveBeenCalledWith('inv-1', expect.any(Object));
  });

  it('should navigate pages', () => {
    invitationsService.setData({ ...pageResponse, totalElements: 20, totalPages: 2 });
    fixture.detectChanges();

    component.goToPage(1);
    expect(invitationsService.listParams()).toEqual({
      programId: 'program-1',
      page: 1,
      size: 10,
    });
  });
});
