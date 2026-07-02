import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EnrollmentsService } from '../../services/enrollments.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { EnrollmentStatus } from '../../core/models/enrollment.model';

@Component({
  selector: 'app-program-enrollments',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './program-enrollments.component.html',
  styleUrl: './program-enrollments.component.scss',
})
export class ProgramEnrollmentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly enrollmentsService = inject(EnrollmentsService);

  readonly isMyEnrollments = this.route.snapshot.routeConfig?.path === 'my-enrollments';
  readonly myEnrollmentsQuery = this.enrollmentsService.myEnrollmentsQuery;

  statusVariant(status: EnrollmentStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'REMOVED':
        return 'danger';
      default:
        return 'default';
    }
  }
}
