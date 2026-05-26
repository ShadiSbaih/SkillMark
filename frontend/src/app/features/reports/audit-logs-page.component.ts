import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { OrganizationsApi } from '../../core/api/organizations.api';
import { CardComponent } from '../../shared/ui/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [CardComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent],
  template: `
    <app-page-header eyebrow="Audit" title="Audit logs" description="Organization activity history returned by the backend." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if ((query.data()?.items?.length ?? 0) === 0) {
      <app-empty-state title="No audit logs" description="Activity will appear after owner actions." />
    } @else {
      <div class="grid gap-3">
        @for (log of query.data()?.items ?? []; track log.id) {
          <app-card>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-normal">{{ log.action }}</p>
                <p class="text-xs text-[var(--color-ink-mute)]">{{ log.actorUserId || 'System' }} · {{ log.entityType || 'entity' }}</p>
              </div>
              <p class="font-tabular text-xs text-[var(--color-ink-mute)]">{{ log.createdAt }}</p>
            </div>
          </app-card>
        }
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
  readonly query = injectQuery(() => ({
    queryKey: ['audit-logs', this.organizationId, this.page()],
    queryFn: () => this.api.auditLogs(this.organizationId, this.page(), 10),
  }));
}

