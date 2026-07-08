import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { ClerkService } from 'ngx-clerk';
import { vi } from 'vitest';
import { Profile } from './profile';
import { UsersService } from '../../services/users.service';
import { UserResponse } from '../../core/models/user.model';

class FakeUsersService {
  meQuery = {
    isPending: () => false,
    isError: () => false,
    data: () => null as UserResponse | null,
    error: () => null as Error | null,
    refetch: vi.fn(),
  };

  updateMeMutation = {
    isPending: () => false,
    mutate: vi.fn(),
  };
}

function createFakeClerkService(user: Partial<{ imageUrl: string; fullName: string; primaryEmailAddress: { emailAddress: string } }> = {}) {
  return {
    user: signal(user),
  };
}

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let usersService: FakeUsersService;
  let clerkService: ReturnType<typeof createFakeClerkService>;

  const mockUser: UserResponse = {
    id: 'user-1',
    clerkUserId: 'clerk-1',
    email: 'alice@example.com',
    name: 'Alice Doe',
    avatarUrl: 'https://example.com/avatar.png',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    usersService = new FakeUsersService();
    clerkService = createFakeClerkService({
      imageUrl: 'https://clerk.com/avatar.png',
      fullName: 'Alice Doe',
      primaryEmailAddress: { emailAddress: 'alice@example.com' },
    });

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: UsersService, useValue: usersService },
        { provide: ClerkService, useValue: clerkService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while profile is loading', () => {
    usersService.meQuery.isPending = () => true;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-loading-state'))).toBeTruthy();
  });

  it('should show error state with retry action', () => {
    usersService.meQuery.isPending = () => false;
    usersService.meQuery.isError = () => true;
    usersService.meQuery.error = () => new Error('Network error');
    fixture.detectChanges();

    const errorState = fixture.debugElement.query(By.css('app-error-state'));
    expect(errorState).toBeTruthy();

    errorState.triggerEventHandler('retry', undefined);
    expect(usersService.meQuery.refetch).toHaveBeenCalled();
  });

  it('should show empty state when no profile data exists', () => {
    usersService.meQuery.isPending = () => false;
    usersService.meQuery.isError = () => false;
    usersService.meQuery.data = () => null;
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();

    emptyState.triggerEventHandler('action', undefined);
    expect(usersService.meQuery.refetch).toHaveBeenCalled();
  });

  it('should sync form values from loaded profile', () => {
    usersService.meQuery.data = () => mockUser;
    fixture.detectChanges();

    expect(component.form.value).toEqual({
      name: 'Alice Doe',
    });
  });

  it('should use Clerk avatar URL', () => {
    usersService.meQuery.data = () => mockUser;
    fixture.detectChanges();

    expect(component.avatarUrl()).toBe('https://clerk.com/avatar.png');
  });

  it('should not submit when form is invalid', () => {
    usersService.meQuery.data = () => mockUser;
    fixture.detectChanges();

    component.form.patchValue({ name: '' });
    component.onSubmit();

    expect(usersService.updateMeMutation.mutate).not.toHaveBeenCalled();
  });

  it('should submit update with display name', () => {
    usersService.meQuery.data = () => mockUser;
    fixture.detectChanges();

    component.form.setValue({
      name: 'Alice Smith',
    });
    component.onSubmit();

    expect(usersService.updateMeMutation.mutate).toHaveBeenCalledWith(
      {
        name: 'Alice Smith',
      },
      expect.any(Object)
    );
  });
});
