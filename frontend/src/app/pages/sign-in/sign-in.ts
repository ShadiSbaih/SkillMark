import { Component } from '@angular/core';
import { ClerkSignInComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ClerkSignInComponent],
  templateUrl: './sign-in.html',
})
export class SignIn {
  readonly signInProps = {
    signUpUrl: '/sign-up',
    afterSignInUrl: '/dashboard',
  };
}
