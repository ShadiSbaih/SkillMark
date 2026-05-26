import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { EnrollmentsApi } from '../../core/api/enrollments.api';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-enrollments-page',
  standalone: true,
  imports: [CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Enrollments" [title]="programId ? 'Program enrollments' : 'My enrollments'" description="Review participant enrollment status." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if ((query.data()?.items?.length ?? 0) === 0) {
      <app-empty-state title="No enrollments" description="Enrollments will appear after users join programs." />
    } @else {
      <div class="grid gap-3">
        @for (enrollment of query.data()?.items ?? []; track enrollment.id) {
          <app-card>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-normal">{{ enrollment.userName }}</p>
                <p class="font-tabular text-xs text-[var(--color-ink-mute)]">Program {{ enrollment.programId }}</p>
              </div>
              <app-status-badge [status]="enrollment.status" />
            </div>
          </app-card>
        }
      </div>
      <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
    }
  `,
})
export class EnrollmentsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(EnrollmentsApi);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);
  readonly query = injectQuery(() => ({
    queryKey: ['enrollments', this.programId || 'me', this.page()],
    queryFn: () => this.programId ? this.api.list(this.programId, this.page(), 10) : this.api.mine(this.page(), 10),
  }));
}

