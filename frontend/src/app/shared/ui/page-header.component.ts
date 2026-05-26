import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="app-eyebrow">{{ eyebrow() }}</p>
        <h1 class="app-title">{{ title() }}</h1>
        @if (description()) {
          <p class="app-description">{{ description() }}</p>
        }
      </div>
      <div class="flex flex-wrap gap-2">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input('Skillmark');
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}

