import { Component } from '@angular/core';
import { ClerkUserProfileComponent } from 'ngx-clerk';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ClerkUserProfileComponent],
  templateUrl: './profile.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Profile {}
