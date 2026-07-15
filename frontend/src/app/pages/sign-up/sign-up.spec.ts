import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { SignUp } from './sign-up';
import { AuthService } from '../../core/auth/auth.service';

class FakeAuthService {
  readonly user = signal(null);
  readonly isSignedIn = signal(false);
  readonly isLoaded = signal(true);

  register = vi.fn().mockResolvedValue(undefined);
  logout = vi.fn().mockResolvedValue(undefined);
}

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let authService: FakeAuthService;

  beforeEach(async () => {
    authService = new FakeAuthService();

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the sign-up heading', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Create your account');
  });

  it('should show an optional organization name field', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[formControlName="organizationName"]')).toBeTruthy();
  });

  it('should register an owner with organization name', async () => {
    fixture.detectChanges();

    component.form.setValue({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      organizationName: 'Acme Inc',
    });

    await component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
      role: 'OWNER',
      organizationName: 'Acme Inc',
    });
  });

  it('should register a plain account without a role when no org name', async () => {
    fixture.detectChanges();

    component.form.setValue({
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      organizationName: '',
    });

    await component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: 'password123',
    });
  });

  it('should show an error when passwords do not match', async () => {
    fixture.detectChanges();

    component.form.setValue({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
      confirmPassword: 'different',
      organizationName: '',
    });

    await component.onSubmit();

    expect(component.error()).toBe('Passwords do not match.');
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should not submit when form is invalid', async () => {
    fixture.detectChanges();

    component.form.setValue({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
    });

    await component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
  });
});
