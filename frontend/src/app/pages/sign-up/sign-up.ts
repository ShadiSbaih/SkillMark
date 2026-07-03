import { Component } from '@angular/core';
import { ClerkSignUpComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ClerkSignUpComponent],
  templateUrl: './sign-up.html',
  styles: `
    :host {
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      background-color: #f6f9fc;
      padding: 1.5rem;
    }
  `,
})
export class SignUp {
  readonly signUpProps = {
    signInUrl: '/sign-in',
    afterSignUpUrl: '/dashboard',
  };
}
