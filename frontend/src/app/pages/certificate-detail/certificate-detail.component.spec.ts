import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificateDetailComponent } from './certificate-detail.component';
import { CertificatesService } from '../../services/certificates.service';
import {
  CertificateResponse,
  CertificateStatus,
} from '../../core/models/certificate.model';

interface CertificateQueryState {
  isPending: boolean;
  isError: boolean;
  data: CertificateResponse | null;
  error: Error | null;
  refetch: (...args: unknown[]) => unknown;
}

class FakeCertificatesService {
  private queryState = signal<CertificateQueryState>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn(),
  });

  getCertificateQuery(_certificateId: () => string | null) {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  get refetchSpy() {
    return this.queryState().refetch;
  }

  setPending() {
    this.queryState.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: vi.fn(),
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: vi.fn(),
    });
  }

  setData(data: CertificateResponse) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
    });
  }
}

describe('CertificateDetailComponent', () => {
  let component: CertificateDetailComponent;
  let fixture: ComponentFixture<CertificateDetailComponent>;
  let certificatesService: FakeCertificatesService;
  let router: Router;

  const status: CertificateStatus = 'ACTIVE';

  const certificate: CertificateResponse = {
    id: 'cert-1',
    certificateNumber: 'CERT-0001',
    verificationCode: 'ABC123',
    organizationId: 'org-1',
    programId: 'program-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptId: 'attempt-1',
    title: 'Certificate of Completion',
    participantNameSnapshot: 'John Doe',
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

  beforeEach(async () => {
    certificatesService = new FakeCertificatesService();

    await TestBed.configureTestingModule({
      imports: [CertificateDetailComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: CertificatesService, useValue: certificatesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('certificateId', certificate.id);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    certificatesService.setPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show loading state while fetching', () => {
    certificatesService.setPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading certificate...');
  });

  it('should show error state with retry', () => {
    certificatesService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const refetchSpy = certificatesService.refetchSpy;
    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(refetchSpy).toHaveBeenCalled();
  });

  it('should render certificate fields', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(certificate.title);
    expect(text).toContain(certificate.certificateNumber);
    expect(text).toContain(certificate.status);
    expect(text).toContain(certificate.verificationCode);
    expect(text).toContain(certificate.participantNameSnapshot);
    expect(text).toContain(certificate.quizTitleSnapshot);
    expect(text).toContain(certificate.programTitleSnapshot);
    expect(text).toContain(certificate.organizationNameSnapshot);
    expect(text).toContain('Jul 3, 2026');
  });

  it('should show revoked information when the certificate is revoked', () => {
    certificatesService.setData({
      ...certificate,
      status: 'REVOKED',
      revokedAt: '2026-07-04T12:00:00Z',
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('REVOKED');
    expect(text).toContain('Revoked at');
    expect(text).toContain('Jul 4, 2026');
  });

  it('should provide a back link and a public verify link', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Back to My Certificates');
    expect(text).toContain('Verify publicly');
  });

  it('should navigate back to My Certificates when Back is clicked', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const backButton = getButtonByText(fixture, 'Back to My Certificates');
    backButton?.click();

    expect(router.navigate).toHaveBeenCalledWith(['/my-certificates']);
  });

  it('should navigate to public verification when Verify publicly is clicked', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const verifyButton = getButtonByText(fixture, 'Verify publicly');
    verifyButton?.click();

    expect(router.navigate).toHaveBeenCalledWith([
      '/verify',
      certificate.verificationCode,
    ]);
  });

  function getButtonByText(
    fixtureRef: ComponentFixture<CertificateDetailComponent>,
    text: string
  ): HTMLButtonElement | undefined {
    return Array.from<HTMLButtonElement>(
      fixtureRef.nativeElement.querySelectorAll('button')
    ).find((button) => button.textContent?.trim() === text);
  }
});
