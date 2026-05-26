import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProgramsApi } from '../../core/api/programs.api';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { ResourcesApi } from '../../core/api/resources.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-program-learn-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent],
  template: `
    @if (program.isPending()) {
      <app-loading-state />
    } @else if (program.data(); as item) {
      <app-page-header eyebrow="Participant" [title]="item.title" [description]="item.description || 'Program resources and quizzes'" />
      <section class="grid gap-6 lg:grid-cols-2">
        <app-card>
          <h2 class="text-xl font-light">Resources</h2>
          <div class="mt-4 grid gap-2">
            @for (resource of resources.data()?.items ?? []; track resource.id) {
              <a class="tile text-sm" [href]="resource.url" target="_blank" rel="noopener">{{ resource.title }}</a>
            } @empty {
              <p class="text-sm text-[var(--color-ink-mute)]">No resources yet.</p>
            }
          </div>
        </app-card>
        <app-card>
          <h2 class="text-xl font-light">Quizzes</h2>
          <div class="mt-4 grid gap-2">
            @for (quiz of quizzes.data()?.items ?? []; track quiz.id) {
              <div class="tile">
                <p class="text-sm font-normal">{{ quiz.title }}</p>
                <p class="font-tabular text-xs text-[var(--color-ink-mute)]">{{ quiz.durationMinutes }} min · {{ quiz.maxAttempts }} attempts</p>
                <a [routerLink]="['/quizzes', quiz.id, 'attempt']" class="mt-3 inline-flex"><app-button variant="secondary">Start</app-button></a>
              </div>
            } @empty {
              <p class="text-sm text-[var(--color-ink-mute)]">No published quizzes yet.</p>
            }
          </div>
        </app-card>
      </section>
    }
  `,
})
export class ProgramLearnPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly programs = inject(ProgramsApi);
  private readonly resourcesApi = inject(ResourcesApi);
  private readonly quizzesApi = inject(QuizzesApi);
  readonly programId = this.route.snapshot.paramMap.get('programId') ?? '';

  readonly program = injectQuery(() => ({
    queryKey: ['programs', this.programId],
    enabled: !!this.programId,
    queryFn: () => this.programs.get(this.programId),
  }));
  readonly resources = injectQuery(() => ({
    queryKey: ['resources', this.programId, 0],
    enabled: !!this.programId,
    queryFn: () => this.resourcesApi.list(this.programId, 0, 50),
  }));
  readonly quizzes = injectQuery(() => ({
    queryKey: ['quizzes', this.programId, 0],
    enabled: !!this.programId,
    queryFn: () => this.quizzesApi.listByProgram(this.programId, 0, 50),
  }));
}

