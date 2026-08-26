import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables,
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly type = input.required<ChartType>();
  readonly data = input.required<ChartData>();
  readonly options = input<ChartConfiguration['options']>();
  readonly height = input<number>(240);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && changes['data']) {
      this.chart.data = this.data();
      this.chart.update();
    }
    if (this.chart && changes['options']) {
      this.chart.options = this.buildOptions() ?? {};
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    const canvas = this.canvas().nativeElement;
    canvas.style.height = `${this.height()}px`;
    this.chart = new Chart(canvas, {
      type: this.type(),
      data: this.data(),
      options: this.buildOptions() ?? {},
    });
  }

  private buildOptions(): ChartConfiguration['options'] {
    const base: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          cornerRadius: 8,
        },
      },
    };
    const provided = this.options();
    if (!provided) {
      return base;
    }
    return {
      ...base,
      ...provided,
      plugins: {
        ...base.plugins,
        ...provided.plugins,
      },
    };
  }
}
