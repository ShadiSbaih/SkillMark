import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <section class="grid min-h-[calc(100vh-6rem)] place-items-center px-6">
      <div class="max-w-md text-center">
        <p class="font-tabular text-sm text-[var(--color-primary)]">404</p>
        <h1 class="mt-3 text-4xl font-light tracking-[-0.96px]">Page not found</h1>
        <p class="mt-3 text-sm leading-6 text-[var(--color-ink-mute)]">The route does not exist or is not available for the current workspace.</p>
        <a routerLink="/" class="mt-6 inline-flex"><app-button>Back home</app-button></a>
      </div>
    </section>
  `,
})
export class NotFoundPageComponent {}

