import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StatsService } from '../../services/stats.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-program-stats',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './program-stats.html',
  styles: ``,
})
export class ProgramStats {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly statsService = inject(StatsService);

  readonly programId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('programId'))),
    { initialValue: null }
  );

  readonly statsQuery = this.statsService.getProgramStatsQuery(() => this.programId());

  readonly passRate = computed(() => {
    const stats = this.statsQuery.data();
    const attempts = stats?.attemptsCount ?? 0;
    const passed = stats?.passedParticipants ?? 0;
    return attempts > 0 ? Math.round((passed / attempts) * 100) : 0;
  });

  readonly averageScore = computed(() => {
    const avg = this.statsQuery.data()?.averageScore;
    return avg !== undefined ? Math.round(avg * 100) / 100 : 0;
  });
}
