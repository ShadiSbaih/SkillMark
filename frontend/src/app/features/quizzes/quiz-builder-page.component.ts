import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { QuizzesApi } from '../../core/api/quizzes.api';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-quiz-builder-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, LoadingStateComponent, PageHeaderComponent],
  template: `
    @if (query.isPending()) {
      <app-loading-state />
    } @else if (query.data(); as quiz) {
      <app-page-header eyebrow="Quiz builder" [title]="quiz.title" description="Add SINGLE_CHOICE questions with exactly one correct option." />
      <section class="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <app-card>
          <h2 class="text-xl font-light">Add question</h2>
          <form class="mt-5 grid gap-3" [formGroup]="form" (ngSubmit)="addQuestion(quiz.questions.length + 1)">
            <textarea class="app-focus min-h-24 rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Question text *" formControlName="text"></textarea>
            <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" type="number" min="1" formControlName="points" />
            <div formArrayName="options" class="grid gap-2">
              @for (option of options.controls; track $index; let i = $index) {
                <div class="grid grid-cols-[1fr_auto] gap-2" [formGroupName]="i">
                  <input class="app-focus rounded-md border border-[var(--color-hairline-input)] px-3 py-2 text-sm" placeholder="Option text" formControlName="text" />
                  <label class="flex items-center gap-1 text-xs"><input type="radio" name="correct" [checked]="option.value.isCorrect" (change)="markCorrect(i)" /> Correct</label>
                </div>
              }
            </div>
            <app-button type="submit" [disabled]="form.invalid || mutation.isPending()">Add question</app-button>
          </form>
        </app-card>

        <div class="grid gap-4">
          @for (question of quiz.questions; track question.id) {
            <app-card>
              <p class="text-xs text-[var(--color-ink-mute)]">Question {{ question.position }} · {{ question.points }} pts</p>
              <h2 class="mt-2 text-lg font-light">{{ question.text }}</h2>
              <ol class="mt-4 grid gap-2">
                @for (option of question.options; track option.id) {
                  <li class="rounded-lg bg-[var(--color-canvas-soft)] p-3 text-sm" [class.text-emerald-700]="option.isCorrect">
                    {{ option.position }}. {{ option.text }} @if (option.isCorrect) { <span>Correct</span> }
                  </li>
                }
              </ol>
            </app-card>
          } @empty {
            <app-card tone="cream"><p class="text-sm">No questions yet. Add the first one to prepare publishing.</p></app-card>
          }
        </div>
      </section>
    }
  `,
})
export class QuizBuilderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(QuizzesApi);
  private readonly fb = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);
  readonly quizId = this.route.snapshot.paramMap.get('quizId') ?? '';

  readonly form = this.fb.nonNullable.group({
    text: ['', Validators.required],
    points: [1, [Validators.required, Validators.min(1)]],
    options: this.fb.array([
      this.optionGroup('Option A', true, 1),
      this.optionGroup('Option B', false, 2),
      this.optionGroup('Option C', false, 3),
      this.optionGroup('Option D', false, 4),
    ]),
  });

  get options(): FormArray {
    return this.form.controls.options;
  }

  readonly query = injectQuery(() => ({
    queryKey: ['quizzes', this.quizId],
    queryFn: () => this.api.get(this.quizId),
  }));

  readonly mutation = injectMutation(() => ({
    mutationFn: (position: number) => {
      const raw = this.form.getRawValue();
      return this.api.addQuestion(this.quizId, {
        text: raw.text,
        type: 'SINGLE_CHOICE',
        points: raw.points,
        position,
        options: raw.options.map((option, index) => ({ ...option, position: index + 1 })),
      });
    },
    onSuccess: async () => {
      this.form.reset();
      this.markCorrect(0);
      await this.queryClient.invalidateQueries({ queryKey: ['quizzes', this.quizId] });
      toast.success('Question added');
    },
  }));

  addQuestion(position: number): void {
    if (this.form.valid && this.options.getRawValue().filter((option: { isCorrect: boolean }) => option.isCorrect).length === 1) {
      this.mutation.mutate(position);
    } else {
      toast.error('Exactly one option must be correct');
    }
  }

  markCorrect(index: number): void {
    this.options.controls.forEach((control, controlIndex) => {
      control.patchValue({ isCorrect: controlIndex === index });
    });
  }

  private optionGroup(text: string, isCorrect: boolean, position: number) {
    return this.fb.nonNullable.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect],
      position: [position],
    });
  }
}
