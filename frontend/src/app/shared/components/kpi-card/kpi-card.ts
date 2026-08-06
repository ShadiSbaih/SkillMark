import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent, StatusBadgeEntity } from '../status-badge/status-badge';

export type KpiColor = 'indigo' | 'emerald' | 'amber' | 'violet' | 'sky' | 'rose';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  readonly percentage = input<number>();
  readonly color = input<KpiColor>('indigo');
  readonly status = input<string>();
  readonly entity = input<StatusBadgeEntity>('program');

  readonly dashArray = computed(() => {
    const pct = Math.min(100, Math.max(0, this.percentage() ?? 0));
    return `${pct}, 100`;
  });

  readonly strokeColorClass = computed(() => `stroke-${this.color()}`);
  readonly iconBgClass = computed(() => `color-${this.color()}`);
}
