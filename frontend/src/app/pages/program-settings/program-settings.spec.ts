import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramSettings } from './program-settings';
import { ProgramsService } from '../../services/programs.service';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramResponse } from '../../core/models/program.model';
import { OrganizationResponse } from '../../core/models/organization.model';

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

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

class FakeProgramsService {
  private queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());
  private readonly _updatePending = signal(false);
  private readonly _publishPending = signal(false);
  private readonly _archivePending = signal(false);
  private readonly _deletePending = signal(false);

  readonly updateMutation = {
    isPending: () => this._updatePending(),
    mutate: vi.fn((_vars: unknown, options?: MutationOptions) => {
      this._updatePending.set(false);
      options?.onSuccess?.();
    }),
  };

  readonly publishMutation = {
    isPending: () => this._publishPending(),
    mutate: vi.fn((_id: string, options?: MutationOptions) => {
      this._publishPending.set(false);
      options?.onSuccess?.();
    }),
  };

  readonly archiveMutation = {
    isPending: () => this._archivePending(),
    mutate: vi.fn((_id: string, options?: MutationOptions) => {
      this._archivePending.set(false);
      options?.onSuccess?.();
    }),
  };

  readonly deleteMutation = {
    isPending: () => this._deletePending(),
    mutate: vi.fn((_id: string, options?: MutationOptions) => {
      this._deletePending.set(false);
      options?.onSuccess?.();
    }),
  };

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

class FakeOrganizationsService {
  private queryState = signal<QueryState<OrganizationResponse>>(createQueryState<OrganizationResponse>());

  getOrganizationQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setData(data: OrganizationResponse) {
    this.queryState.set({ ...createQueryState<OrganizationResponse>(), data, refetch: this.queryState().refetch });
  }
}

describe('ProgramSettings', () => {
  let component: ProgramSettings;
  let fixture: ComponentFixture<ProgramSettings>;
  let programsService: FakeProgramsService;
  let organizationsService: FakeOrganizationsService;
  let router: Router;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Git Fundamentals',
    description: 'Learn Git',
    coverImageUrl: null,
    status: 'DRAFT',
    isPublished: false,
    startDate: '2026-08-01T10:00:00Z',
    endDate: '2026-08-15T10:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
  };

  beforeEach(async () => {
    programsService = new FakeProgramsService();
    organizationsService = new FakeOrganizationsService();

    await TestBed.configureTestingModule({
      imports: [ProgramSettings],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
        { provide: OrganizationsService, useValue: organizationsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramSettings);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should prefill form with program data', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    expect(component.form.value.title).toBe('Git Fundamentals');
    expect(component.form.value.status).toBe('DRAFT');
    expect(component.form.value.description).toBe('Learn Git');
    expect(component.form.value.startDate).toBe('2026-08-01T00:00');
    expect(component.form.value.endDate).toBe('2026-08-15T00:00');
  });

  it('should call update mutation on submit when status is unchanged', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.form.setValue({
      title: 'Updated Title',
      status: 'DRAFT',
      description: 'Updated description',
      startDate: '2026-08-01T00:00',
      endDate: '2026-08-15T00:00',
    });
    component.onSubmit();

    expect(programsService.updateMutation.mutate).toHaveBeenCalledWith(
      {
        programId: 'program-1',
        request: {
          title: 'Updated Title',
          description: 'Updated description',
          startDate: '2026-08-01',
          endDate: '2026-08-15',
        },
      },
      expect.any(Object)
    );
    expect(programsService.publishMutation.mutate).not.toHaveBeenCalled();
    expect(programsService.archiveMutation.mutate).not.toHaveBeenCalled();
  });

  it('should publish then update when status changes to PUBLISHED', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.form.patchValue({ status: 'PUBLISHED' });
    component.onSubmit();

    expect(programsService.publishMutation.mutate).toHaveBeenCalledWith('program-1', expect.any(Object));
    expect(programsService.updateMutation.mutate).toHaveBeenCalled();
  });

  it('should archive then update when status changes to ARCHIVED', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.form.patchValue({ status: 'ARCHIVED' });
    component.onSubmit();

    expect(programsService.archiveMutation.mutate).toHaveBeenCalledWith('program-1', expect.any(Object));
    expect(programsService.updateMutation.mutate).toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.form.setValue({
      title: '',
      status: 'DRAFT',
      description: '',
      startDate: '',
      endDate: '',
    });
    component.onSubmit();

    expect(programsService.updateMutation.mutate).not.toHaveBeenCalled();
  });

  it('should call delete mutation and navigate to organizations on confirm', () => {
    programsService.setData(program);
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.openDeleteDialog();
    component.deleteProgram();

    expect(programsService.deleteMutation.mutate).toHaveBeenCalledWith('program-1', expect.any(Object));
  });
});
