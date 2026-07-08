import { Component } from '@angular/core';
import { ClerkSignUpComponent } from 'ngx-clerk';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ClerkSignUpComponent],
  templateUrl: './sign-up.html',
})
export class SignUp {
  readonly signUpProps = {
    signInUrl: '/sign-in',
    afterSignUpUrl: '/dashboard',
  };
}
