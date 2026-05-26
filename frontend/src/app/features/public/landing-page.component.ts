import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent],
  template: `
    <section class="mx-auto max-w-7xl px-6 pb-20 pt-14">
      <div class="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p class="text-xs font-normal uppercase tracking-[0.1px] text-[var(--color-primary-deep)]">API-first certification platform</p>
          <h1 class="mt-4 max-w-4xl text-5xl font-light leading-[1.03] tracking-[-1.4px] text-[var(--color-ink)] md:text-6xl">
            Train. Assess. Certify.
          </h1>
          <p class="mt-6 max-w-2xl text-base leading-7 text-[var(--color-ink-secondary)]">
            Skillmark gives organizations a focused workspace for programs, resources, quizzes, attempts, certificates, and public verification.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/sign-up"><app-button>Get started</app-button></a>
            <a routerLink="/verify"><app-button variant="secondary">Verify certificate</app-button></a>
          </div>
        </div>
        <app-card tone="dark">
          <div class="rounded-lg bg-[#0d253d] p-5 text-white">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <span class="text-sm">Program dashboard</span>
              <span class="rounded-full bg-white/10 px-2 py-1 text-xs">Live</span>
            </div>
            <div class="mt-5 grid gap-3">
              @for (row of mockRows; track row.label) {
                <div class="grid grid-cols-[1fr_auto] items-center rounded-lg bg-white/8 p-3">
                  <span class="text-sm text-white/80">{{ row.label }}</span>
                  <span class="font-tabular text-sm">{{ row.value }}</span>
                </div>
              }
            </div>
          </div>
        </app-card>
      </div>

      <section class="mt-20 grid gap-4 md:grid-cols-3">
        @for (feature of features; track feature.title) {
          <app-card>
            <p class="text-lg font-light tracking-[-0.2px] text-[var(--color-ink)]">{{ feature.title }}</p>
            <p class="mt-3 text-sm leading-6 text-[var(--color-ink-mute)]">{{ feature.description }}</p>
          </app-card>
        }
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

