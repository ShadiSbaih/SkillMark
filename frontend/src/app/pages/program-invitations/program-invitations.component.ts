import { Component } from '@angular/core';

@Component({
  selector: 'app-program-invitations',
  standalone: true,
  templateUrl: './program-invitations.component.html',
  styleUrl: './program-invitations.component.scss',
})
export class ProgramInvitationsComponent {
  readonly invitations = [
    { code: 'GIT-2026-SPRING', uses: 42, maxUses: 80, expires: '2026-06-10', status: 'ACTIVE' },
    { code: 'MENTOR-REVIEW', uses: 8, maxUses: 10, expires: '2026-05-30', status: 'ACTIVE' },
    { code: 'OLD-COHORT', uses: 55, maxUses: 55, expires: '2026-03-15', status: 'DISABLED' },
  ];
}
