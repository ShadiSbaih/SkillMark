import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { EnrollmentsService } from '../../services/enrollments.service';
import { ProgramsService } from '../../services/programs.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-program-enrollments',
  standalone: true,
  imports: [
    DatePipe,
    PageHeaderComponent,
    ButtonComponent,
    CardComponent,
    AvatarComponent,
    PaginationComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    ModalComponent,
  ],
  templateUrl: './program-enrollments.component.html',
  styleUrl: './program-enrollments.component.scss',
})
export class ProgramEnrollmentsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly enrollmentsService = inject(EnrollmentsService);
  readonly programsService = inject(ProgramsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly programQuery = this.programsService.getProgramQuery(() => this.programId());

  readonly pageTitle = computed(() => {
    const title = this.programQuery.data()?.title;
    return title ? `Enrollments: ${title}` : 'Enrollments';
  });

  readonly enrollmentsQuery = this.enrollmentsService.programEnrollmentsQuery;
  readonly removingUserId = signal<string | null>(null);

  readonly filteredEnrollments = computed(() => this.enrollmentsQuery.data()?.items ?? []);

  readonly pageInfo = computed(() => {
    const data = this.enrollmentsQuery.data();
    const page = data?.page ?? 0;
    const totalPages = data?.totalPages ?? 0;
    return {
      page,
      size: data?.size ?? 10,
      totalElements: data?.totalElements ?? 0,
      totalPages,
      hasNext: page + 1 < totalPages,
      hasPrevious: page > 0,
    };
  });

  constructor() {
    effect(() => {
      const id = this.programId();
      this.enrollmentsService.listParams.set({
        programId: id ?? null,
        page: 0,
        size: 10,
      });
    });
  }

  confirmRemove(userId: string): void {
    this.removingUserId.set(userId);
  }

  cancelRemove(): void {
    this.removingUserId.set(null);
  }

  removeEnrollment(): void {
    const programId = this.programId();
    const userId = this.removingUserId();
    if (!programId || !userId) return;

    this.enrollmentsService.removeMutation.mutate(
      { programId, userId },
      {
        onSuccess: () => {
          toast.success('Enrollment removed successfully');
          this.removingUserId.set(null);
        },
        onError: (error) => {
          toast.error(error.message ?? 'Failed to remove enrollment');
        },
      }
    );
  }

  goToPage(page: number): void {
    const id = this.programId();
    this.enrollmentsService.listParams.update((params) => ({
      ...params,
      programId: id ?? null,
      page,
    }));
  }

  trackById(_index: number, enrollment: { id: string }): string {
    return enrollment.id;
  }
}
