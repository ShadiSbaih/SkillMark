import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AttemptsService } from '../../services/attempts.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-my-attempts',
  standalone: true,
  imports: [
    DatePipe,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './my-attempts.html',
  styles: ``,
})
export class MyAttempts {
  private readonly attemptsService = inject(AttemptsService);
  readonly router = inject(Router);

  readonly query = this.attemptsService.myAttemptsQuery;
  readonly params = this.attemptsService.mineParams;

  readonly page = computed(() => this.params().page);
  readonly size = computed(() => this.params().size);
  readonly data = computed(() => this.query.data());
  readonly totalPages = computed(() => this.data()?.totalPages ?? 0);
  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() < this.totalPages() - 1);

  goToPage(page: number): void {
    this.params.set({ page, size: this.size() });
  }

  goToPrevious(): void {
    if (this.hasPrevious()) {
      this.goToPage(this.page() - 1);
    }
  }

  goToNext(): void {
    if (this.hasNext()) {
      this.goToPage(this.page() + 1);
    }
  }

  statusVariant(attempt: any): 'success' | 'danger' | 'warning' | 'default' {
    if (attempt.status === 'IN_PROGRESS') {
      return 'warning';
    }
    if (attempt.status === 'EXPIRED' || attempt.status === 'CANCELLED') {
      return 'default';
    }
    return attempt.passed ? 'success' : 'danger';
  }
}
