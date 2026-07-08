import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
  xl: 'avatar-xl',
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  readonly src = input<string | undefined>();
  readonly alt = input<string>('');
  readonly name = input<string>('');
  readonly size = input<AvatarSize>('md');
  readonly fallback = input<string | undefined>(undefined);

  readonly imgError = signal(false);

  readonly initials = computed(() => {
    return getInitials(this.name() || this.fallback() || '');
  });

  readonly ariaLabel = computed(() => this.alt() || this.name() || this.fallback() || 'Avatar');

  readonly containerClasses = computed(
    () => `avatar ${SIZE_CLASSES[this.size()]}`,
  );

  onImageError(): void {
    this.imgError.set(true);
  }
}
