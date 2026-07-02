import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="mb-4 rounded-full bg-red-50 p-4 text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-[#0d253d]">Something went wrong</h3>
      <p class="mt-1 max-w-sm text-sm text-[#64748d]">{{ message() || 'Please try again.' }}</p>
      <app-button class="mt-6" (clicked)="retry.emit()">Try again</app-button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input<string>();
  readonly retry = output<void>();
}
