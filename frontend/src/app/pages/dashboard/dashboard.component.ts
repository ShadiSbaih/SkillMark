import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  attempts,
  certificates,
  organizationStats,
  programs,
} from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly stats = organizationStats;
  readonly programs = programs;
  readonly attempts = attempts;
  readonly certificates = certificates;
}
