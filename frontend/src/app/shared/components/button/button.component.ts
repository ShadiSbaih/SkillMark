import { Component, input, output } from '@angular/core';

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
      (click)="clicked.emit($event)"
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
  readonly clicked = output<MouseEvent>();

  readonly classes = () => {
    const variant = `app-button-${this.variant()}`;
    const size = `app-button-${this.size()}`;
    return `app-button ${variant} ${size}`;
  };
}
