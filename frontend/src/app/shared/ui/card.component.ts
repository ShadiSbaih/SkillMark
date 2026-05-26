import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  host: {
    class: 'block',
  },
  template: `
    <section
      class="app-card"
      [class.light]="tone() === 'light'"
      [class.cream]="tone() === 'cream'"
      [class.dark]="tone() === 'dark'"
    >
      <ng-content />
    </section>
  `,
})
export class CardComponent {
  readonly tone = input<'light' | 'cream' | 'dark'>('light');
}

