import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-ink-mute)]">
      <span class="font-tabular">Page {{ page() + 1 }} of {{ totalPages() || 1 }} · {{ totalElements() }} total</span>
      <div class="flex gap-2">
        <button class="app-button secondary app-focus text-sm disabled:opacity-50" [disabled]="page() <= 0" (click)="pageChange.emit(page() - 1)">
          Previous
        </button>
        <button class="app-button secondary app-focus text-sm disabled:opacity-50" [disabled]="page() + 1 >= totalPages()" (click)="pageChange.emit(page() + 1)">
          Next
        </button>
      </div>
    </nav>
  `,
})
export class PaginationComponent {
  readonly page = input(0);
  readonly totalPages = input(0);
  readonly totalElements = input(0);
  readonly pageChange = output<number>();
}

