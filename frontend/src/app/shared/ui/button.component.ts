import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      class="app-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-normal transition disabled:cursor-not-allowed disabled:opacity-50"
      [class.bg-[var(--color-primary)]]="variant() === 'primary'"
      [class.text-white]="variant() === 'primary' || variant() === 'dark'"
      [class.hover:bg-[var(--color-primary-press)]]="variant() === 'primary'"
      [class.border]="variant() === 'secondary'"
      [class.border-[var(--color-primary)]]="variant() === 'secondary'"
      [class.bg-white]="variant() === 'secondary'"
      [class.text-[var(--color-primary)]]="variant() === 'secondary'"
      [class.bg-[var(--color-brand-dark)]]="variant() === 'dark'"
      [class.bg-transparent]="variant() === 'ghost'"
      [class.text-[var(--color-ink-secondary)]]="variant() === 'ghost'"
      [type]="type()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'dark' | 'ghost'>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
}

