import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '../shared/ui/button.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ButtonComponent],
  template: `
    <main class="public-shell" [class.mesh-bg]="isLanding()" [class.mesh-hero]="isLanding()">
      <header class="public-header">
        <div class="public-header-inner container-shell">
          <a routerLink="/" class="public-brand font-display">Skillmark</a>
          @if (isLanding()) {
            <nav class="public-nav">
              <a routerLink="/verify" class="public-link">Verify</a>
              <a routerLink="/sign-in" class="public-link">Sign in</a>
              <a routerLink="/sign-up"><app-button>Sign up</app-button></a>
            </nav>
          } @else if (isAuth()) {
            <nav class="public-nav">
              <a routerLink="/verify" class="public-link">Verify</a>
              <a routerLink="/" class="public-link">Home</a>
            </nav>
          }
        </div>
      </header>
      <router-outlet />
    </main>
  `,
})
export class PublicLayoutComponent {
  constructor(private readonly router: Router) {}

  isLanding(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  isAuth(): boolean {
    return this.router.url.startsWith('/sign-');
  }
}

