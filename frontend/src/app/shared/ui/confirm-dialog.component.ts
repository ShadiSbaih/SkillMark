import { Component, input, output } from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-[rgb(var(--ink-rgb)/0.32)] p-4">
        <section class="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-6 shadow-[var(--shadow-strong)]">
          <h2 class="app-card-title">{{ title() }}</h2>
          <p class="mt-2 text-sm leading-6 text-[var(--color-ink-mute)]">{{ message() }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <app-button variant="ghost" (click)="cancel.emit()">Cancel</app-button>
            <app-button variant="dark" (click)="confirm.emit()">Confirm</app-button>
          </div>
        </section>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm action');
  readonly message = input('This action cannot be undone.');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}

