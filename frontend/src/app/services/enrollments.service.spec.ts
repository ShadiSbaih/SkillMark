import { TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { EnrollmentsService } from './enrollments.service';
import { ApiClientService } from '../core/api/api-client.service';
import { Enrollment } from '../core/models/enrollment.model';
import { PageResponse } from '../core/api/api-response.model';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let apiClient: ApiClientService;

  const pageResponse: PageResponse<Enrollment> = {
    items: [
      {
        id: 'enrollment-1',
        programId: 'program-1',
        userId: 'user-1',
        userName: 'Ada Lovelace',
        status: 'ACTIVE',
        enrolledAt: '2026-02-14T10:00:00Z',
      },
    ],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    apiClient = {
      getPage: vi.fn().mockReturnValue(of(pageResponse)),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClientService;

    TestBed.configureTestingModule({
      providers: [
        EnrollmentsService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(EnrollmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default mineParams to page 0 and size 10', () => {
    expect(service.mineParams()).toEqual({ page: 0, size: 10 });
  });

  it('should expose a myEnrollmentsQuery using the current mineParams', () => {
    expect(service.myEnrollmentsQuery).toBeTruthy();
    expect(service.mineParams()).toEqual({ page: 0, size: 10 });
  });

  it('should update mineParams', () => {
    service.mineParams.set({ page: 1, size: 20 });
    expect(service.mineParams()).toEqual({ page: 1, size: 20 });
  });
});
