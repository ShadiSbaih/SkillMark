import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
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
