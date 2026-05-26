import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { certificates } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-certificates.component.html',
  styleUrl: './my-certificates.component.scss',
})
export class MyCertificatesComponent {
  readonly certificates = certificates;
}
