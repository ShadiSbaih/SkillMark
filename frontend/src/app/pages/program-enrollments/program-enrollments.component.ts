import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { EnrollmentsService } from '../../services/enrollments.service';
import { Enrollment, EnrollmentStatus } from '../../core/models/enrollment.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-program-enrollments',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    PageHeaderComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
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
  private readonly fb = inject(FormBuilder);
  readonly enrollmentsService = inject(EnrollmentsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly showEnrollModal = signal(false);
  readonly removingUserId = signal<string | null>(null);

  readonly enrollForm = this.fb.group({
    userId: ['', [Validators.required]],
  });

  readonly enrollmentsQuery = this.enrollmentsService.programEnrollmentsQuery;

  readonly filteredEnrollments = computed(() => {
    const data = this.enrollmentsQuery.data();
    return data?.items ?? [];
  });

  readonly pageInfo = computed(() => {
    const data = this.enrollmentsQuery.data();
    return {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
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

  openEnrollModal(): void {
    this.enrollForm.reset({ userId: '' });
    this.showEnrollModal.set(true);
  }

  closeEnrollModal(): void {
    this.showEnrollModal.set(false);
  }

  enrollUser(): void {
    const programId = this.programId();
    const userId = this.enrollForm.value.userId;
    if (!programId || !userId) return;
    this.enrollmentsService.createMutation.mutate(
      { programId, request: { userId } },
      {
        onSuccess: () => {
          toast.success('User enrolled successfully');
          this.closeEnrollModal();
        },
        onError: (error) => {
          toast.error(error.message ?? 'Failed to enroll user');
        },
      }
    );
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

  statusVariant(status: EnrollmentStatus) {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'REMOVED':
        return 'danger';
      default:
        return 'default';
    }
  }
}
