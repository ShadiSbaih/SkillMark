import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="state-card error">
      <p class="app-card-title">{{ title() }}</p>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-ink-mute)]">{{ message() }}</p>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly title = input('Unable to load this view');
  readonly message = input('Check your connection and try again.');
}

