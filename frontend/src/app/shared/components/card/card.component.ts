import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardComponent {
  readonly interactive = input(false);

  readonly classes = () => {
    return `block p-6 app-card ${this.interactive() ? 'app-card-interactive' : ''}`;
  };
}
