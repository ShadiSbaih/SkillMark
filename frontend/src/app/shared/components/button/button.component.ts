import { Component, EventEmitter, input, output, Output } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  readonly clicked = output<MouseEvent>();
  @Output('onClick') readonly onClick = new EventEmitter<Event>();

  handleClick(event: MouseEvent): void {
    this.clicked.emit(event);
    this.onClick.emit(event);
  }

  readonly classes = () => {
    const variant = `app-button-${this.variant()}`;
    const size = `app-button-${this.size()}`;
    const width = this.fullWidth() ? 'app-button-full-width' : '';
    return `app-button ${variant} ${size} ${width}`.trim();
  };
}
