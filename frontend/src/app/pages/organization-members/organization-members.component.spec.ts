import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationMembersComponent } from './organization-members.component';
import { MembershipsService } from '../../services/memberships.service';
import { MembershipResponse } from '../../core/models/membership.model';
import { PageResponse } from '../../core/api/api-response.model';

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

class FakeMembershipsService {
  readonly listParams = signal<{ organizationId: string | null; page: number; size: number }>({
    organizationId: null,
    page: 0,
    size: 10,
  });

  private readonly queryState = signal<QueryState<PageResponse<MembershipResponse>>>(createQueryState<PageResponse<MembershipResponse>>());

  readonly membershipsQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
    status: () => this.queryState().isPending ? 'pending' : this.queryState().isError ? 'error' : 'success',
  };

  readonly addMutation = {
    isPending: () => false,
    mutate: vi.fn((_vars: unknown, options?: MutationOptions) => {
      options?.onSuccess?.();
    }),
  };

  readonly removeMutation = {
    isPending: () => false,
    mutate: vi.fn((_vars: unknown, options?: MutationOptions) => {
      options?.onSuccess?.();
    }),
  };

  setData(data: PageResponse<MembershipResponse>) {
    this.queryState.set({ ...createQueryState<PageResponse<MembershipResponse>>(), data, refetch: this.queryState().refetch });
  }
}

describe('OrganizationMembersComponent', () => {
  let component: OrganizationMembersComponent;
  let fixture: ComponentFixture<OrganizationMembersComponent>;
  let membershipsService: FakeMembershipsService;

  const member: MembershipResponse = {
    id: 'member-1',
    organizationId: 'org-1',
    userId: 'user-1',
    userName: 'Alice Doe',
    userEmail: 'alice@example.com',
    role: 'OWNER',
    status: 'ACTIVE',
    invitedBy: null,
    joinedAt: '2026-07-01T10:00:00Z',
    removedBy: null,
    removedAt: null,
    createdAt: '2026-07-01T10:00:00Z',
  };

  beforeEach(async () => {
    membershipsService = new FakeMembershipsService();

    await TestBed.configureTestingModule({
      imports: [OrganizationMembersComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: MembershipsService, useValue: membershipsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'org-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationMembersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    membershipsService.setData({
      items: [member],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render table headers Member, Role, Status, Actions', () => {
    membershipsService.setData({
      items: [member],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const headers = Array.from(fixture.nativeElement.querySelectorAll('th')).map(
      (th) => (th as HTMLElement).textContent?.trim()
    );
    expect(headers).toEqual(['Member', 'Role', 'Status', 'Actions']);
  });

  it('should render member name and email', () => {
    membershipsService.setData({
      items: [member],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Alice Doe');
    expect(text).toContain('alice@example.com');
  });

  it('should call add mutation with userId and role', () => {
    membershipsService.setData({
      items: [member],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    component.addForm.setValue({ userId: 'user-2', role: 'PARTICIPANT' });
    component.addMember();

    expect(membershipsService.addMutation.mutate).toHaveBeenCalledWith(
      {
        organizationId: 'org-1',
        request: { userId: 'user-2', role: 'PARTICIPANT' },
      },
      expect.any(Object)
    );
  });

  it('should call remove mutation when removing a member', () => {
    membershipsService.setData({
      items: [member],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    component.confirmRemove('user-1');
    component.removeMember();

    expect(membershipsService.removeMutation.mutate).toHaveBeenCalledWith(
      { organizationId: 'org-1', userId: 'user-1' },
      expect.any(Object)
    );
  });

  it('should update list params on page change', () => {
    membershipsService.setData({
      items: [member],
      page: 0,
      size: 10,
      totalElements: 15,
      totalPages: 2,
    });
    fixture.detectChanges();

    component.goToPage(1);

    expect(membershipsService.listParams().page).toBe(1);
    expect(membershipsService.listParams().organizationId).toBe('org-1');
  });
});
