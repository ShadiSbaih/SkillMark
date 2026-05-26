import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { quizzes } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss',
})
export class QuizBuilderComponent {
  readonly quiz = quizzes[0];
  title = quizzes[0]?.title ?? '';
}
