import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EnrollmentsService } from '../../services/enrollments.service';
import { Enrollment } from '../../core/models/enrollment.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

type EnrichedEnrollment = Enrollment & {
  programTitle?: string;
  organizationName?: string;
};

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './my-enrollments.html',
  styleUrl: './my-enrollments.scss',
})
export class MyEnrollments {
  private readonly enrollmentsService = inject(EnrollmentsService);

  readonly query = this.enrollmentsService.myEnrollmentsQuery;
  readonly params = this.enrollmentsService.mineParams;

  readonly page = computed(() => this.params().page);
  readonly size = computed(() => this.params().size);
  readonly data = computed(() => this.query.data());
  readonly enrollments = computed(
    () => (this.data()?.items ?? []) as EnrichedEnrollment[]
  );
  readonly totalElements = computed(() => this.data()?.totalElements ?? 0);
  readonly totalPages = computed(() => this.data()?.totalPages ?? 0);
  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() < this.totalPages() - 1);

  goToPage(page: number): void {
    this.params.set({ page, size: this.size() });
  }
}
