import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyCertificatesComponent } from './my-certificates.component';
import { CertificatesService } from '../../services/certificates.service';
import {
  CertificateResponse,
  CertificateStatus,
} from '../../core/models/certificate.model';
import { PageResponse } from '../../core/api/api-response.model';

interface MyCertificatesQueryState {
  isPending: boolean;
  isError: boolean;
  data: PageResponse<CertificateResponse> | null;
  error: Error | null;
  refetch: (...args: unknown[]) => unknown;
}

class FakeCertificatesService {
  readonly myCertificatesParams = signal({ page: 0, size: 10 });

  private queryState = signal<MyCertificatesQueryState>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn(),
  });

  readonly myCertificatesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this.queryState().refetch,
  };

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

  setData(data: PageResponse<CertificateResponse>) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: vi.fn(),
    });
  }
}

describe('MyCertificatesComponent', () => {
  let component: MyCertificatesComponent;
  let fixture: ComponentFixture<MyCertificatesComponent>;
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

  const pageResponse: PageResponse<CertificateResponse> = {
    items: [certificate],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    certificatesService = new FakeCertificatesService();

    await TestBed.configureTestingModule({
      imports: [MyCertificatesComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: CertificatesService, useValue: certificatesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCertificatesComponent);
    component = fixture.componentInstance;
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

    expect(fixture.nativeElement.textContent).toContain('Loading certificates...');
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

  it('should show empty state when there are no certificates', () => {
    certificatesService.setData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No certificates');
  });

  it('should render the list of certificates', () => {
    certificatesService.setData(pageResponse);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(certificate.title);
    expect(text).toContain(certificate.certificateNumber);
    expect(text).toContain(certificate.status);
    expect(text).toContain(certificate.quizTitleSnapshot);
    expect(text).toContain(certificate.programTitleSnapshot);
    expect(text).toContain(certificate.organizationNameSnapshot);
    expect(text).toContain('Issued Jul 3, 2026');
  });

  it('should navigate to certificate detail when View is clicked', () => {
    certificatesService.setData(pageResponse);
    fixture.detectChanges();

    const viewButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button')
    ).find((button) => button.textContent?.trim() === 'View');

    viewButton?.click();

    expect(router.navigate).toHaveBeenCalledWith(['/certificates', certificate.id]);
  });

  it('should disable Previous on the first page and enable Next when another page exists', () => {
    certificatesService.setData({
      items: [certificate],
      page: 0,
      size: 10,
      totalElements: 3,
      totalPages: 3,
    });
    fixture.detectChanges();

    const previousButton = getButtonByText(fixture, 'Previous');
    const nextButton = getButtonByText(fixture, 'Next');

    expect(previousButton?.disabled).toBe(true);
    expect(nextButton?.disabled).toBe(false);

    nextButton?.click();

    expect(certificatesService.myCertificatesParams()).toEqual({ page: 1, size: 10 });

    previousButton?.click();

    expect(certificatesService.myCertificatesParams()).toEqual({ page: 0, size: 10 });
  });

  function getButtonByText(
    fixtureRef: ComponentFixture<MyCertificatesComponent>,
    text: string
  ): HTMLButtonElement | undefined {
    return Array.from<HTMLButtonElement>(
      fixtureRef.nativeElement.querySelectorAll('button')
    ).find((button) => button.textContent?.trim() === text);
  }
});
