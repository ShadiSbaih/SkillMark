import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { DashboardLayoutComponent } from './core/layout/dashboard-layout/dashboard-layout.component';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';
import { AttemptResultComponent } from './pages/attempt-result/attempt-result.component';
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
import { CertificateDetailComponent } from './pages/certificate-detail/certificate-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JoinComponent } from './pages/join/join.component';
import { LandingComponent } from './pages/landing/landing.component';
import { MyCertificatesComponent } from './pages/my-certificates/my-certificates.component';
import { OrganizationMembersComponent } from './pages/organization-members/organization-members.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { ProgramEnrollmentsComponent } from './pages/program-enrollments/program-enrollments.component';
import { ProgramInvitationsComponent } from './pages/program-invitations/program-invitations.component';
import { ProgramOverview as ProgramOverviewComponent } from './pages/program-overview/program-overview';
import { ProgramResourcesComponent } from './pages/program-resources/program-resources.component';
import { QuizAttemptComponent } from './pages/quiz-attempt/quiz-attempt.component';
import { QuizBuilderComponent } from './pages/quiz-builder/quiz-builder.component';
import { VerifyCertificateComponent } from './pages/verify-certificate/verify-certificate.component';
import { ProgramsComponent } from './pages/programs/programs.component';

// Dedicated components generated to eliminate route-to-component reuse
import { Profile as ProfileComponent } from './pages/profile/profile';
import { OrganizationOverview as OrganizationOverviewComponent } from './pages/organization-overview/organization-overview';
import { OrganizationSettings as OrganizationSettingsComponent } from './pages/organization-settings/organization-settings';
import { OrganizationCertificates as OrganizationCertificatesComponent } from './pages/organization-certificates/organization-certificates';
import { ProgramQuizzes as ProgramQuizzesComponent } from './pages/program-quizzes/program-quizzes';
import { ProgramSettings as ProgramSettingsComponent } from './pages/program-settings/program-settings';
import { ProgramLearn as ProgramLearnComponent } from './pages/program-learn/program-learn';
import { CreateQuiz as CreateQuizComponent } from './pages/create-quiz/create-quiz';
import { QuizOverview as QuizOverviewComponent } from './pages/quiz-overview/quiz-overview';
import { QuizView as QuizViewComponent } from './pages/quiz-view/quiz-view';
import { QuizAttempts as QuizAttemptsComponent } from './pages/quiz-attempts/quiz-attempts';
import { QuizSettings as QuizSettingsComponent } from './pages/quiz-settings/quiz-settings';
import { MyEnrollments as MyEnrollmentsComponent } from './pages/my-enrollments/my-enrollments';
import { MyAttempts as MyAttemptsComponent } from './pages/my-attempts/my-attempts';
import { SignIn as SignInComponent } from './pages/sign-in/sign-in';
import { SignUp as SignUpComponent } from './pages/sign-up/sign-up';
import { VerifyEmail as VerifyEmailComponent } from './pages/verify-email/verify-email';
import { ForgotPassword as ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPassword as ResetPasswordComponent } from './pages/reset-password/reset-password';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'verify', component: VerifyCertificateComponent },
      { path: 'verify/:code', component: VerifyCertificateComponent },
      { path: 'join', component: JoinComponent },
      { path: 'join/:code', component: JoinComponent },
    ],
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'programs', component: ProgramsComponent },
      {
        path: 'organizations',
        children: [
          { path: '', component: OrganizationsComponent },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/organizations/create-organization/create-organization.component').then(
                (m) => m.CreateOrganizationComponent
              ),
          },
          { path: ':orgId', component: OrganizationOverviewComponent },
          { path: ':orgId/members', component: OrganizationMembersComponent },
          { path: ':orgId/settings', component: OrganizationSettingsComponent },
          { path: ':orgId/audit-logs', component: AuditLogsComponent },
          { path: ':orgId/certificates', component: OrganizationCertificatesComponent },
          { path: ':orgId/programs', component: ProgramsComponent },
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
      { path: 'programs/:programId/quizzes', component: ProgramQuizzesComponent },
      { path: 'programs/:programId/settings', component: ProgramSettingsComponent },
      { path: 'programs/:programId/learn', component: ProgramLearnComponent },
      { path: 'programs/:programId/quizzes/new', component: CreateQuizComponent },
      { path: 'quizzes/:quizId', component: QuizOverviewComponent },
      { path: 'quizzes/:quizId/builder', component: QuizBuilderComponent },
      { path: 'quizzes/:quizId/view', component: QuizViewComponent },
      { path: 'quizzes/:quizId/attempt', component: QuizAttemptComponent },
      { path: 'quizzes/:quizId/attempts', component: QuizAttemptsComponent },
      { path: 'quizzes/:quizId/settings', component: QuizSettingsComponent },
      { path: 'attempts/:attemptId/result', component: AttemptResultComponent },
      { path: 'my-enrollments', component: MyEnrollmentsComponent },
      { path: 'me/enrollments', component: MyEnrollmentsComponent },
      { path: 'my-attempts', component: MyAttemptsComponent },
      { path: 'me/attempts', component: MyAttemptsComponent },
      { path: 'my-certificates', component: MyCertificatesComponent },
      { path: 'me/certificates', component: MyCertificatesComponent },
      { path: 'certificates', component: MyCertificatesComponent },
      { path: 'certificates/:certificateId', component: CertificateDetailComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
