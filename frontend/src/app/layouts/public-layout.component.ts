import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '../shared/ui/button.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ButtonComponent],
  template: `
    <main class="mesh-bg min-h-screen bg-white">
      <header class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a routerLink="/" class="text-xl font-normal tracking-[-0.2px] text-[var(--color-ink)]">Skillmark</a>
        <nav class="flex items-center gap-2">
          <a routerLink="/verify" class="rounded-full px-3 py-2 text-sm text-[var(--color-ink-secondary)]">Verify</a>
          <a routerLink="/sign-in" class="rounded-full px-3 py-2 text-sm text-[var(--color-ink-secondary)]">Sign in</a>
          <a routerLink="/sign-up"><app-button>Get started</app-button></a>
        </nav>
      </header>
      <router-outlet />
    </main>
  `,
})
export class PublicLayoutComponent {}

