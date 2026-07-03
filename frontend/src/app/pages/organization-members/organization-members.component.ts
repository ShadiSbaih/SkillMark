import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from 'ngx-sonner';
import { MembershipsService } from '../../services/memberships.service';
import { MembershipResponse, MembershipRole } from '../../core/models/membership.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-organization-members',
  standalone: true,
  imports: [
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
  templateUrl: './organization-members.component.html',
  styleUrl: './organization-members.component.scss',
})
export class OrganizationMembersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly membershipsService = inject(MembershipsService);

  readonly organizationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: null }
  );

  readonly showAddModal = signal(false);
  readonly removingUserId = signal<string | null>(null);

  readonly filterForm = this.fb.group({
    search: [''],
    role: ['ALL'],
  });

  readonly addForm = this.fb.group({
    userId: ['', [Validators.required]],
    role: 'PARTICIPANT' as MembershipRole,
  });

  readonly roles: MembershipRole[] = ['OWNER', 'PARTICIPANT'];

  readonly membershipsQuery = this.membershipsService.membershipsQuery;

  readonly filteredMemberships = computed(() => {
    const data = this.membershipsQuery.data();
    if (!data) return [];
    const search = (this.filterForm.value.search ?? '').toLowerCase();
    const role = this.filterForm.value.role ?? 'ALL';
    return data.items.filter((m) => {
      const matchesSearch =
        !search ||
        m.userName.toLowerCase().includes(search) ||
        m.userEmail.toLowerCase().includes(search);
      const matchesRole = role === 'ALL' || m.role === role;
      return matchesSearch && matchesRole;
    });
  });

  readonly pageInfo = computed(() => {
    const data = this.membershipsQuery.data();
    return {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    };
  });

  constructor() {
    effect(() => {
      const id = this.organizationId();
      this.membershipsService.listParams.set({
        organizationId: id ?? null,
        page: 0,
        size: 10,
      });
    });
  }

  openAddModal(): void {
    this.addForm.reset({ userId: '', role: 'PARTICIPANT' });
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  addMember(): void {
    if (this.addForm.invalid) return;
    const orgId = this.organizationId();
    if (!orgId) return;
    const userId = this.addForm.value.userId;
    const role = this.addForm.value.role as MembershipRole;
    if (!userId) return;
    this.membershipsService.addMutation.mutate(
      { organizationId: orgId, request: { userId, role } },
      {
        onSuccess: () => {
          toast.success('Member added successfully');
          this.closeAddModal();
        },
        onError: (error) => {
          toast.error(error.message ?? 'Failed to add member');
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

  removeMember(): void {
    const orgId = this.organizationId();
    const userId = this.removingUserId();
    if (!orgId || !userId) return;
    this.membershipsService.removeMutation.mutate(
      { organizationId: orgId, userId },
      {
        onSuccess: () => {
          toast.success('Member removed successfully');
          this.removingUserId.set(null);
        },
        onError: (error) => {
          toast.error(error.message ?? 'Failed to remove member');
        },
      }
    );
  }

  goToPage(page: number): void {
    const id = this.organizationId();
    this.membershipsService.listParams.update((params) => ({
      ...params,
      organizationId: id ?? null,
      page,
    }));
  }

  roleVariant(role: MembershipRole) {
    return role === 'OWNER' ? 'warning' : 'default';
  }

  statusVariant(status: MembershipResponse['status']) {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INVITED':
        return 'info';
      case 'REMOVED':
        return 'danger';
      default:
        return 'default';
    }
  }
}
