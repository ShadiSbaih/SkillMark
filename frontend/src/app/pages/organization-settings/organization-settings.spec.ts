import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationSettings } from './organization-settings';
import { OrganizationsService } from '../../services/organizations.service';
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

class FakeOrganizationsService {
  private readonly queryState = signal<QueryState<OrganizationResponse>>(createQueryState<OrganizationResponse>());
  private readonly _updatePending = signal(false);
  private readonly _deletePending = signal(false);

  readonly updateMutation = {
    isPending: () => this._updatePending(),
    mutate: vi.fn((_vars: unknown, options?: MutationOptions) => {
      this._updatePending.set(false);
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

describe('OrganizationSettings', () => {
  let component: OrganizationSettings;
  let fixture: ComponentFixture<OrganizationSettings>;
  let organizationsService: FakeOrganizationsService;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();

    await TestBed.configureTestingModule({
      imports: [OrganizationSettings],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'org-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationSettings);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setData(organization);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should prefill form with organization data', () => {
    organizationsService.setData(organization);
    fixture.detectChanges();

    expect(component.form.value.name).toBe('Acme Inc');
    expect(component.form.value.description).toBe('A sample organization');
  });

  it('should call update mutation on submit', () => {
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.form.setValue({ name: 'Updated Name', description: 'Updated description' });
    component.onSubmit();

    expect(organizationsService.updateMutation.mutate).toHaveBeenCalledWith(
      {
        organizationId: 'org-1',
        request: { name: 'Updated Name', description: 'Updated description' },
      },
      expect.any(Object)
    );
  });

  it('should not submit when form is invalid', () => {
    organizationsService.setData(organization);
    fixture.detectChanges();

    component.form.setValue({ name: '', description: '' });
    component.onSubmit();

    expect(organizationsService.updateMutation.mutate).not.toHaveBeenCalled();
  });

  it('should call delete mutation and navigate to organizations on confirm', () => {
    organizationsService.setData(organization);
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(component.router, 'navigate');
    component.openDeleteModal();
    component.deleteOrganization();

    expect(organizationsService.deleteMutation.mutate).toHaveBeenCalledWith('org-1', expect.any(Object));
    expect(navigateSpy).toHaveBeenCalledWith(['/organizations']);
  });
});
