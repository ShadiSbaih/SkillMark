import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="mb-4 rounded-full bg-[#f6f9fc] p-4 text-[#64748d]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-[#0d253d]">{{ title() }}</h3>
      <p class="mt-1 max-w-sm text-sm text-[#64748d]">{{ description() }}</p>
      @if (actionLabel()) {
        <app-button class="mt-6" (clicked)="action.emit()">{{ actionLabel() }}</app-button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('Nothing here');
  readonly description = input('No data available.');
  readonly actionLabel = input<string>();
  readonly action = output<void>();
}
