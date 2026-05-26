import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { EnrollmentsApi } from '../../core/api/enrollments.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-enrollments-page',
  standalone: true,
  imports: [ButtonComponent, ConfirmDialogComponent, EmptyStateComponent, LoadingStateComponent, PageHeaderComponent, PaginationComponent, StatusBadgeComponent],
  template: `
    <app-page-header eyebrow="Enrollments" [title]="programId ? 'Program enrollments' : 'My enrollments'" description="Review participant enrollment status." />
    @if (query.isPending()) {
      <app-loading-state />
    } @else if ((query.data()?.items?.length ?? 0) === 0) {
      <app-empty-state title="No enrollments" description="Enrollments will appear after users join programs." />
    } @else {
      <div class="app-table-shell">
        <table class="app-table">
          <thead><tr><th>Participant</th><th>Program</th><th>Enrolled</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (enrollment of query.data()?.items ?? []; track enrollment.id) {
              <tr>
                <td>{{ enrollment.userName }}</td>
                <td class="font-tabular">{{ enrollment.programId }}</td>
                <td class="font-tabular">{{ enrollment.enrolledAt }}</td>
                <td><app-status-badge [status]="enrollment.status" /></td>
                <td class="table-actions">
                  @if (programId) {
                    <app-button variant="ghost" (click)="pendingRemoveUserId = enrollment.userId">Remove</app-button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [page]="page()" [totalPages]="query.data()?.totalPages ?? 0" [totalElements]="query.data()?.totalElements ?? 0" (pageChange)="page.set($event)" />
    }

    <app-confirm-dialog
      [open]="!!pendingRemoveUserId"
      title="Remove enrollment"
      message="Remove this participant from the program?"
      (cancel)="pendingRemoveUserId = null"
      (confirm)="remove(pendingRemoveUserId!)"
    />
  `,
})
export class EnrollmentsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(EnrollmentsApi);
  private readonly queryClient = inject(QueryClient);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';
  readonly page = signal(0);
  pendingRemoveUserId: string | null = null;

  readonly query = injectQuery(() => ({
    queryKey: ['enrollments', this.programId || 'me', this.page()],
    queryFn: () => this.programId ? this.api.list(this.programId, this.page(), 10) : this.api.mine(this.page(), 10),
  }));

  readonly removeMutation = injectMutation(() => ({
    mutationFn: (userId: string) => this.api.remove(this.programId, userId),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['enrollments', this.programId] });
      toast.warning('Enrollment removed');
    },
  }));

  remove(userId: string): void {
    this.pendingRemoveUserId = null;
    this.removeMutation.mutate(userId);
  }
}
