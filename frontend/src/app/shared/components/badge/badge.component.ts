import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeColor = 'green' | 'amber' | 'red' | 'gray' | 'blue';
type BadgeStyle = 'subtle' | 'solid' | 'outline';
type LegacyBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const LEGACY_COLOR_MAP: Record<LegacyBadgeVariant, BadgeColor> = {
  default: 'gray',
  success: 'green',
  warning: 'amber',
  danger: 'red',
  info: 'blue',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly color = input<BadgeColor>('gray');
  readonly style = input<BadgeStyle>('subtle');
  readonly variant = input<LegacyBadgeVariant>('default');

  private readonly resolvedColor = computed<BadgeColor>(() => {
    const legacy = this.variant();
    if (legacy && legacy !== 'default') {
      return LEGACY_COLOR_MAP[legacy];
    }
    return this.color();
  });

  readonly classes = () => {
    const color = this.resolvedColor();
    const style = this.style();
    return `app-badge app-badge--${color}-${style}`;
  };
}
