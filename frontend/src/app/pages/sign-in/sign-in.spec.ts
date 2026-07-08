import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignIn } from './sign-in';

@Component({
  selector: 'clerk-sign-in',
  standalone: true,
  template: '<div class="clerk-sign-in-stub">clerk-sign-in</div>',
})
class ClerkSignInStubComponent {
  @Input() props?: Record<string, unknown>;
}

describe('SignIn', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;

  beforeEach(async () => {
    TestBed.overrideComponent(SignIn, {
      set: { imports: [ClerkSignInStubComponent] },
    });

    await TestBed.configureTestingModule({
      imports: [SignIn],
      providers: [provideRouter([])],
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

  it('should render the clerk sign-in component', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('clerk-sign-in');
  });

  it('should pass sign-in props to the clerk component', () => {
    fixture.detectChanges();
    const clerkComponent = fixture.nativeElement.querySelector('clerk-sign-in');
    expect(clerkComponent).toBeTruthy();
    expect(component.signInProps.signUpUrl).toBe('/sign-up');
    expect(component.signInProps.afterSignInUrl).toBe('/dashboard');
  });
});
