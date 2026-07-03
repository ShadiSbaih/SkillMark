import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content />`,
  host: {
    class: 'block p-6',
    style:
      'background: var(--canvas); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-1); color: var(--ink);',
  },
})
export class CardComponent {}
