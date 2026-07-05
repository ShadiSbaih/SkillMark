import { Component, input } from '@angular/core';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  readonly classes = () => `app-badge app-badge-${this.variant()}`;
}
