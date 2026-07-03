import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [ngClass]="classes()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly clicked = output<MouseEvent>();

  readonly classes = () => {
    const base = 'inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-deep)]',
      secondary: 'bg-[var(--canvas-soft)] text-[var(--ink)] border border-[var(--hairline-input)] hover:bg-[var(--primary-bg-subdued-hover)]',
      ghost: 'bg-transparent text-[var(--ink-mute)] hover:bg-[var(--canvas-soft)] hover:text-[var(--ink)]',
      danger: 'bg-[var(--ruby)] text-[var(--on-primary)] hover:bg-[var(--danger)]',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  };
}
