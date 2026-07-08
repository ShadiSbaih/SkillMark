import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditLogsComponent } from './audit-logs.component';
import { OrganizationsService } from '../../services/organizations.service';
import { OrganizationResponse } from '../../core/models/organization.model';
import { AuditLogResponse } from '../../core/models/audit-log.model';
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

class FakeOrganizationsService {
  private readonly organizationQueryState = signal<QueryState<OrganizationResponse>>(
    createQueryState<OrganizationResponse>()
  );
  private readonly auditLogsQueryState = signal<QueryState<PageResponse<AuditLogResponse>>>(
    createQueryState<PageResponse<AuditLogResponse>>()
  );

  getOrganizationQuery() {
    return {
      isPending: () => this.organizationQueryState().isPending,
      isError: () => this.organizationQueryState().isError,
      data: () => this.organizationQueryState().data,
      error: () => this.organizationQueryState().error,
      refetch: this.organizationQueryState().refetch,
    };
  }

  auditLogsQuery() {
    return {
      isPending: () => this.auditLogsQueryState().isPending,
      isError: () => this.auditLogsQueryState().isError,
      data: () => this.auditLogsQueryState().data,
      error: () => this.auditLogsQueryState().error,
      refetch: this.auditLogsQueryState().refetch,
    };
  }

  setOrganizationPending() {
    this.organizationQueryState.set({
      ...createQueryState<OrganizationResponse>(),
      isPending: true,
      refetch: this.organizationQueryState().refetch,
    });
  }

  setOrganizationData(data: OrganizationResponse) {
    this.organizationQueryState.set({
      ...createQueryState<OrganizationResponse>(),
      data,
      refetch: this.organizationQueryState().refetch,
    });
  }

  setAuditLogsPending() {
    this.auditLogsQueryState.set({
      ...createQueryState<PageResponse<AuditLogResponse>>(),
      isPending: true,
      refetch: this.auditLogsQueryState().refetch,
    });
  }

  setAuditLogsData(data: PageResponse<AuditLogResponse>) {
    this.auditLogsQueryState.set({
      ...createQueryState<PageResponse<AuditLogResponse>>(),
      data,
      refetch: this.auditLogsQueryState().refetch,
    });
  }
}

describe('AuditLogsComponent', () => {
  let component: AuditLogsComponent;
  let fixture: ComponentFixture<AuditLogsComponent>;
  let organizationsService: FakeOrganizationsService;

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

  const auditLog: AuditLogResponse = {
    id: 'log-1',
    organizationId: 'org-1',
    userId: 'user-1',
    action: 'CREATE_PROGRAM',
    entityType: 'PROGRAM',
    entityId: 'prog-1',
    metadata: null,
    ipAddress: null,
    userAgent: null,
    createdAt: '2026-07-02T10:00:00Z',
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();

    await TestBed.configureTestingModule({
      imports: [AuditLogsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'org-1' }),
            snapshot: { paramMap: { get: () => 'org-1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setOrganizationPending();
    organizationsService.setAuditLogsPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while queries are pending', () => {
    organizationsService.setOrganizationPending();
    organizationsService.setAuditLogsPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading audit logs...');
  });

  it('should display audit logs when data resolves', () => {
    organizationsService.setOrganizationData(organization);
    organizationsService.setAuditLogsData({
      items: [auditLog],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Inc');
    expect(text).toContain('Audit logs');
    expect(text).toContain('CREATE_PROGRAM');
    expect(text).toContain('PROGRAM');
    expect(text).toContain('prog-1');
  });

  it('should update page signal when goToPage is called', () => {
    organizationsService.setOrganizationData(organization);
    organizationsService.setAuditLogsData({
      items: [auditLog],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    component.goToPage(2);
    expect(component.page()).toBe(2);
  });
});
