import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3>{{ displayTitle() }}</h3>
      @if (displayDescription()) {
        <p>{{ displayDescription() }}</p>
      }
      @if (actionLabel()) {
        @if (actionLink()) {
          <a [routerLink]="actionLink()" class="button button-primary empty-state-action">{{ actionLabel() }}</a>
        } @else {
          <app-button class="empty-state-action" (clicked)="action.emit()">{{ actionLabel() }}</app-button>
        }
      }
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly title = input<string>();
  readonly description = input<string>();
  readonly message = input<string>();
  readonly actionLabel = input<string>();
  readonly actionLink = input<string | any[]>();
  readonly action = output<void>();

  readonly displayTitle = computed(() => {
    return this.title() ?? this.message() ?? 'Nothing here';
  });

  readonly displayDescription = computed(() => {
    if (this.description()) return this.description();
    if (this.title() && this.message()) return this.message();
    if (!this.title() && this.message()) return undefined;
    return 'No data available.';
  });
}
