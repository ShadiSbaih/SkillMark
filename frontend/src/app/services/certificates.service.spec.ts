import { TestBed } from '@angular/core/testing';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificatesService } from './certificates.service';
import { ApiClientService } from '../core/api/api-client.service';
import { PageResponse } from '../core/api/api-response.model';
import {
  CertificateResponse,
  CertificateStatus,
  IssueCertificateRequest,
  PublicCertificateVerificationResponse,
  RevokeCertificateRequest,
} from '../core/models/certificate.model';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let apiClient: ApiClientService;

  const status: CertificateStatus = 'ACTIVE';

  const certificateResponse: CertificateResponse = {
    id: 'cert-1',
    certificateNumber: 'CERT-0001',
    verificationCode: 'abc123',
    organizationId: 'org-1',
    programId: 'program-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptId: 'attempt-1',
    title: 'Certificate of Completion',
    participantNameSnapshot: 'John Doe',
    ownerNameSnapshot: 'Owner Name',
    quizTitleSnapshot: 'Intro Quiz',
    programTitleSnapshot: 'Intro Program',
    organizationNameSnapshot: 'Acme Inc',
    status,
    issuedAt: '2026-07-03T10:00:00Z',
    revokedAt: null,
    pdfUrl: null,
    pdfObjectKey: null,
    qrCodeUrl: null,
    qrCodeObjectKey: null,
  };

  const pageResponse: PageResponse<CertificateResponse> = {
    items: [certificateResponse],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  const publicVerificationResponse: PublicCertificateVerificationResponse = {
    certificateNumber: 'CERT-0001',
    status,
    participantName: 'John Doe',
    quizTitle: 'Intro Quiz',
    programTitle: 'Intro Program',
    organizationName: 'Acme Inc',
    issuedAt: '2026-07-03T10:00:00Z',
    isRevoked: false,
    revokedAt: null,
    revokeReason: null,
  };

  beforeEach(() => {
    apiClient = {
      getPage: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    } as unknown as ApiClientService;

    TestBed.configureTestingModule({
      providers: [
        CertificatesService,
        provideQueryClient(new QueryClient()),
        { provide: ApiClientService, useValue: apiClient },
      ],
    });

    service = TestBed.inject(CertificatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default myCertificatesParams to page 0 and size 10', () => {
    expect(service.myCertificatesParams()).toEqual({ page: 0, size: 10 });
  });

  it('should expose myCertificatesQuery using the current params', async () => {
    vi.mocked(apiClient.getPage).mockReturnValue(of(pageResponse));

    await service.myCertificatesQuery.refetch();

    expect(apiClient.getPage).toHaveBeenCalledWith('me/certificates', {
      page: 0,
      size: 10,
    });
  });

  it('should update myCertificatesQuery when params change', async () => {
    vi.mocked(apiClient.getPage).mockReturnValue(of(pageResponse));

    service.myCertificatesParams.set({ page: 1, size: 20 });

    await service.myCertificatesQuery.refetch();

    expect(apiClient.getPage).toHaveBeenCalledWith('me/certificates', {
      page: 1,
      size: 20,
    });
  });

  it('should expose a certificate query for the given id', async () => {
    vi.mocked(apiClient.get).mockReturnValue(of(certificateResponse));

    const query = TestBed.runInInjectionContext(() =>
      service.getCertificateQuery(() => 'cert-1')
    );
    await query.refetch();

    expect(apiClient.get).toHaveBeenCalledWith('certificates/cert-1');
  });

  it('should not fetch the certificate query when the id is null', () => {
    TestBed.runInInjectionContext(() =>
      service.getCertificateQuery(() => null)
    );

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should issue a certificate', async () => {
    vi.mocked(apiClient.post).mockReturnValue(of(certificateResponse));

    const request: IssueCertificateRequest = {
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptId: 'attempt-1',
      title: 'Certificate of Completion',
    };

    const result = await service.issueMutation.mutateAsync(request);

    expect(result).toEqual(certificateResponse);
    expect(apiClient.post).toHaveBeenCalledWith('certificates', request);
  });

  it('should revoke a certificate with the given reason', async () => {
    vi.mocked(apiClient.patch).mockReturnValue(of(certificateResponse));

    const request: RevokeCertificateRequest = {
      reason: 'Cheating detected',
    };

    const result = await service.revokeMutation.mutateAsync({
      certificateId: 'cert-1',
      request,
    });

    expect(result).toEqual(certificateResponse);
    expect(apiClient.patch).toHaveBeenCalledWith(
      'certificates/cert-1/status',
      { status: 'REVOKED', reason: request.reason }
    );
  });

  it('should expose an organization certificates query', async () => {
    vi.mocked(apiClient.getPage).mockReturnValue(of(pageResponse));

    const query = TestBed.runInInjectionContext(() =>
      service.organizationCertificatesQuery(
        () => 'org-1',
        () => 0,
        () => 10
      )
    );
    await query.refetch();

    expect(apiClient.getPage).toHaveBeenCalledWith(
      'organizations/org-1/certificates',
      {
        page: 0,
        size: 10,
      }
    );
  });

  it('should not fetch the organization certificates query when the id is null', () => {
    TestBed.runInInjectionContext(() =>
      service.organizationCertificatesQuery(() => null, () => 0, () => 10)
    );

    expect(apiClient.getPage).not.toHaveBeenCalled();
  });

  it('should expose a public verification query', async () => {
    vi.mocked(apiClient.get).mockReturnValue(of(publicVerificationResponse));

    const query = TestBed.runInInjectionContext(() =>
      service.verifyPublicCertificateQuery(() => 'abc123')
    );
    await query.refetch();

    expect(apiClient.get).toHaveBeenCalledWith(
      'public/certificates/verify/abc123'
    );
  });

  it('should not fetch the public verification query when the code is null', () => {
    TestBed.runInInjectionContext(() =>
      service.verifyPublicCertificateQuery(() => null)
    );

    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
