import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationsService } from '../../services/organizations.service';
import { OrganizationResponse } from '../../core/models/organization.model';
import { PageResponse } from '../../core/api/api-response.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: PageResponse<T> | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

class FakeQuery<T> {
  private readonly _refetchSpy = vi.fn();
  private readonly _state = signal<QueryState<T>>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: this._refetchSpy,
  });

  readonly query = {
    isPending: () => this._state().isPending,
    isError: () => this._state().isError,
    data: () => this._state().data,
    error: () => this._state().error,
    refetch: this._refetchSpy,
  };

  get refetchSpy() {
    return this._refetchSpy;
  }

  setPending() {
    this._state.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: this._refetchSpy,
    });
  }

  setError(error: Error) {
    this._state.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this._refetchSpy,
    });
  }

  setData(data: PageResponse<T>) {
    this._state.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this._refetchSpy,
    });
  }
}

class FakeOrganizationsService {
  readonly listParams = signal({ page: 0, size: 10 });
  private readonly _organizationsQuery = new FakeQuery<OrganizationResponse>();

  readonly organizationsQuery = this._organizationsQuery.query;

  get organizationsRefetchSpy() {
    return this._organizationsQuery.refetchSpy;
  }

  setOrganizationsPending() {
    this._organizationsQuery.setPending();
  }

  setOrganizationsError(error: Error) {
    this._organizationsQuery.setError(error);
  }

  setOrganizationsData(data: PageResponse<OrganizationResponse>) {
    this._organizationsQuery.setData(data);
  }
}

describe('OrganizationsComponent', () => {
  let component: OrganizationsComponent;
  let fixture: ComponentFixture<OrganizationsComponent>;
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
      imports: [OrganizationsComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setOrganizationsPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show loading state while organizations are pending', () => {
    organizationsService.setOrganizationsPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading organizations...');
  });

  it('should show error state when query fails and allow retry', () => {
    organizationsService.setOrganizationsError(new Error('Network error'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Something went wrong');
    expect(text).toContain('Network error');

    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(organizationsService.organizationsRefetchSpy).toHaveBeenCalled();
  });

  it('should show empty state when there are no organizations', () => {
    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No organizations yet');
    expect(text).toContain('Create organization');
  });

  it('should render table headers', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const headers = Array.from(fixture.nativeElement.querySelectorAll('th')).map(
      (th) => (th as HTMLElement).textContent
    );
    expect(headers).toEqual(['Name', 'Slug', 'Role', 'Created']);
  });

  it('should render organization row with slug derived from name', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Inc');
    expect(text).toContain('acme-inc');
    expect(text).toContain('Owner');

    const link = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    ).find((a) => a.textContent?.includes('Acme Inc'));
    expect(link?.getAttribute('href')).toBe('/organizations/org-1');
  });

  it('should not render pagination when there is only one page', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Page 0 of 1');
  });

  it('should render pagination when there are multiple pages', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 11,
      totalPages: 2,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Page 0 of 2');
  });

  it('should update service list params on page change', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 11,
      totalPages: 2,
    });
    fixture.detectChanges();

    component.onPageChange(1);

    expect(organizationsService.listParams().page).toBe(1);
  });
});
