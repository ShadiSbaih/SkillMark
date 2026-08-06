import { Component, input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string[];
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
