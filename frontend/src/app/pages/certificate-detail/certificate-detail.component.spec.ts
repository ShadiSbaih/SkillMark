import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
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
  refetch: ReturnType<typeof vi.fn>;
}

class FakeCertificatesService {
  private readonly _refetchSpy = vi.fn();
  private queryState = signal<CertificateQueryState>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: this._refetchSpy,
  });

  getCertificateQuery(_certificateId: () => string | null) {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this._refetchSpy,
    };
  }

  get refetchSpy() {
    return this._refetchSpy;
  }

  setPending() {
    this.queryState.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: this._refetchSpy,
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this._refetchSpy,
    });
  }

  setData(data: CertificateResponse) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this._refetchSpy,
    });
  }

  setEmpty() {
    this.queryState.set({
      isPending: false,
      isError: false,
      data: null,
      error: null,
      refetch: this._refetchSpy,
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
    scoreSnapshot: 92.5,
    status,
    issuedAt: '2026-07-03T10:00:00Z',
    revokedAt: null,
    pdfUrl: 'https://example.com/cert.pdf',
    pdfObjectKey: 'cert.pdf',
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

    expect(fixture.nativeElement.textContent).toContain(
      'Loading certificate...'
    );
  });

  it('should show error state with retry', () => {
    certificatesService.setError(new Error('Network error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');

    const refetchSpy = certificatesService.refetchSpy;
    const retryButton = fixture.nativeElement.querySelector(
      'app-error-state button'
    );
    retryButton.click();

    expect(refetchSpy).toHaveBeenCalled();
  });

  it('should render certificate header as certificate number', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      certificate.certificateNumber
    );
    expect(fixture.nativeElement.textContent).not.toContain(certificate.title);
  });

  it('should render certificate fields', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(certificate.certificateNumber);
    expect(text).toContain(certificate.verificationCode);
    expect(text).toContain(certificate.participantNameSnapshot);
    expect(text).toContain(certificate.quizTitleSnapshot);
    expect(text).toContain(certificate.programTitleSnapshot);
    expect(text).toContain(certificate.organizationNameSnapshot);
    expect(text).toContain('92.5%');
    expect(text).toContain('Jul 3, 2026');
  });

  it('should show a dash when score is missing', () => {
    certificatesService.setData({ ...certificate, scoreSnapshot: null });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Score');
    expect(text).toContain('—');
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

  it('should show empty state when certificate data is missing', () => {
    certificatesService.setEmpty();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Certificate not found');
    expect(text).toContain(
      'The requested certificate could not be loaded.'
    );
  });

  it('should provide download PDF and verify actions', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Download PDF');
    expect(text).toContain('Verify');
    expect(text).not.toContain('Back to My Certificates');
  });

  it('should open the PDF when Download PDF is clicked', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const openSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    const downloadButton = getButtonByText(fixture, 'Download PDF');
    downloadButton?.click();

    expect(openSpy).toHaveBeenCalledWith(certificate.pdfUrl, '_blank');
  });

  it('should navigate to public verification when Verify is clicked', () => {
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const verifyButton = getButtonByText(fixture, 'Verify');
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
