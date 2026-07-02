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
    const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[#533afd] text-white hover:bg-[#3f2bd4]',
      secondary: 'bg-[#f6f9fc] text-[#0d253d] border border-[#a8c3de] hover:bg-[#eaf0f7]',
      ghost: 'bg-transparent text-[#64748d] hover:bg-[#f6f9fc] hover:text-[#0d253d]',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  };
}
