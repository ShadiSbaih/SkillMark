import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="state-card soft">
      <div class="h-4 w-32 animate-pulse rounded-[var(--radius-pill)] bg-[rgb(var(--ink-rgb)/0.1)]"></div>
      <div class="mt-5 grid gap-3">
        @for (_ of rows(); track $index) {
          <div class="h-10 animate-pulse rounded-[var(--radius-lg)] bg-[rgb(var(--ink-rgb)/0.06)]"></div>
        }
      </div>
    </div>
  `,
})
export class LoadingStateComponent {
  readonly rows = input([1, 2, 3]);
}

