import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-xs font-normal uppercase tracking-[0.1px] text-[var(--color-primary-deep)]">{{ eyebrow() }}</p>
        <h1 class="mt-2 text-[2rem] font-light leading-[1.1] tracking-[-0.64px] text-[var(--color-ink)]">
          {{ title() }}
        </h1>
        @if (description()) {
          <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-ink-mute)]">{{ description() }}</p>
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

