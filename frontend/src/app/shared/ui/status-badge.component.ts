import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-normal" [class]="classes()">
      {{ status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly classes = computed(() => {
    const status = this.status();
    if (['ACTIVE', 'PUBLISHED', 'COMPLETED'].includes(status)) {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (['REVOKED', 'DELETED', 'CANCELLED'].includes(status)) {
      return 'bg-rose-50 text-rose-700';
    }
    if (['ARCHIVED', 'EXPIRED'].includes(status)) {
      return 'bg-amber-50 text-amber-700';
    }
    if (['IN_PROGRESS', 'DRAFT'].includes(status)) {
      return 'bg-slate-100 text-slate-700';
    }
    return 'bg-indigo-50 text-[var(--color-primary-deep)]';
  });
}

