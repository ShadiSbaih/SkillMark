import { Component, ContentChildren, input, output, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingStateComponent } from '../loading-state/loading-state.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { TableColumnDirective } from './table-column.directive';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, LoadingStateComponent, EmptyStateComponent, ErrorStateComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T> {
  readonly headers = input<string[]>([]);
  readonly items = input<T[]>([]);
  readonly loading = input(false);
  readonly error = input<string>();
  readonly loadingMessage = input('Loading...');
  readonly emptyMessage = input('No items found.');
  readonly trackByFn = input<(index: number, item: T) => unknown>();

  readonly retry = output<void>();

  @ContentChildren(TableColumnDirective, { descendants: true })
  columnTemplates!: QueryList<TableColumnDirective>;

  columnTemplateFor(header: string): TableColumnDirective | undefined {
    return this.columnTemplates?.find((column) => column.name() === header);
  }

  cellValue(item: T, header: string): unknown {
    return (item as Record<string, unknown>)[header];
  }

  trackRow(index: number, item: T): unknown {
    const trackBy = this.trackByFn();
    return trackBy ? trackBy(index, item) : index;
  }
}
