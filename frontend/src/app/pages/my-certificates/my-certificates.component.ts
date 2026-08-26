import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './my-certificates.component.html',
  styleUrl: './my-certificates.component.scss',
})
export class MyCertificatesComponent {
  private readonly certificatesService = inject(CertificatesService);

  readonly query = this.certificatesService.myCertificatesQuery;
  readonly params = this.certificatesService.myCertificatesParams;

  readonly page = computed(() => this.params().page);
  readonly size = computed(() => this.params().size);
  readonly data = computed(() => this.query.data());

  onPageChange(pageOneIndexed: number): void {
    this.params.set({ page: pageOneIndexed - 1, size: this.size() });
  }

  openPdf(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
