import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="loading-state flex flex-col gap-3 w-full py-8">
      <div class="animate-pulse bg-surface-hover h-6 w-1/3 rounded"></div>
      <div class="animate-pulse bg-surface-hover h-24 w-full rounded mt-2"></div>
      <div class="animate-pulse bg-surface-hover h-24 w-full rounded"></div>
      @if (message()) {
        <p class="text-center text-ink-mute mt-4 text-sm font-medium animate-pulse">{{ message() }}</p>
      }
    </div>
  `,
  styleUrl: './loading-state.component.scss',
})
export class LoadingStateComponent {
  readonly message = input('Loading...');
}
