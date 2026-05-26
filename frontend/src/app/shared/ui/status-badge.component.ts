import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      {{ status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly classes = computed(() => {
    const status = this.status().toUpperCase();
    if (['ACTIVE', 'PUBLISHED', 'COMPLETED', 'SUBMITTED'].includes(status)) {
      return 'status-badge status-success';
    }
    if (['REVOKED', 'DELETED', 'CANCELLED', 'REMOVED'].includes(status)) {
      return 'status-badge status-danger';
    }
    if (['ARCHIVED', 'EXPIRED', 'DISABLED'].includes(status)) {
      return 'status-badge status-warning';
    }
    if (['IN_PROGRESS', 'DRAFT'].includes(status)) {
      return 'status-badge status-neutral';
    }
    return 'status-badge status-primary';
  });
}

