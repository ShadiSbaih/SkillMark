import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttemptsService } from '../../services/attempts.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-my-attempts',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './my-attempts.html',
  styles: ``,
})
export class MyAttempts {
  private readonly attemptsService = inject(AttemptsService);

  readonly query = this.attemptsService.myAttemptsQuery;
  readonly params = this.attemptsService.mineParams;

  readonly page = computed(() => this.params().page);
  readonly size = computed(() => this.params().size);
  readonly data = computed(() => this.query.data());

  onPageChange(pageOneIndexed: number): void {
    this.params.set({ page: pageOneIndexed - 1, size: this.size() });
  }
}
