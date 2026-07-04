import { Component, computed, input, signal } from '@angular/core';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarRounded = 'full' | 'md' | 'none';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

const ROUNDED_CLASSES: Record<AvatarRounded, string> = {
  full: 'rounded-full',
  md: 'rounded-md',
  none: 'rounded-none',
};

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.html',
  styles: `
    :host {
      display: inline-flex;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background-color: #e5e7eb;
      color: #374151;
      font-weight: 500;
      line-height: 1;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .xs {
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.625rem;
    }

    .sm {
      width: 2rem;
      height: 2rem;
      font-size: 0.75rem;
    }

    .md {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 0.875rem;
    }

    .lg {
      width: 3.5rem;
      height: 3.5rem;
      font-size: 1.125rem;
    }

    .xl {
      width: 5rem;
      height: 5rem;
      font-size: 1.25rem;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .rounded-md {
      border-radius: 0.375rem;
    }

    .rounded-none {
      border-radius: 0;
    }

    .fallback {
      user-select: none;
    }
  `,
})
export class AvatarComponent {
  readonly src = input<string>();
  readonly alt = input<string>('');
  readonly size = input<AvatarSize>('md');
  readonly fallback = input<string>();
  readonly rounded = input<AvatarRounded>('full');

  readonly imgError = signal(false);

  readonly containerClasses = computed(
    () => `avatar ${SIZE_CLASSES[this.size()]} ${ROUNDED_CLASSES[this.rounded()]}`,
  );

  readonly ariaLabel = computed(
    () => this.alt() || this.fallback() || 'Avatar',
  );

  onImageError(): void {
    this.imgError.set(true);
  }
}
