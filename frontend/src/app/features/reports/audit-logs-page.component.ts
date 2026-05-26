import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [FormsModule, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent],
  template: `
    <app-page-header eyebrow="Audit" title="Audit logs" description="Organization activity history returned by the backend." />
    <section class="filter-bar">
      <label class="app-label">Filter by Action
        <select class="app-input app-focus" [(ngModel)]="actionFilter">
          <option value="All">All</option>
          <option value="CERTIFICATE_ISSUED">CERTIFICATE_ISSUED</option>
          <option value="ATTEMPT_SUBMITTED">ATTEMPT_SUBMITTED</option>
          <option value="QUIZ_PUBLISHED">QUIZ_PUBLISHED</option>
          <option value="PROGRAM_CREATED">PROGRAM_CREATED</option>
        </select>
      </label>
      <label class="app-label">Filter by Date
        <input class="app-input app-focus" type="date" [(ngModel)]="dateFilter" />
      </label>
    </section>

    @if (query.isPending()) {
      <app-loading-state />
    } @else if (filteredLogs().length === 0) {
      <app-empty-state title="No audit logs" description="Activity will appear after owner actions." />
    } @else {
      <div class="app-table-shell">
        <table class="app-table">
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>
            @for (log of filteredLogs(); track log.id) {
              <tr>
                <td class="font-tabular">{{ log.createdAt }}</td>
                <td>{{ log.actorUserId || 'System' }}</td>
                <td>{{ log.action }}</td>
                <td>{{ log.entityType || 'entity' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
    }
  `,
})
export class AuditLogsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(OrganizationsApi);
  readonly organizationId = this.route.snapshot.paramMap.get('orgId') ?? '';
  readonly page = signal(0);
  actionFilter = 'All';
  dateFilter = '';

  readonly query = injectQuery(() => ({
    queryKey: ['audit-logs', this.organizationId, this.page()],
    enabled: !!this.organizationId,
    queryFn: () => this.api.auditLogs(this.organizationId, this.page(), 10),
  }));

  filteredLogs() {
    return (this.query.data()?.items ?? []).filter((log) => {
      const actionMatches = this.actionFilter === 'All' || log.action === this.actionFilter;
      const dateMatches = !this.dateFilter || log.createdAt.startsWith(this.dateFilter);
      return actionMatches && dateMatches;
    });
  }
}
