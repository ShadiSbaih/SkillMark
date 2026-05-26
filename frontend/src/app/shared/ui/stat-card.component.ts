import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <article class="stat-card" [class.dark]="tone() === 'dark'" [class.warm]="tone() === 'warm'">
      <div class="stat-card-topline">
        @if (icon()) {
          <span class="stat-card-icon">{{ icon() }}</span>
        }
        <span>{{ label() }}</span>
      </div>
      <strong class="stat-card-value font-tabular">{{ value() }}</strong>
      @if (hint()) {
        <p class="stat-card-hint">{{ hint() }}</p>
      }
    </article>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly tone = input<'light' | 'dark' | 'warm'>('light');
}
