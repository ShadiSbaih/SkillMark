import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { certificates } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './certificate-detail.component.html',
  styleUrl: './certificate-detail.component.scss',
})
export class CertificateDetailComponent {
  readonly certificate = certificates[0];
}
