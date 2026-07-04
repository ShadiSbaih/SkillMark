import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'solid' | 'subtle' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<string>();
  variant = input<BadgeVariant>('subtle');
  size = input<BadgeSize>('md');

  private readonly colorMap: Record<string, string> = {
    active: 'green',
    published: 'green',
    approved: 'green',
    passed: 'green',
    success: 'green',
    completed: 'green',
    pending: 'amber',
    invited: 'amber',
    draft: 'amber',
    in_progress: 'amber',
    inactive: 'red',
    rejected: 'red',
    failed: 'red',
    expired: 'red',
    revoked: 'red',
  };

  color(): string {
    return this.colorMap[this.status().toLowerCase()] ?? 'gray';
  }
}
