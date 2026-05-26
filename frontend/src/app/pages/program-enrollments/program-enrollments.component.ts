import { Component } from '@angular/core';
import { attempts } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-program-enrollments',
  standalone: true,
  templateUrl: './program-enrollments.component.html',
  styleUrl: './program-enrollments.component.scss',
})
export class ProgramEnrollmentsComponent {
  readonly enrollments = attempts.map((attempt, index) => ({
    ...attempt,
    status: index === 1 ? 'IN_PROGRESS' : 'COMPLETED',
    joined: `2026-02-${14 + index}`,
  }));
}
