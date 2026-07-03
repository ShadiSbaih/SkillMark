import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkSignInComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ClerkSignInComponent],
  templateUrl: './sign-in.html',
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
export class SignIn {
  private readonly router = inject(Router);
  readonly signInProps = {
    signUpUrl: '/sign-up',
    afterSignInUrl: '/dashboard',
  };
}
