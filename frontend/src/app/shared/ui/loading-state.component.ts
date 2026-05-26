import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
      <div class="h-4 w-32 animate-pulse rounded-full bg-slate-200"></div>
      <div class="mt-5 grid gap-3">
        @for (_ of rows(); track $index) {
          <div class="h-10 animate-pulse rounded-lg bg-slate-100"></div>
        }
      </div>
    </div>
  `,
})
export class LoadingStateComponent {
  readonly rows = input([1, 2, 3]);
}

