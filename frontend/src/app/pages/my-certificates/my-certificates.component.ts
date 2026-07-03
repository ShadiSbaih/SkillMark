import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CertificatesService } from '../../services/certificates.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './my-certificates.component.html',
  styleUrl: './my-certificates.component.scss',
})
export class MyCertificatesComponent {
  private readonly certificatesService = inject(CertificatesService);
  readonly router = inject(Router);

  readonly query = this.certificatesService.myCertificatesQuery;
  readonly params = this.certificatesService.myCertificatesParams;

  readonly page = computed(() => this.params().page);
  readonly size = computed(() => this.params().size);
  readonly data = computed(() => this.query.data());
  readonly totalPages = computed(() => this.data()?.totalPages ?? 0);
  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() < this.totalPages() - 1);

  goToPage(page: number): void {
    this.params.set({ page, size: this.size() });
  }

  goToPrevious(): void {
    if (this.hasPrevious()) {
      this.goToPage(this.page() - 1);
    }
  }

  goToNext(): void {
    if (this.hasNext()) {
      this.goToPage(this.page() + 1);
    }
  }

  statusVariant(status: string): 'success' | 'danger' | 'default' {
    return status === 'ACTIVE' ? 'success' : status === 'REVOKED' ? 'danger' : 'default';
  }

  openPdf(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
