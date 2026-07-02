import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-[#64748d]">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-[#a8c3de] border-t-[#533afd]"></div>
      @if (message()) {
        <p class="mt-4 text-sm">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingStateComponent {
  readonly message = input('Loading...');
}
