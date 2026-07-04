import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { VerifyCertificateComponent } from './verify-certificate.component';
import { CertificatesService } from '../../services/certificates.service';
import {
  CertificateStatus,
  PublicCertificateVerificationResponse,
} from '../../core/models/certificate.model';

interface VerifyQueryState {
  isPending: boolean;
  isError: boolean;
  data: PublicCertificateVerificationResponse | null;
  error: Error | null;
  refetch: Mock<() => void>;
}

class FakeCertificatesService {
  private queryState = signal<VerifyQueryState>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn<() => void>(() => {}),
  });

  verifyPublicCertificateQuery(_verificationCode: () => string | null) {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: () => this.queryState().refetch(),
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
      refetch: vi.fn<() => void>(() => {}),
    });
  }

  setError(error: Error) {
    this.queryState.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: vi.fn<() => void>(() => {}),
    });
  }

  setData(data: PublicCertificateVerificationResponse) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn<() => void>(() => {}),
    });
  }
}

function createActivatedRouteStub(code: string | null = null): ActivatedRoute {
  return {
    snapshot: {
      paramMap: {
        get: vi.fn().mockImplementation((key: string) =>
          key === 'verificationCode' ? code : null
        ),
      },
    },
  } as unknown as ActivatedRoute;
}

describe('VerifyCertificateComponent', () => {
  let component: VerifyCertificateComponent;
  let fixture: ComponentFixture<VerifyCertificateComponent>;
  let certificatesService: FakeCertificatesService;
  let router: Router;

  const status: CertificateStatus = 'ACTIVE';

  const certificate: PublicCertificateVerificationResponse = {
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

  async function setup(code: string | null = null) {
    certificatesService = new FakeCertificatesService();

    await TestBed.configureTestingModule({
      imports: [VerifyCertificateComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: CertificatesService, useValue: certificatesService },
        { provide: ActivatedRoute, useValue: createActivatedRouteStub(code) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyCertificateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  }

  it('should create', async () => {
    await setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show input form and verify button when no route code is provided', async () => {
    await setup();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[name="code"]');
    const button = fixture.nativeElement.querySelector('app-button');

    expect(input).toBeTruthy();
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Verify');
  });

  it('should update inputCode when the input value changes', async () => {
    await setup();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[name="code"]') as HTMLInputElement;
    input.value = 'ABC123';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.inputCode()).toBe('ABC123');
  });

  it('should set submittedCode and navigate when verify is clicked', async () => {
    await setup();
    fixture.detectChanges();

    component.inputCode.set('ABC123');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(component.submittedCode()).toBe('ABC123');
    expect(router.navigate).toHaveBeenCalledWith(['/verify', 'ABC123'], {
      replaceUrl: true,
    });
  });

  it('should auto-trigger public verify query when route param is present', async () => {
    await setup('XYZ789');
    certificatesService.setPending();
    fixture.detectChanges();

    expect(component.inputCode()).toBe('XYZ789');
    expect(component.submittedCode()).toBe('XYZ789');
    expect(component.hasCode()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Verifying certificate...');
  });

  it('should render result card when query succeeds', async () => {
    await setup();
    certificatesService.setData(certificate);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(certificate.certificateNumber);
    expect(text).toContain(certificate.participantName);
    expect(text).toContain(certificate.quizTitle);
    expect(text).toContain(certificate.programTitle);
    expect(text).toContain(certificate.organizationName);
    expect(text).toContain(certificate.status);
    expect(text).toContain('Jul 3, 2026');
  });

  it('should show revoked information when the certificate is revoked', async () => {
    await setup();
    certificatesService.setData({
      ...certificate,
      status: 'REVOKED',
      isRevoked: true,
      revokedAt: '2026-07-04T12:00:00Z',
      revokeReason: 'Policy violation',
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('REVOKED');
    expect(text).toContain('Revoked');
    expect(text).toContain('Jul 4, 2026');
    expect(text).toContain('Reason: Policy violation');
  });

  it('should render error state when query errors', async () => {
    await setup();
    certificatesService.setError(new Error('Network error'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Failed to verify certificate');
    expect(text).toContain('Network error');
  });

  it('should call query refetch when retry is clicked', async () => {
    await setup();
    certificatesService.setError(new Error('Network error'));
    fixture.detectChanges();

    const refetchSpy = certificatesService.refetchSpy;
    const retryButton = fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(refetchSpy).toHaveBeenCalled();
  });
});
