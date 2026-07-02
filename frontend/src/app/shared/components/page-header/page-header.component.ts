import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-[#0d253d]">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm text-[#64748d]">{{ subtitle() }}</p>
        }
      </div>
      @if (hasActions()) {
        <div class="flex items-center gap-3">
          <ng-content select="[actions]" />
        </div>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly hasActions = input(false);
}
