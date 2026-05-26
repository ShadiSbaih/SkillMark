import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-quiz-detail-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as quiz) {
      <app-page-header eyebrow="Quiz" [title]="quiz.title" [description]="quiz.description || 'Quiz overview'">
        <a [routerLink]="['/quizzes', quiz.id, 'builder']"><app-button>Builder</app-button></a>
        <a [routerLink]="['/quizzes', quiz.id, 'attempt']"><app-button variant="secondary">Take quiz</app-button></a>
      </app-page-header>
      <section class="grid gap-4 md:grid-cols-4">
        <app-card><p class="text-sm text-[var(--color-ink-mute)]">Status</p><div class="mt-3"><app-status-badge [status]="quiz.status" /></div></app-card>
        <app-card><p class="text-sm text-[var(--color-ink-mute)]">Passing score</p><p class="font-tabular mt-3 text-3xl font-light">{{ quiz.passingScore }}%</p></app-card>
        <app-card><p class="text-sm text-[var(--color-ink-mute)]">Duration</p><p class="font-tabular mt-3 text-3xl font-light">{{ quiz.durationMinutes }}m</p></app-card>
        <app-card tone="dark"><p class="text-sm opacity-75">Questions</p><p class="font-tabular mt-3 text-3xl font-light">{{ quiz.questions.length }}</p></app-card>
      </section>
      <app-card class="mt-6">
        <div class="flex flex-wrap gap-2">
          <app-button (click)="publish(quiz.id)">Publish</app-button>
          <a [routerLink]="['/quizzes', quiz.id, 'attempts']"><app-button variant="secondary">Attempts</app-button></a>
          <a [routerLink]="['/quizzes', quiz.id, 'stats']"><app-button variant="ghost">Statistics</app-button></a>
        </div>
      </app-card>
    }
  `,
})
export class QuizDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(QuizzesApi);
  private readonly queryClient = inject(QueryClient);
  readonly quizId = this.route.snapshot.paramMap.get('quizId') ?? '';

  readonly query = injectQuery(() => ({
    queryKey: ['quizzes', this.quizId],
    queryFn: () => this.api.get(this.quizId),
  }));

  readonly publishMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.publish(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz published');
    },
  }));

  publish(id: string): void {
    this.publishMutation.mutate(id);
  }
}

