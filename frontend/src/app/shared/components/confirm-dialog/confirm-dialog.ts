import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styles: ``,
})
export class ConfirmDialog {
  title = input<string>('Confirm');
  message = input<string>('Are you sure?');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  isDanger = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
