import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (open()) {
      <div class="modal-backdrop" (click)="close.emit()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <h3>{{ title() }}</h3>
          <div class="modal-body">
            <ng-content />
          </div>
          <div class="modal-actions">
            <app-button variant="ghost" (clicked)="close.emit()">Cancel</app-button>
            <app-button [variant]="confirmVariant()" (clicked)="confirm.emit()">{{ confirmLabel() }}</app-button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly confirmVariant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly close = output<void>();
  readonly confirm = output<void>();
}
