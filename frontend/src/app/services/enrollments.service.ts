import { Injectable, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { Enrollment } from '../core/models/enrollment.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private readonly api = inject(ApiClientService);

  readonly mineParams = signal<{ page: number; size: number }>({
    page: 0,
    size: 10,
  });

  readonly myEnrollmentsQuery = injectQuery(() => {
    const params = this.mineParams();
    return {
      queryKey: ['enrollments', 'me', params.page, params.size] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<Enrollment>('enrollments/me', {
            page: params.page,
            size: params.size,
          })
        ),
    };
  });
}
