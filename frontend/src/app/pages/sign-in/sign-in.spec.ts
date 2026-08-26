import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { SignIn } from './sign-in';
import { AuthService } from '../../core/auth/auth.service';

class FakeAuthService {
  readonly user = signal(null);
  readonly isSignedIn = signal(false);
  readonly isLoaded = signal(true);

  login = vi.fn().mockResolvedValue(undefined);
  logout = vi.fn().mockResolvedValue(undefined);
}

describe('SignIn', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;
  let authService: FakeAuthService;

  beforeEach(async () => {
    authService = new FakeAuthService();

    await TestBed.configureTestingModule({
      imports: [SignIn],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignIn);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the sign-in heading', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Welcome back');
  });

  it('should render email and password fields', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should call AuthService.login on valid submit', async () => {
    fixture.detectChanges();

    component.form.setValue({
      email: 'alice@example.com',
      password: 'password123',
    });

    await component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    });
  });

  it('should not submit when form is invalid', async () => {
    fixture.detectChanges();

    component.form.setValue({
      email: '',
      password: '',
    });

    await component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
