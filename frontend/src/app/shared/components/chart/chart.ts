import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.html',
})
export class ChartComponent {
  type = input<'bar' | 'line' | 'pie'>('bar');
  labels = input<string[]>([]);
  data = input<number[]>([]);
  colors = input<string[]>(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);
  height = input<string>('256px');

  maxValue(): number {
    return Math.max(1, ...this.data());
  }

  barWidth(): number {
    const count = this.data().length || 1;
    return 100 / (count * 2);
  }
}
