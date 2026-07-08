import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignUp } from './sign-up';

@Component({
  selector: 'clerk-sign-up',
  standalone: true,
  template: '<div class="clerk-sign-up-stub">clerk-sign-up</div>',
})
class ClerkSignUpStubComponent {
  @Input() props?: Record<string, unknown>;
}

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;

  beforeEach(async () => {
    TestBed.overrideComponent(SignUp, {
      set: { imports: [ClerkSignUpStubComponent] },
    });

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [provideRouter([])],
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

  it('should render the clerk sign-up component', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('clerk-sign-up');
  });

  it('should pass sign-up props to the clerk component', () => {
    fixture.detectChanges();
    const clerkComponent = fixture.nativeElement.querySelector('clerk-sign-up');
    expect(clerkComponent).toBeTruthy();
    expect(component.signUpProps.signInUrl).toBe('/sign-in');
    expect(component.signUpProps.afterSignUpUrl).toBe('/dashboard');
  });
});
