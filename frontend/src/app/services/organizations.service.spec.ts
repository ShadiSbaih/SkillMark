import { TestBed } from '@angular/core/testing';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationsService } from './organizations.service';
import { ApiClientService } from '../core/api/api-client.service';
import { AuditLogResponse } from '../core/models/audit-log.model';
import { PageResponse } from '../core/api/api-response.model';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let apiClient: ApiClientService;

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

  const pageResponse: PageResponse<AuditLogResponse> = {
    items: [auditLog],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    apiClient = {
      getPage: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClientService;

    TestBed.configureTestingModule({
      providers: [
        OrganizationsService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(OrganizationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default listParams to page 0 and size 10', () => {
    expect(service.listParams()).toEqual({ page: 0, size: 10 });
  });

  it('should fetch audit logs for an organization via the correct endpoint', async () => {
    vi.mocked(apiClient.getPage).mockReturnValue(of(pageResponse));

    const query = TestBed.runInInjectionContext(() =>
      service.auditLogsQuery(() => 'org-1', () => 0, () => 10)
    );
    await query.refetch();

    expect(apiClient.getPage).toHaveBeenCalledWith(
      'organizations/org-1/audit-logs',
      {
        page: 0,
        size: 10,
      }
    );
  });

  it('should not fetch audit logs when the organization id is null', () => {
    TestBed.runInInjectionContext(() =>
      service.auditLogsQuery(() => null, () => 0, () => 10)
    );

    expect(apiClient.getPage).not.toHaveBeenCalled();
  });
});
