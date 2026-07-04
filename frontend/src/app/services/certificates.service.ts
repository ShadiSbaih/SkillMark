import { Injectable, inject, signal } from '@angular/core';
import {
  injectQuery,
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { PageResponse } from '../core/api/api-response.model';
import {
  CertificateResponse,
  IssueCertificateRequest,
  PublicCertificateVerificationResponse,
  RevokeCertificateRequest,
} from '../core/models/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly myCertificatesParams = signal<{ page: number; size: number }>({
    page: 0,
    size: 10,
  });

  readonly myCertificatesQuery = injectQuery(() => {
    const params = this.myCertificatesParams();
    return {
      queryKey: ['certificates', 'me', params.page, params.size] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<CertificateResponse>('me/certificates', {
            page: params.page,
            size: params.size,
          })
        ),
    };
  });

  getCertificateQuery(certificateId: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['certificate', certificateId()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<CertificateResponse>(`certificates/${certificateId()}`)
        ),
      enabled: !!certificateId(),
    }));
  }

  readonly issueMutation = injectMutation(() => ({
    mutationFn: (request: IssueCertificateRequest) =>
      lastValueFrom(
        this.api.post<CertificateResponse>('certificates', request)
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['certificates', 'me'] });
    },
  }));

  readonly revokeMutation = injectMutation(() => ({
    mutationFn: ({
      certificateId,
      request,
    }: {
      certificateId: string;
      request: RevokeCertificateRequest;
    }) =>
      lastValueFrom(
        this.api.patch<CertificateResponse>(
          `certificates/${certificateId}/status`,
          { status: 'REVOKED', reason: request.reason }
        )
      ),
    onSuccess: (_, variables) => {
      this.queryClient.invalidateQueries({
        queryKey: ['certificate', variables.certificateId],
      });
      this.queryClient.invalidateQueries({ queryKey: ['certificates', 'me'] });
    },
  }));

  organizationCertificatesQuery(
    organizationId: () => string | null,
    page: () => number,
    size: () => number
  ) {
    return injectQuery(() => ({
      queryKey: [
        'certificates',
        'organization',
        organizationId(),
        page(),
        size(),
      ] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.getPage<CertificateResponse>(
            `organizations/${organizationId()}/certificates`,
            {
              page: page(),
              size: size(),
            }
          )
        ),
      enabled: !!organizationId(),
    }));
  }

  verifyPublicCertificateQuery(verificationCode: () => string | null) {
    return injectQuery(() => ({
      queryKey: ['public', 'certificates', 'verify', verificationCode()] as const,
      queryFn: () =>
        lastValueFrom(
          this.api.get<PublicCertificateVerificationResponse>(
            `public/certificates/verify/${verificationCode()}`
          )
        ),
      enabled: !!verificationCode(),
    }));
  }
}
