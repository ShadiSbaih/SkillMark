import { TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { EnrollmentsService } from './enrollments.service';
import { ApiClientService } from '../core/api/api-client.service';
import { Enrollment } from '../core/models/enrollment.model';
import { PageResponse } from '../core/api/api-response.model';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let apiClient: jasmine.SpyObj<ApiClientService>;

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
    apiClient = jasmine.createSpyObj('ApiClientService', ['getPage']);

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
    apiClient.getPage.and.returnValue(of(pageResponse));

    const query = service.myEnrollmentsQuery;

    expect(query.queryKey()).toEqual(['enrollments', 'me', 0, 10]);
    expect(apiClient.getPage).toHaveBeenCalledWith('enrollments/me', { page: 0, size: 10 });
  });

  it('should update query when mineParams change', () => {
    apiClient.getPage.and.returnValue(of(pageResponse));

    service.mineParams.set({ page: 1, size: 20 });

    expect(service.myEnrollmentsQuery.queryKey()).toEqual(['enrollments', 'me', 1, 20]);
    expect(apiClient.getPage).toHaveBeenCalledWith('enrollments/me', { page: 1, size: 20 });
  });
});
