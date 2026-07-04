import { Component, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { OrganizationsService } from '../../services/organizations.service';
import { MembershipsService } from '../../services/memberships.service';
import { ProgramsService } from '../../services/programs.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-organization-overview',
  standalone: true,
  imports: [
    DatePipe,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './organization-overview.html',
})
export class OrganizationOverview {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);
  private readonly membershipsService = inject(MembershipsService);
  private readonly programsService = inject(ProgramsService);

  readonly orgId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: null }
  );

  readonly organizationQuery = this.organizationsService.getOrganizationQuery(() => this.orgId());
  readonly membershipsQuery = this.membershipsService.membershipsQuery;
  readonly programsQuery = this.programsService.programsQuery;

  constructor() {
    effect(() => {
      const id = this.orgId();
      this.membershipsService.listParams.set({
        organizationId: id ?? null,
        page: 0,
        size: 50,
      });
      this.programsService.listParams.set({
        organizationId: id ?? null,
        page: 0,
        size: 50,
      });
    });
  }

  retry(): void {
    this.organizationQuery.refetch();
    this.membershipsQuery.refetch();
    this.programsQuery.refetch();
  }
}
