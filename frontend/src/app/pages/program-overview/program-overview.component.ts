import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { programStats, programs, quizzes, resources } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-program-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './program-overview.component.html',
  styleUrl: './program-overview.component.scss',
})
export class ProgramOverviewComponent {
  readonly program = programs[0];
  readonly stats = programStats;
  readonly resources = resources;
  readonly quizzes = quizzes;
}
