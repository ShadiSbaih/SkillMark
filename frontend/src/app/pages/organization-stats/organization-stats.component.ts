import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { ProgramsService } from '../../services/programs.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-organization-stats',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    CardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './organization-stats.component.html',
  styleUrl: './organization-stats.component.scss',
})
export class OrganizationStatsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly statsService = inject(StatsService);
  private readonly programsService = inject(ProgramsService);

  readonly organizationId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('orgId'))),
    { initialValue: this.route.snapshot.paramMap.get('orgId') }
  );

  readonly statsQuery = this.statsService.getOrganizationStatsQuery(this.organizationId);
  readonly stats = computed(() => this.statsQuery.data());

  readonly programs = computed(() => this.programsService.programsQuery.data()?.items ?? []);

  constructor() {
    this.programsService.listParams.set({
      organizationId: this.organizationId(),
      page: 0,
      size: 100,
    });
  }

  readonly passRateDash = computed(() => {
    const rate = this.stats()?.passRate ?? 0;
    return 339.292 * (rate / 100);
  });
}
