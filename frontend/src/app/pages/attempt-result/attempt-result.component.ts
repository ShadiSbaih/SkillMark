import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { attempts, certificates } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-attempt-result',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './attempt-result.component.html',
  styleUrl: './attempt-result.component.scss',
})
export class AttemptResultComponent {
  readonly attempt = attempts[0];
  readonly certificate = certificates[0];
}
