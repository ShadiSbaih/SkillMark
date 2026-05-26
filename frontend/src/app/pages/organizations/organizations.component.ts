import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { organizations, programs } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent {
  readonly organizations = organizations;
  readonly programs = programs;
  organizationName = 'CS Club';
  description = 'Practical software workshops, assessments, and verified achievements.';
}
