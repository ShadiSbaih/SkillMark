import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="rounded-xl border border-rose-100 bg-rose-50 p-5 text-rose-800">
      <p class="text-sm font-normal">{{ title() }}</p>
      <p class="mt-1 text-sm">{{ message() }}</p>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly title = input('Unable to load this view');
  readonly message = input('Check your connection and try again.');
}

