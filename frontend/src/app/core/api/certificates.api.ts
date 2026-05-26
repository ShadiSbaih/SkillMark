import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import {
  CertificateResponse,
  IssueCertificateRequest,
  PageResponse,
  PublicCertificateVerificationResponse,
  RevokeCertificateRequest,
  Uuid,
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class CertificatesApi {
  private readonly api = inject(ApiClient);

  issue(request: IssueCertificateRequest): Promise<CertificateResponse> {
    return this.api.post<CertificateResponse>('/certificates', request);
  }

  mine(page = 0, size = 10): Promise<PageResponse<CertificateResponse>> {
    return this.api.page<CertificateResponse>('/certificates/me', { page, size });
  }

  organizationCertificates(organizationId: Uuid, page = 0, size = 10): Promise<PageResponse<CertificateResponse>> {
    return this.api.page<CertificateResponse>(`/certificates/organization/${organizationId}`, { page, size });
  }

  get(certificateId: Uuid): Promise<CertificateResponse> {
    return this.api.get<CertificateResponse>(`/certificates/${certificateId}`);
  }

  revoke(certificateId: Uuid, request: RevokeCertificateRequest): Promise<CertificateResponse> {
    return this.api.post<CertificateResponse>(`/certificates/${certificateId}/revoke`, request);
  }

  verify(verificationCode: string): Promise<PublicCertificateVerificationResponse> {
    return this.api.get<PublicCertificateVerificationResponse>(`/public/certificates/verify/${verificationCode}`);
  }
}

