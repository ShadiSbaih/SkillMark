import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="loading-state">
      <div class="spinner"></div>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `,
  styleUrl: './loading-state.component.scss',
})
export class LoadingStateComponent {
  readonly message = input('Loading...');
}
