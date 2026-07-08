import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { CreateOrganizationComponent } from './create-organization.component';
import { OrganizationsService } from '../../../services/organizations.service';
import { OrganizationResponse } from '../../../core/models/organization.model';

interface MutationOptions {
  onSuccess?: (data: OrganizationResponse) => void;
  onSettled?: () => void;
}

class FakeOrganizationsService {
  private readonly _isPending = signal(false);

  readonly createMutation = {
    isPending: () => this._isPending(),
    mutate: vi.fn((request: unknown, options?: MutationOptions) => {
      this._isPending.set(false);
      options?.onSuccess?.({
        id: 'new-org',
        name: (request as { name: string }).name,
        description: null,
        logoUrl: null,
        ownerId: 'user-1',
        status: 'ACTIVE',
        createdAt: '2026-07-08T10:00:00Z',
      });
      options?.onSettled?.();
    }),
  };
}

describe('CreateOrganizationComponent', () => {
  let component: CreateOrganizationComponent;
  let fixture: ComponentFixture<CreateOrganizationComponent>;
  let organizationsService: FakeOrganizationsService;

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();

    await TestBed.configureTestingModule({
      imports: [CreateOrganizationComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require name and enforce max length', () => {
    const name = component.form.get('name');
    expect(name?.valid).toBe(false);
    expect(name?.hasError('required')).toBe(true);

    name?.setValue('a'.repeat(101));
    expect(name?.hasError('maxlength')).toBe(true);

    name?.setValue('Acme Inc');
    expect(name?.valid).toBe(true);
  });

  it('should auto-generate slug from name when slug is untouched', () => {
    component.form.get('name')?.setValue('Acme 123 Organization');
    component.onNameChange();

    expect(component.form.get('slug')?.value).toBe('acme-123-organization');
  });

  it('should not overwrite slug once it has been manually edited', () => {
    const slug = component.form.get('slug');
    slug?.setValue('custom-slug');
    slug?.markAsDirty();

    component.form.get('name')?.setValue('New Name');
    component.onNameChange();

    expect(slug?.value).toBe('custom-slug');
  });

  it('should enforce slug pattern', () => {
    const slug = component.form.get('slug');

    slug?.setValue('Invalid_Slug');
    expect(slug?.hasError('pattern')).toBe(true);

    slug?.setValue('valid-slug-123');
    expect(slug?.valid).toBe(true);
  });

  it('should enforce description max length', () => {
    const description = component.form.get('description');

    description?.setValue('a'.repeat(501));
    expect(description?.hasError('maxlength')).toBe(true);

    description?.setValue('Short description');
    expect(description?.valid).toBe(true);
  });

  it('should enforce logoUrl max length', () => {
    const logoUrl = component.form.get('logoUrl');

    logoUrl?.setValue(`https://example.com/${'a'.repeat(500)}`);
    expect(logoUrl?.hasError('maxlength')).toBe(true);

    logoUrl?.setValue('https://example.com/logo.png');
    expect(logoUrl?.valid).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(organizationsService.createMutation.mutate).not.toHaveBeenCalled();
  });

  it('should submit with name, description and logoUrl, omitting slug', () => {
    component.form.setValue({
      name: 'Acme Inc',
      slug: 'acme-inc',
      description: 'A sample organization',
      logoUrl: 'https://example.com/logo.png',
    });

    component.onSubmit();

    expect(organizationsService.createMutation.mutate).toHaveBeenCalledWith(
      {
        name: 'Acme Inc',
        description: 'A sample organization',
        logoUrl: 'https://example.com/logo.png',
      },
      expect.any(Object)
    );
  });

  it('should omit empty optional fields from submission', () => {
    component.form.setValue({
      name: 'Acme Inc',
      slug: 'acme-inc',
      description: '',
      logoUrl: '',
    });

    component.onSubmit();

    expect(organizationsService.createMutation.mutate).toHaveBeenCalledWith(
      {
        name: 'Acme Inc',
      },
      expect.any(Object)
    );
  });

  it('should navigate to organization detail on successful creation', () => {
    const navigateSpy = vi.spyOn(component.router, 'navigate').mockResolvedValue(true);

    component.form.setValue({
      name: 'Acme Inc',
      slug: 'acme-inc',
      description: '',
      logoUrl: '',
    });

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/organizations', 'new-org']);
  });
});
