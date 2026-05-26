import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="page-header-copy">
        <p class="page-breadcrumb">{{ breadcrumb() || eyebrow() }}</p>
        <h1 class="page-title">{{ title() }}</h1>
        @if (description()) {
          <p class="page-description">{{ description() }}</p>
        }
      </div>
      <div class="page-actions">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input('Skillmark');
  readonly breadcrumb = input<string | null>(null);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}

