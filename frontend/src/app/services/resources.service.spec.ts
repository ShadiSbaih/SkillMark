import { TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourcesService } from './resources.service';
import { ApiClientService } from '../core/api/api-client.service';
import { ResourceResponse } from '../core/models/resource.model';
import { R2UploadUrlResponse } from '../core/models/storage.model';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let apiClient: ApiClientService;

  const resource: ResourceResponse = {
    id: 'resource-1',
    programId: 'program-1',
    title: 'Git Cheat Sheet',
    description: null,
    type: 'LINK',
    url: 'https://example.com/git',
    storageProvider: null,
    objectKey: null,
    visibleToParticipants: true,
    status: 'ACTIVE',
    position: 0,
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
        ResourcesService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(ResourcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a resource via POST /programs/:id/resources', async () => {
    vi.mocked(apiClient.post).mockReturnValue(of(resource));

    const result = await service.createMutation.mutateAsync({
      programId: 'program-1',
      request: {
        title: 'Git Cheat Sheet',
        type: 'LINK',
        url: 'https://example.com/git',
      },
    });

    expect(result.title).toBe('Git Cheat Sheet');
    expect(apiClient.post).toHaveBeenCalledWith('programs/program-1/resources', {
      title: 'Git Cheat Sheet',
      type: 'LINK',
      url: 'https://example.com/git',
    });
  });

  it('should update visibility via PATCH /resources/:id/visibility', async () => {
    vi.mocked(apiClient.patch).mockReturnValue(of({ ...resource, visibleToParticipants: false }));

    const result = await service.updateVisibilityMutation.mutateAsync({
      resourceId: 'resource-1',
      request: { visibleToParticipants: false },
    });

    expect(result.visibleToParticipants).toBe(false);
    expect(apiClient.patch).toHaveBeenCalledWith('resources/resource-1/visibility', {
      visibleToParticipants: false,
    });
  });

  it('should delete a resource via DELETE /resources/:id', async () => {
    vi.mocked(apiClient.delete).mockReturnValue(of(undefined));

    await service.deleteMutation.mutateAsync('resource-1');

    expect(apiClient.delete).toHaveBeenCalledWith('resources/resource-1');
  });

  it('should fetch an upload URL via POST /storage/upload-urls', async () => {
    const uploadUrlResponse: R2UploadUrlResponse = {
      uploadUrl: 'https://r2.example.com/upload',
      publicUrl: 'https://cdn.example.com/file.pdf',
      storageKey: 'file.pdf',
    };
    vi.mocked(apiClient.post).mockReturnValue(of(uploadUrlResponse));

    const result = await service.uploadUrlMutation.mutateAsync({
      fileName: 'file.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
    });

    expect(result).toEqual(uploadUrlResponse);
    expect(apiClient.post).toHaveBeenCalledWith('storage/upload-urls', {
      fileName: 'file.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
    });
  });
});
