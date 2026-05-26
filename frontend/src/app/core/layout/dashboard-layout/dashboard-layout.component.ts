import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  readonly ownerLinks = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Organizations', route: '/organizations/org-cs' },
    { label: 'Members', route: '/organizations/org-cs/members' },
    { label: 'Programs', route: '/programs/program-git' },
    { label: 'Resources', route: '/programs/program-git/resources' },
    { label: 'Quizzes', route: '/programs/program-git/quizzes' },
    { label: 'Certificates', route: '/organizations/org-cs/certificates' },
    { label: 'Audit Logs', route: '/organizations/org-cs/audit-logs' },
  ];

  readonly participantLinks = [
    { label: 'My Programs', route: '/programs/program-git/learn' },
    { label: 'Quiz Attempt', route: '/quizzes/quiz-git-final/attempt' },
    { label: 'My Attempts', route: '/my-attempts' },
    { label: 'My Certificates', route: '/my-certificates' },
  ];
}
