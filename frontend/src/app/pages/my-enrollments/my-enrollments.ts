import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EnrollmentsService } from '../../services/enrollments.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './my-enrollments.html',
  styleUrl: './my-enrollments.scss',
})
export class MyEnrollments {
  private readonly enrollmentsService = inject(EnrollmentsService);
  readonly router = inject(Router);

  readonly query = this.enrollmentsService.myEnrollmentsQuery;
  readonly params = this.enrollmentsService.mineParams;

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

  statusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'warning';
      case 'REMOVED':
        return 'danger';
      default:
        return 'default';
    }
  }
}
