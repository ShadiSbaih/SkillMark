import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { DashboardLayoutComponent } from './core/layout/dashboard-layout/dashboard-layout.component';
import { PublicLayoutComponent } from './core/layout/public-layout/public-layout.component';
import { AttemptResultComponent } from './pages/attempt-result/attempt-result.component';
import { CertificateDetailComponent } from './pages/certificate-detail/certificate-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LandingComponent } from './pages/landing/landing.component';
import { MyCertificatesComponent } from './pages/my-certificates/my-certificates.component';
import { ProgramEnrollmentsComponent } from './pages/program-enrollments/program-enrollments.component';
import { ProgramOverview as ProgramOverviewComponent } from './pages/program-overview/program-overview';
import { ProgramResourcesComponent } from './pages/program-resources/program-resources.component';
import { QuizAttemptComponent } from './pages/quiz-attempt/quiz-attempt.component';
import { QuizAnalyticsComponent } from './pages/quiz-analytics/quiz-analytics.component';
import { QuizBuilderComponent } from './pages/quiz-builder/quiz-builder.component';
import { VerifyCertificateComponent } from './pages/verify-certificate/verify-certificate.component';
import { ProgramsComponent } from './pages/programs/programs.component';
import { CreateProgramComponent } from './pages/programs/create-program/create-program.component';

// Dedicated components generated to eliminate route-to-component reuse
import { Profile as ProfileComponent } from './pages/profile/profile';
import { ProgramAnalyticsComponent } from './pages/program-analytics/program-analytics.component';
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
import { JoinProgramComponent } from './pages/join-program/join-program';

export const routes: Routes = [
  // ── Public routes (no auth required) ──────────────────────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingComponent, pathMatch: 'full' },
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'verify', component: VerifyCertificateComponent },
      { path: 'verify/:code', component: VerifyCertificateComponent },
    ],
  },

  // ── Shared authenticated routes (any role) ─────────────────────────────
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },

      // Students can browse/learn from programs they are enrolled in
      { path: 'programs/:programId/learn', component: ProgramLearnComponent },

      // Quiz taking — students attend quizzes
      { path: 'quizzes/:quizId/view', component: QuizViewComponent },
      { path: 'quizzes/:quizId/attempt', component: QuizAttemptComponent },
      { path: 'attempts/:attemptId/result', component: AttemptResultComponent },

      // Student personal pages
      { path: 'join', component: JoinProgramComponent },
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

  // ── Admin-only routes ──────────────────────────────────────────────────
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [adminGuard],
    children: [
      // Program management
      { path: 'programs', component: ProgramsComponent },
      { path: 'programs/new', component: CreateProgramComponent },
      { path: 'programs/:programId', component: ProgramOverviewComponent },
      { path: 'programs/:programId/enrollments', component: ProgramEnrollmentsComponent },
      { path: 'programs/:programId/resources', component: ProgramResourcesComponent },
      { path: 'programs/:programId/quizzes', component: ProgramQuizzesComponent },
      { path: 'programs/:programId/analytics', component: ProgramAnalyticsComponent },
      { path: 'programs/:programId/settings', component: ProgramSettingsComponent },
      { path: 'programs/:programId/quizzes/new', component: CreateQuizComponent },

      // Quiz management
      { path: 'quizzes/:quizId', component: QuizOverviewComponent },
      { path: 'quizzes/:quizId/builder', component: QuizBuilderComponent },
      { path: 'quizzes/:quizId/attempts', component: QuizAttemptsComponent },
      { path: 'quizzes/:quizId/analytics', component: QuizAnalyticsComponent },
      { path: 'quizzes/:quizId/settings', component: QuizSettingsComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];
