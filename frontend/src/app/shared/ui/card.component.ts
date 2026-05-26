import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <section
      class="rounded-xl border p-6 shadow-[rgba(0,55,112,0.08)_0_1px_3px]"
      [class.border-[var(--color-hairline)]]="tone() !== 'dark'"
      [class.bg-white]="tone() === 'light'"
      [class.bg-[var(--color-canvas-cream)]]="tone() === 'cream'"
      [class.border-transparent]="tone() === 'dark'"
      [class.bg-[var(--color-brand-dark)]]="tone() === 'dark'"
      [class.text-white]="tone() === 'dark'"
    >
      <ng-content />
    </section>
  `,
})
export class CardComponent {
  readonly tone = input<'light' | 'cream' | 'dark'>('light');
}

