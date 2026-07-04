import { TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramsService } from './programs.service';
import { ApiClientService } from '../core/api/api-client.service';
import { ProgramResponse } from '../core/models/program.model';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let apiClient: ApiClientService;

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Sample Program',
    description: null,
    coverImageUrl: null,
    status: 'DRAFT',
    isPublished: false,
    startDate: null,
    endDate: null,
    createdAt: '2026-07-04T10:00:00Z',
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
        ProgramsService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(ProgramsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish a program via PATCH /programs/:id/status', async () => {
    vi.mocked(apiClient.patch).mockReturnValue(of({ ...program, status: 'PUBLISHED' }));

    const result = await service.publishMutation.mutateAsync('program-1');

    expect(result.status).toBe('PUBLISHED');
    expect(apiClient.patch).toHaveBeenCalledWith('programs/program-1/status', {
      status: 'PUBLISHED',
    });
  });

  it('should archive a program via PATCH /programs/:id/status', async () => {
    vi.mocked(apiClient.patch).mockReturnValue(of({ ...program, status: 'ARCHIVED' }));

    const result = await service.archiveMutation.mutateAsync('program-1');

    expect(result.status).toBe('ARCHIVED');
    expect(apiClient.patch).toHaveBeenCalledWith('programs/program-1/status', {
      status: 'ARCHIVED',
    });
  });
});
