import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '../shared/ui/button.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ButtonComponent],
  template: `
    <main class="public-shell mesh-bg mesh-hero">
      <header class="public-header">
        <div class="public-header-inner container-shell">
          <a routerLink="/" class="public-brand font-display">Skillmark</a>
          <nav class="public-nav">
            <a routerLink="/verify" class="public-link">Verify</a>
            <a routerLink="/sign-in" class="public-link">Sign in</a>
            <a routerLink="/sign-up"><app-button>Get started</app-button></a>
          </nav>
        </div>
      </header>
      <router-outlet />
    </main>
  `,
})
export class PublicLayoutComponent {}

