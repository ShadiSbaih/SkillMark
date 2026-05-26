import { Component } from '@angular/core';
import { organizationStats, programStats } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-organization-stats',
  standalone: true,
  templateUrl: './organization-stats.component.html',
  styleUrl: './organization-stats.component.scss',
})
export class OrganizationStatsComponent {
  readonly organizationStats = organizationStats;
  readonly programStats = programStats;
}
