import { Component, TemplateRef, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-[var(--color-canvas-soft)] text-xs uppercase tracking-[0.1px] text-[var(--color-ink-mute)]">
            <tr>
              @for (column of columns(); track column.key) {
                <th class="px-4 py-3 font-normal">{{ column.label }}</th>
              }
              <th class="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-hairline)]">
            @for (row of rows(); track trackRow(row)) {
              <tr class="align-top">
                @for (column of columns(); track column.key) {
                  <td class="px-4 py-3 text-[var(--color-ink-secondary)]">
                    <span [class.font-tabular]="column.numeric">{{ value(row, column.key) }}</span>
                  </td>
                }
                <td class="px-4 py-3">
                  @if (actions()) {
                    <ng-container *ngTemplateOutlet="actions(); context: { $implicit: row }" />
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DataTableComponent<T extends Record<string, unknown>> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<Array<{ key: keyof T & string; label: string; numeric?: boolean }>>();
  readonly actions = input<TemplateRef<{ $implicit: T }> | null>(null);

  value(row: T, key: keyof T & string): string {
    const value = row[key];
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  trackRow(row: T): unknown {
    return row['id'] ?? row['attemptId'] ?? JSON.stringify(row);
  }
}
