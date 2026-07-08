import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramResourcesComponent } from './program-resources.component';
import { ResourcesService } from '../../services/resources.service';
import { ProgramsService } from '../../services/programs.service';
import { ResourceResponse } from '../../core/models/resource.model';
import { ProgramResponse } from '../../core/models/program.model';
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

class FakeProgramsService {
  private readonly _refetchSpy = vi.fn();
  private queryState = signal<QueryState<ProgramResponse>>(createQueryState<ProgramResponse>());

  get refetchSpy() {
    return this._refetchSpy;
  }

  getProgramQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this._refetchSpy,
    };
  }

  setPending() {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isPending: true, refetch: this._refetchSpy });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), isError: true, error, refetch: this._refetchSpy });
  }

  setData(data: ProgramResponse) {
    this.queryState.set({ ...createQueryState<ProgramResponse>(), data, refetch: this._refetchSpy });
  }
}

class FakeResourcesService {
  readonly listParams = signal<{ programId: string | null; page: number; size: number }>({
    programId: null,
    page: 0,
    size: 50,
  });

  private queryState = signal<QueryState<PageResponse<ResourceResponse>>>(createQueryState<PageResponse<ResourceResponse>>());

  readonly resourcesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: vi.fn(),
  };

  readonly createMutation = {
    isPending: signal(false),
    mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    }),
  };

  readonly updateVisibilityMutation = {
    isPending: signal(false),
    mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    }),
  };

  readonly deleteMutation = {
    isPending: signal(false),
    mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    }),
  };

  readonly uploadUrlMutation = {
    isPending: signal(false),
    mutate: vi.fn(),
  };

  setData(items: ResourceResponse[]) {
    this.queryState.set({
      ...createQueryState<PageResponse<ResourceResponse>>(),
      data: { items, page: 0, totalElements: items.length, size: 50, totalPages: 1 },
    });
  }

  setPending() {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), isPending: true });
  }

  setError(error: Error) {
    this.queryState.set({ ...createQueryState<PageResponse<ResourceResponse>>(), isError: true, error });
  }
}

describe('ProgramResourcesComponent', () => {
  let component: ProgramResourcesComponent;
  let fixture: ComponentFixture<ProgramResourcesComponent>;
  let resourcesService: FakeResourcesService;
  let programsService: FakeProgramsService;
  let router: Router;

  const program: ProgramResponse = {
    id: 'program-1',
    organizationId: 'org-1',
    title: 'Git Fundamentals',
    description: 'Learn the basics of Git.',
    coverImageUrl: null,
    status: 'PUBLISHED',
    isPublished: true,
    startDate: null,
    endDate: null,
    createdAt: '2026-01-15T10:00:00Z',
  };

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
    createdAt: '2026-01-15T10:00:00Z',
  };

  beforeEach(async () => {
    resourcesService = new FakeResourcesService();
    programsService = new FakeProgramsService();

    await TestBed.configureTestingModule({
      imports: [ProgramResourcesComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ResourcesService, useValue: resourcesService },
        { provide: ProgramsService, useValue: programsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'program-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramResourcesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('should create', () => {
    resourcesService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set listParams from the route', () => {
    fixture.detectChanges();
    expect(resourcesService.listParams()).toEqual({
      programId: 'program-1',
      page: 0,
      size: 50,
    });
  });

  it('should show program title in the page header', () => {
    programsService.setData(program);
    resourcesService.setData([resource]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Resources: Git Fundamentals');
  });

  it('should show loading state while fetching resources', () => {
    resourcesService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading resources...');
  });

  it('should show error state with retry', () => {
    resourcesService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();
    expect(resourcesService.resourcesQuery.refetch).toHaveBeenCalled();
  });

  it('should show empty state when no resources', () => {
    programsService.setData(program);
    resourcesService.setData([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No resources yet');
  });

  it('should render resource list with title, type, and visibility', () => {
    programsService.setData(program);
    resourcesService.setData([resource]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Git Cheat Sheet');
    expect(fixture.nativeElement.textContent).toContain('Link');
    expect(fixture.nativeElement.textContent).toContain('Visible');
  });

  it('should open add resource form and create a resource', () => {
    programsService.setData(program);
    resourcesService.setData([]);
    fixture.detectChanges();

    expect(component.showForm()).toBe(false);
    component.openForm();
    expect(component.showForm()).toBe(true);

    component.form.setValue({
      title: 'New Resource',
      type: 'VIDEO_LINK',
      url: 'https://example.com/video',
    });
    component.onSubmit();

    expect(resourcesService.createMutation.mutate).toHaveBeenCalledWith(
      {
        programId: 'program-1',
        request: { title: 'New Resource', type: 'VIDEO_LINK', url: 'https://example.com/video' },
      },
      expect.any(Object)
    );
    expect(component.showForm()).toBe(false);
  });

  it('should not submit when form is invalid', () => {
    fixture.detectChanges();
    component.openForm();
    component.form.setValue({ title: '', type: 'LINK', url: '' });
    component.onSubmit();

    expect(resourcesService.createMutation.mutate).not.toHaveBeenCalled();
  });

  it('should toggle resource visibility', () => {
    programsService.setData(program);
    resourcesService.setData([resource]);
    fixture.detectChanges();

    component.toggleVisibility(resource);

    expect(resourcesService.updateVisibilityMutation.mutate).toHaveBeenCalledWith(
      {
        resourceId: 'resource-1',
        request: { visibleToParticipants: false },
      },
      expect.any(Object)
    );
  });

  it('should delete a resource after confirmation', () => {
    programsService.setData(program);
    resourcesService.setData([resource]);
    fixture.detectChanges();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.deleteResource(resource);

    expect(resourcesService.deleteMutation.mutate).toHaveBeenCalledWith('resource-1', expect.any(Object));
  });

  it('should not delete a resource when confirmation is cancelled', () => {
    fixture.detectChanges();

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteResource(resource);

    expect(resourcesService.deleteMutation.mutate).not.toHaveBeenCalled();
  });

  it('should open external link', () => {
    fixture.detectChanges();
    component.openLink(resource);

    expect(window.open).toHaveBeenCalledWith('https://example.com/git', '_blank', 'noopener,noreferrer');
  });

  it('should navigate back to program overview', () => {
    fixture.detectChanges();
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1']);
  });

  it('should return type labels', () => {
    expect(component.typeLabel('LINK')).toBe('Link');
    expect(component.typeLabel('FILE')).toBe('File');
    expect(component.typeLabel('IMAGE')).toBe('Image');
    expect(component.typeLabel('VIDEO_LINK')).toBe('Video link');
  });

  it('should return type icons', () => {
    expect(component.typeIcon('LINK')).toBe('🔗');
    expect(component.typeIcon('FILE')).toBe('📄');
    expect(component.typeIcon('IMAGE')).toBe('🖼️');
    expect(component.typeIcon('VIDEO_LINK')).toBe('🎬');
  });
});
