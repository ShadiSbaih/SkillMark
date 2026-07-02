import { Component, computed, effect, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationsService } from '../../services/organizations.service';
import { ProgramsService } from '../../services/programs.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    DatePipe,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    BadgeComponent,
  ],
  templateUrl: './organizations.component.html',
})
export class OrganizationsComponent {
  readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);
  private readonly programsService = inject(ProgramsService);

  readonly orgId = input<string | null>(null);
  readonly isOverview = computed(() => !!this.orgId());

  readonly listQuery = this.organizationsService.organizationsQuery;
  readonly organizationQuery = this.organizationsService.getOrganizationQuery(() => this.orgId());
  readonly programsQuery = this.programsService.programsQuery;

  constructor() {
    effect(() => {
      const id = this.orgId();
      this.programsService.listParams.set({
        organizationId: id ?? null,
        page: 0,
        size: 5,
      });
    });
  }
}
