import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { quizzes } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-attempt.component.html',
  styleUrl: './quiz-attempt.component.scss',
})
export class QuizAttemptComponent {
  readonly quiz = quizzes[0];
  selected = 'q1-a';
}
