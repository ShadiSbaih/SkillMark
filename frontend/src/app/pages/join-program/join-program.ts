import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { EnrollmentsService } from '../../services/enrollments.service';
import { AuthService } from '../../core/auth/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-join-program',
  standalone: true,
  imports: [
    CardComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PaginationComponent,
    ButtonComponent
  ],
  templateUrl: './join-program.html',
})
export class JoinProgramComponent {
  private readonly programsService = inject(ProgramsService);
  private readonly enrollmentsService = inject(EnrollmentsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly query = this.programsService.programsQuery;
  
  readonly enrolling = signal<string | null>(null);

  readonly programs = computed(() => this.query.data()?.items ?? []);
  readonly page = computed(() => this.programsService.listParams().page);
  readonly size = computed(() => this.programsService.listParams().size);
  readonly totalElements = computed(() => this.query.data()?.totalElements ?? 0);
  readonly totalPages = computed(() => this.query.data()?.totalPages ?? 0);
  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() < this.totalPages() - 1);

  async enroll(programId: string) {
    if (this.enrolling()) return;
    this.enrolling.set(programId);
    try {
      await this.enrollmentsService.createMutation.mutateAsync({
        programId,
        request: { userId: this.authService.userId()! }
      });
      await this.router.navigate(['/programs', programId, 'learn']);
    } catch (err) {
      console.error('Failed to enroll', err);
      // Let's just swallow for now or handle appropriately
    } finally {
      this.enrolling.set(null);
    }
  }

  goToPage(newPage: number) {
    this.programsService.listParams.update((p) => ({ ...p, page: newPage }));
  }
}
