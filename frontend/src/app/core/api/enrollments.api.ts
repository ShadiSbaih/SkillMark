import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { CreateEnrollmentRequest, EnrollmentResponse, PageResponse, Uuid } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentsApi {
  private readonly api = inject(ApiClient);

  create(programId: Uuid, request: CreateEnrollmentRequest): Promise<EnrollmentResponse> {
    return this.api.post<EnrollmentResponse>(`/programs/${programId}/enrollments`, request);
  }

  list(programId: Uuid, page = 0, size = 10): Promise<PageResponse<EnrollmentResponse>> {
    return this.api.page<EnrollmentResponse>(`/programs/${programId}/enrollments`, { page, size });
  }

  mine(page = 0, size = 10): Promise<PageResponse<EnrollmentResponse>> {
    return this.api.page<EnrollmentResponse>('/enrollments/me', { page, size });
  }

  remove(programId: Uuid, userId: Uuid): Promise<void> {
    return this.api.delete<void>(`/programs/${programId}/enrollments/${userId}`);
  }
}

