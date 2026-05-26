import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, LucideAngularModule],
  template: `
    <section class="landing-page">
      <div class="landing-hero-centered fade-up">
        <p class="hero-pill"><span class="hero-dot"></span> Learning credentials for real organizations</p>
        <h1 class="display-xxl">Train. Assess. Certify.</h1>
        <p class="hero-subtitle">
          One clean workspace to manage programs, run quizzes, issue certificates, and let anyone verify credentials publicly.
        </p>
        <div class="hero-actions">
          <a routerLink="/sign-up"><app-button>Get started</app-button></a>
          <a routerLink="/verify"><app-button variant="secondary">Verify a Certificate</app-button></a>
        </div>
      </div>

      <div class="landing-product-frame fade-up" style="--delay: 0.1s">
        <div class="landing-product-header">
          <span>Skillmark owner dashboard</span>
          <span class="hero-live">Live</span>
        </div>
        <div class="landing-product-grid">
          @for (row of mockRows; track row.label) {
            <article>
              <span>{{ row.label }}</span>
              <strong class="font-tabular">{{ row.value }}</strong>
            </article>
          }
        </div>
      </div>

      <section class="landing-section">
        <div class="landing-section-heading">
          <p class="app-eyebrow">Core workflows</p>
          <h2 class="display-lg">Everything the UI document asks for, organized into three paths.</h2>
        </div>
        <div class="landing-feature-grid fade-up" style="--delay: 0.16s">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <lucide-icon [name]="feature.icon" size="22" />
              <p class="feature-title">{{ feature.title }}</p>
              <p class="feature-body">{{ feature.description }}</p>
            </div>
          }
        </div>
      </section>

      <section class="landing-use-cases fade-up" style="--delay: 0.22s">
        <div>
          <p class="app-eyebrow">Use cases</p>
          <h2 class="display-lg">Built for clubs, bootcamps, and internal academies.</h2>
        </div>
        <div class="use-case-list">
          @for (useCase of useCases; track useCase) {
            <span>{{ useCase }}</span>
          }
        </div>
      </section>

      <footer class="landing-footer">
        <span>© Skillmark</span>
        <a routerLink="/verify">Verify Certificate</a>
        <a routerLink="/sign-in">Sign In</a>
      </footer>
    </section>
  `,
})
export class LandingPageComponent {
  readonly mockRows = [
    { label: 'Programs', value: '12' },
    { label: 'Quiz pass rate', value: '76%' },
    { label: 'Certificates issued', value: '246' },
  ];

  readonly features = [
    { title: 'Manage Programs', icon: 'book-open', description: 'Create organization-owned programs with resources, invitations, enrollments, and publication controls.' },
    { title: 'Run Quizzes', icon: 'graduation-cap', description: 'Build single-choice assessments, enforce timers and attempts, and publish only when ready.' },
    { title: 'Issue Certs', icon: 'award', description: 'Generate verifiable certificates with QR codes, public lookup, and revocation history.' },
  ];

  readonly useCases = ['University clubs', 'Bootcamps', 'Training teams', 'Companies', 'Workshops', 'Student societies'];
}

