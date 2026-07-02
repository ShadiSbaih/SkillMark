import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="rounded-lg border border-[#a8c3de] bg-white p-6 shadow-sm">
      <ng-content />
    </div>
  `,
})
export class CardComponent {}
