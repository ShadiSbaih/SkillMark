import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrganizationsService } from '../../services/organizations.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { OrganizationResponse } from '../../core/models/organization.model';

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
    PaginationComponent,
    RouterLink,
    BadgeComponent,
  ],
  templateUrl: './organizations.component.html',
})
export class OrganizationsComponent {
  readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);

  readonly listQuery = this.organizationsService.organizationsQuery;
  readonly listData = computed(() => this.listQuery.data());

  onPageChange(page: number): void {
    this.organizationsService.listParams.update((params) => ({ ...params, page }));
  }

  slugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  }

  trackById(_index: number, org: OrganizationResponse): string {
    return org.id;
  }
}
