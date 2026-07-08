import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AttemptsService } from '../../services/attempts.service';
import { QuizzesService } from '../../services/quizzes.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-attempt-result',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DatePipe,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    RouterLink,
  ],
  templateUrl: './attempt-result.component.html',
  styleUrl: './attempt-result.component.scss',
})
export class AttemptResultComponent {
  private readonly route = inject(ActivatedRoute);
  readonly attemptsService = inject(AttemptsService);
  readonly quizzesService = inject(QuizzesService);
  readonly router = inject(Router);

  readonly attemptId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('attemptId'))),
    { initialValue: null }
  );

  readonly attemptQuery = this.attemptsService.getAttemptQuery(() => this.attemptId());

  readonly quizId = computed(() => this.attemptQuery.data()?.quizId ?? null);
  readonly quizQuery = this.quizzesService.getQuizQuery(() => this.quizId());

  issueCertificate(): void {
    const attemptId = this.attemptId();
    if (!attemptId) return;

    this.attemptsService.issueCertificateForAttempt.mutate(
      { attemptId },
      {
        onSuccess: (certificate) => {
          if (certificate?.id) {
            void this.router.navigate(['/certificates', certificate.id]);
          }
        },
      }
    );
  }

  viewCertificate(certificateId: string): void {
    void this.router.navigate(['/certificates', certificateId]);
  }

  backToAttempts(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      void this.router.navigate(['/my-attempts']);
    }
  }
}
