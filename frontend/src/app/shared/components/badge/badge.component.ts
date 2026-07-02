import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span [ngClass]="classes()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  readonly classes = () => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    const variants: Record<BadgeVariant, string> = {
      default: 'bg-[#f6f9fc] text-[#0d253d] border border-[#a8c3de]',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return `${base} ${variants[this.variant()]}`;
  };
}
