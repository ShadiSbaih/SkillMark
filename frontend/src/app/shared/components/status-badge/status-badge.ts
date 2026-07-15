import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';

type StatusBadgeEntity =
  | 'program'
  | 'quiz'
  | 'attempt'
  | 'certificate'
  | 'enrollment'
  | 'invitation'
  | 'membership';

type BadgeColor = 'green' | 'amber' | 'red' | 'gray' | 'blue';
type BadgeStyle = 'subtle' | 'solid' | 'outline';

interface BadgeConfig {
  color: BadgeColor;
  style: BadgeStyle;
}

const ENTITY_STATUS_MAP: Record<StatusBadgeEntity, Record<string, BadgeConfig>> = {
  program: {
    PUBLISHED: { color: 'blue', style: 'subtle' },
    DRAFT: { color: 'gray', style: 'subtle' },
    ARCHIVED: { color: 'amber', style: 'subtle' },
  },
  quiz: {
    PUBLISHED: { color: 'blue', style: 'subtle' },
    DRAFT: { color: 'gray', style: 'subtle' },
    ARCHIVED: { color: 'amber', style: 'subtle' },
  },
  attempt: {
    SUBMITTED: { color: 'blue', style: 'subtle' },
    IN_PROGRESS: { color: 'amber', style: 'subtle' },
    EXPIRED: { color: 'red', style: 'subtle' },
  },
  certificate: {
    ACTIVE: { color: 'green', style: 'subtle' },
    REVOKED: { color: 'red', style: 'subtle' },
  },
  enrollment: {
    ACTIVE: { color: 'green', style: 'subtle' },
  },
  invitation: {
    ACTIVE: { color: 'green', style: 'subtle' },
    DISABLED: { color: 'gray', style: 'subtle' },
  },
  membership: {
    OWNER: { color: 'blue', style: 'subtle' },
    PARTICIPANT: { color: 'gray', style: 'subtle' },
  },
};

const FALLBACK_COLOR_MAP: Record<string, BadgeColor> = {
  active: 'green',
  published: 'green',
  approved: 'green',
  passed: 'green',
  success: 'green',
  completed: 'green',
  pending: 'amber',
  invited: 'amber',
  draft: 'amber',
  in_progress: 'amber',
  inactive: 'red',
  rejected: 'red',
  failed: 'red',
  expired: 'red',
  revoked: 'red',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [BadgeComponent],
  templateUrl: './status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<string>();
  entity = input<StatusBadgeEntity>();

  readonly config = computed<BadgeConfig>(() => {
    const entity = this.entity();
    const rawStatus = this.status();
    const normalizedStatus = rawStatus.toUpperCase();

    if (entity) {
      const config = ENTITY_STATUS_MAP[entity][normalizedStatus];
      if (config) {
        return config;
      }
    }

    const fallbackColor = FALLBACK_COLOR_MAP[rawStatus.toLowerCase()] ?? 'gray';
    return { color: fallbackColor, style: 'subtle' };
  });

  readonly color = computed(() => this.config().color);
  readonly style = computed(() => this.config().style);
}
