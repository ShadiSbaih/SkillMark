import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { DashboardLayoutComponent } from './core/layout/dashboard-layout/dashboard-layout.component';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';
import { AttemptResultComponent } from './pages/attempt-result/attempt-result.component';
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
import { JoinComponent } from './pages/join/join.component';
import { CertificateDetailComponent } from './pages/certificate-detail/certificate-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LandingComponent } from './pages/landing/landing.component';
import { MyCertificatesComponent } from './pages/my-certificates/my-certificates.component';
import { OrganizationMembersComponent } from './pages/organization-members/organization-members.component';
import { OrganizationStatsComponent } from './pages/organization-stats/organization-stats.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { ProgramEnrollmentsComponent } from './pages/program-enrollments/program-enrollments.component';
import { ProgramInvitationsComponent } from './pages/program-invitations/program-invitations.component';
import { ProgramOverviewComponent } from './pages/program-overview/program-overview.component';
import { ProgramResourcesComponent } from './pages/program-resources/program-resources.component';
import { QuizAttemptComponent } from './pages/quiz-attempt/quiz-attempt.component';
import { QuizBuilderComponent } from './pages/quiz-builder/quiz-builder.component';
import { VerifyCertificateComponent } from './pages/verify-certificate/verify-certificate.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'sign-in', component: LandingComponent },
      { path: 'sign-up', component: LandingComponent },
      { path: 'verify', component: VerifyCertificateComponent },
      { path: 'verify/:verificationCode', component: VerifyCertificateComponent },
    ],
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: DashboardComponent },
      { path: 'join/:code', component: JoinComponent },
      {
        path: 'organizations',
        canActivate: [authGuard],
        children: [
          { path: '', component: OrganizationsComponent },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/organizations/create-organization/create-organization.component').then(
                (m) => m.CreateOrganizationComponent
              ),
          },
          { path: ':orgId', component: OrganizationsComponent },
          { path: ':orgId/members', component: OrganizationMembersComponent },
          { path: ':orgId/settings', component: OrganizationsComponent },
          { path: ':orgId/stats', component: OrganizationStatsComponent },
          { path: ':orgId/audit-logs', component: AuditLogsComponent },
          { path: ':orgId/certificates', component: MyCertificatesComponent },
          {
            path: ':orgId/programs/new',
            loadComponent: () =>
              import('./pages/programs/create-program/create-program.component').then(
                (m) => m.CreateProgramComponent
              ),
          },
        ],
      },
      { path: 'programs/:programId', component: ProgramOverviewComponent },
      { path: 'programs/:programId/enrollments', component: ProgramEnrollmentsComponent },
      { path: 'programs/:programId/invitations', component: ProgramInvitationsComponent },
      { path: 'programs/:programId/resources', component: ProgramResourcesComponent },
      { path: 'programs/:programId/quizzes', component: QuizBuilderComponent },
      { path: 'programs/:programId/stats', component: OrganizationStatsComponent },
      { path: 'programs/:programId/settings', component: ProgramOverviewComponent },
      { path: 'programs/:programId/learn', component: ProgramOverviewComponent },
      { path: 'programs/:programId/quizzes/new', component: QuizBuilderComponent },
      { path: 'quizzes/:quizId', component: QuizBuilderComponent },
      { path: 'quizzes/:quizId/builder', component: QuizBuilderComponent },
      { path: 'quizzes/:quizId/view', component: QuizAttemptComponent },
      { path: 'quizzes/:quizId/attempt', component: QuizAttemptComponent },
      { path: 'quizzes/:quizId/attempts', component: ProgramEnrollmentsComponent },
      { path: 'quizzes/:quizId/stats', component: OrganizationStatsComponent },
      { path: 'quizzes/:quizId/settings', component: QuizBuilderComponent },
      { path: 'attempts/:attemptId/result', component: AttemptResultComponent },
      { path: 'my-enrollments', component: ProgramEnrollmentsComponent },
      { path: 'my-attempts', component: AttemptResultComponent },
      { path: 'my-certificates', component: MyCertificatesComponent },
      { path: 'certificates/:certificateId', component: CertificateDetailComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
