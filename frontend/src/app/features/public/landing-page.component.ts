import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <section class="landing-shell">
      <div class="landing-hero">
        <div class="hero-copy fade-up">
          <div class="hero-pill">
            <span class="hero-dot"></span>
            <span>API-first certification platform</span>
          </div>
          <h1 class="hero-title display-xxl">Train. Assess. Certify.</h1>
          <p class="hero-subtitle">
            Skillmark gives organizations a focused workspace for programs, resources, quizzes, attempts, certificates, and public verification.
          </p>
          <div class="hero-actions">
            <a routerLink="/sign-up"><app-button>Get started</app-button></a>
            <a routerLink="/verify"><app-button variant="secondary">Verify certificate</app-button></a>
          </div>
          <div class="hero-badges">
            <span>Org-ready workflows</span>
            <span>Audit friendly tracking</span>
            <span>Public verification</span>
          </div>
        </div>
        <div class="hero-panel fade-up" style="--delay: 0.12s">
          <div class="hero-panel-header">
            <span>Program dashboard</span>
            <span class="hero-live">Live</span>
          </div>
          <div class="hero-panel-grid">
            @for (row of mockRows; track row.label) {
              <div class="hero-row">
                <span class="hero-row-label">{{ row.label }}</span>
                <span class="hero-row-value font-tabular">{{ row.value }}</span>
              </div>
            }
          </div>
          <div class="hero-panel-footer">
            <div>
              <p class="hero-panel-label">Active learners</p>
              <p class="hero-panel-value font-tabular">1,248</p>
            </div>
            <div>
              <p class="hero-panel-label">Completion rate</p>
              <p class="hero-panel-value font-tabular">93%</p>
            </div>
          </div>
        </div>
      </div>

      <section class="landing-split">
        <div class="split-copy fade-up" style="--delay: 0.18s">
          <p class="split-kicker">Built for teams</p>
          <h2 class="split-title display-lg">Deliver assessments that feel premium.</h2>
          <p class="split-body">
            Automate invite flows, protect quizzes, and issue verifiable certificates without building custom tooling.
          </p>
          <ul class="split-list">
            <li><span class="split-index">01</span> Invite cohorts in minutes with tokenized enrollment links.</li>
            <li><span class="split-index">02</span> Control quiz access with visibility, timers, and attempt limits.</li>
            <li><span class="split-index">03</span> Publish certificates with public lookup and revocation history.</li>
          </ul>
        </div>
        <div class="split-grid fade-up" style="--delay: 0.24s">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <p class="feature-title">{{ feature.title }}</p>
              <p class="feature-body">{{ feature.description }}</p>
            </div>
          }
        </div>
      </section>

      <section class="cta-panel fade-up" style="--delay: 0.3s">
        <div>
          <p class="cta-kicker">Ready to launch</p>
          <h3 class="cta-title display-md">Give your programs a certification hub.</h3>
          <p class="cta-body">Spin up your first program, connect resources, and publish quizzes in one place.</p>
        </div>
        <div class="cta-actions">
          <a routerLink="/sign-up"><app-button>Start for free</app-button></a>
          <a routerLink="/sign-in"><app-button variant="ghost">Sign in</app-button></a>
        </div>
      </section>
    </section>
  `,
})
export class LandingPageComponent {
  readonly mockRows = [
    { label: 'Published quizzes', value: '18' },
    { label: 'Average score', value: '82%' },
    { label: 'Certificates issued', value: '246' },
  ];

  readonly features = [
    { title: 'Manage programs', description: 'Create organization-owned workshops with resources, invitations, enrollments, and status controls.' },
    { title: 'Run quizzes', description: 'Build single-choice assessments, enforce attempts and timers, and publish when ready.' },
    { title: 'Issue certificates', description: 'Generate verifiable certificates with public lookup, revocation, and participant history.' },
  ];
}

