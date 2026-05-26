import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout.component';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { CertificateDetailPageComponent, CertificatesPageComponent } from './features/certificates/certificates-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { JoinPageComponent } from './features/learning/join-page.component';
import { EnrollmentsPageComponent } from './features/learning/enrollments-page.component';
import { AttemptsPageComponent } from './features/learning/attempts-page.component';
import { AttemptResultPageComponent } from './features/learning/attempt-result-page.component';
import { ProgramLearnPageComponent } from './features/learning/program-learn-page.component';
import { QuizAttemptPageComponent } from './features/learning/quiz-attempt-page.component';
import { MembersPageComponent } from './features/organizations/members-page.component';
import { OrganizationDetailPageComponent } from './features/organizations/organization-detail-page.component';
import { OrganizationsPageComponent } from './features/organizations/organizations-page.component';
import { InvitationsPageComponent } from './features/programs/invitations-page.component';
import { ProgramDetailPageComponent } from './features/programs/program-detail-page.component';
import { ProgramsPageComponent } from './features/programs/programs-page.component';
import { ResourcesPageComponent } from './features/programs/resources-page.component';
import { QuizBuilderPageComponent } from './features/quizzes/quiz-builder-page.component';
import { QuizDetailPageComponent } from './features/quizzes/quiz-detail-page.component';
import { QuizzesPageComponent } from './features/quizzes/quizzes-page.component';
import { AuditLogsPageComponent } from './features/reports/audit-logs-page.component';
import { StatsPageComponent } from './features/reports/stats-page.component';
import { LandingPageComponent } from './features/public/landing-page.component';
import { NotFoundPageComponent } from './features/public/not-found-page.component';
import { VerificationPageComponent } from './features/public/verification-page.component';
import { ProfilePageComponent } from './features/profile/profile-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'sign-in', component: AuthPageComponent },
      { path: 'sign-up', component: AuthPageComponent },
      { path: 'verify', component: VerificationPageComponent },
      { path: 'verify/:verificationCode', component: VerificationPageComponent },
    ],
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'join/:code', component: JoinPageComponent },
      { path: 'organizations', component: OrganizationsPageComponent },
      { path: 'organizations/new', component: OrganizationsPageComponent },
      { path: 'organizations/:orgId', component: OrganizationDetailPageComponent },
      { path: 'organizations/:orgId/settings', component: OrganizationDetailPageComponent },
      { path: 'organizations/:orgId/members', component: MembersPageComponent },
      { path: 'organizations/:orgId/programs', component: ProgramsPageComponent },
      { path: 'organizations/:orgId/programs/new', component: ProgramsPageComponent },
      { path: 'organizations/:orgId/certificates', component: CertificatesPageComponent },
      { path: 'organizations/:orgId/stats', component: StatsPageComponent },
      { path: 'organizations/:orgId/audit-logs', component: AuditLogsPageComponent },
      { path: 'programs/:programId', component: ProgramDetailPageComponent },
      { path: 'programs/:programId/settings', component: ProgramDetailPageComponent },
      { path: 'programs/:programId/enrollments', component: EnrollmentsPageComponent },
      { path: 'programs/:programId/invitations', component: InvitationsPageComponent },
      { path: 'programs/:programId/resources', component: ResourcesPageComponent },
      { path: 'programs/:programId/quizzes', component: QuizzesPageComponent },
      { path: 'programs/:programId/quizzes/new', component: QuizzesPageComponent },
      { path: 'programs/:programId/stats', component: StatsPageComponent },
      { path: 'programs/:programId/learn', component: ProgramLearnPageComponent },
      { path: 'quizzes', component: QuizzesPageComponent },
      { path: 'quizzes/:quizId', component: QuizDetailPageComponent },
      { path: 'quizzes/:quizId/builder', component: QuizBuilderPageComponent },
      { path: 'quizzes/:quizId/view', component: QuizDetailPageComponent },
      { path: 'quizzes/:quizId/attempt', component: QuizAttemptPageComponent },
      { path: 'quizzes/:quizId/attempts', component: AttemptsPageComponent },
      { path: 'quizzes/:quizId/stats', component: StatsPageComponent },
      { path: 'quizzes/:quizId/settings', component: QuizDetailPageComponent },
      { path: 'attempts/:attemptId/result', component: AttemptResultPageComponent },
      { path: 'my-enrollments', component: EnrollmentsPageComponent },
      { path: 'my-attempts', component: AttemptsPageComponent },
      { path: 'my-certificates', component: CertificatesPageComponent },
      { path: 'certificates', component: CertificatesPageComponent },
      { path: 'certificates/:certificateId', component: CertificateDetailPageComponent },
    ],
  },
  { path: '**', component: NotFoundPageComponent },
];

