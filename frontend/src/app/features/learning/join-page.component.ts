import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { InvitationsApi } from '../../core/api/invitations.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-join-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, PageHeaderComponent],
  template: `
    <app-page-header eyebrow="Invitation" title="Join program" description="Use the invitation code to enroll in the program." />
    <app-card>
      <p class="font-tabular text-lg">{{ code }}</p>
      <div class="mt-5 flex gap-2">
        <app-button (click)="join()" [disabled]="mutation.isPending()">Join program</app-button>
        <a routerLink="/dashboard"><app-button variant="ghost">Cancel</app-button></a>
      </div>
    </app-card>
  `,
})
export class JoinPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invitations = inject(InvitationsApi);
  readonly code = this.route.snapshot.paramMap.get('code') ?? '';

  readonly mutation = injectMutation(() => ({
    mutationFn: () => this.invitations.join(this.code),
    onSuccess: async (invitation) => {
      toast.success('Joined program');
      await this.router.navigate(['/programs', invitation.programId, 'learn']);
    },
  }));

  join(): void {
    this.mutation.mutate();
  }
}

