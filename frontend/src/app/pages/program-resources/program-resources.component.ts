import { Component } from '@angular/core';
import { resources } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-program-resources',
  standalone: true,
  templateUrl: './program-resources.component.html',
  styleUrl: './program-resources.component.scss',
})
export class ProgramResourcesComponent {
  readonly resources = resources;
}
