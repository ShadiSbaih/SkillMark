import { Component, TemplateRef, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="app-table-shell">
      @if (caption()) {
        <div class="table-caption-row">
          <p>{{ caption() }}</p>
          <span>{{ rows().length }} shown</span>
        </div>
      }
      <div class="overflow-x-auto">
        <table class="app-table">
          <thead>
            <tr>
              @for (column of columns(); track column.key) {
                <th class="px-4 py-3 font-normal">{{ column.label }}</th>
              }
              <th class="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
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
            } @empty {
              <tr>
                <td class="px-4 py-8 text-center text-sm text-[var(--color-ink-mute)]" [attr.colspan]="columns().length + 1">
                  {{ emptyLabel() }}
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
  readonly emptyLabel = input('No records match this view.');
  readonly caption = input<string | null>(null);

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
