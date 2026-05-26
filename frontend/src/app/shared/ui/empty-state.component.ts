import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="state-card">
      <p class="app-card-title">{{ title() }}</p>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-ink-mute)]">{{ description() }}</p>
      <div class="mt-5">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('No records yet');
  readonly description = input('Create the first record or adjust the filters.');
}

