import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="close.emit()">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-medium text-[#0d253d]">{{ title() }}</h3>
          <div class="mt-2 text-sm text-[#64748d]">
            <ng-content />
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <app-button variant="ghost" (clicked)="close.emit()">Cancel</app-button>
            <app-button variant="danger" (clicked)="confirm.emit()">{{ confirmLabel() }}</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly close = output<void>();
  readonly confirm = output<void>();
}
