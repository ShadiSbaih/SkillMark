import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
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
  refetch: ReturnType<typeof vi.fn>;
}

class FakeCertificatesService {
  readonly myCertificatesParams = signal({ page: 0, size: 10 });
  private readonly _refetchSpy = vi.fn();
  private queryState = signal<MyCertificatesQueryState>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: this._refetchSpy,
  });

  readonly myCertificatesQuery = {
    isPending: () => this.queryState().isPending,
    isError: () => this.queryState().isError,
    data: () => this.queryState().data,
    error: () => this.queryState().error,
    refetch: this._refetchSpy,
  };

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

  setData(data: PageResponse<CertificateResponse>) {
    this.queryState.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this._refetchSpy,
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
    scoreSnapshot: 92.5,
    status,
    issuedAt: '2026-07-03T10:00:00Z',
    revokedAt: null,
    pdfUrl: 'https://example.com/cert.pdf',
    pdfObjectKey: 'cert.pdf',
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

    expect(fixture.nativeElement.textContent).toContain(
      'Loading certificates...'
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

  it('should render the page header', () => {
    certificatesService.setData(pageResponse);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('My certificates');
  });

  it('should render the certificates table', () => {
    certificatesService.setData(pageResponse);
    fixture.detectChanges();

    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('th')
    ).map((th) => (th as HTMLElement).textContent?.trim());

    expect(headers).toEqual([
      'Number',
      'Program',
      'Quiz',
      'Score',
      'Status',
      'PDF',
    ]);
  });

  it('should render certificate values and link the number to detail', () => {
    certificatesService.setData(pageResponse);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(certificate.certificateNumber);
    expect(text).toContain(certificate.programTitleSnapshot);
    expect(text).toContain(certificate.quizTitleSnapshot);
    expect(text).toContain('92.5%');
    expect(text).toContain(certificate.status);
    expect(text).toContain('PDF');

    const link = fixture.nativeElement.querySelector('a.link');
    expect(link?.getAttribute('href')).toBe(`/certificates/${certificate.id}`);
    expect(link?.textContent?.trim()).toBe(certificate.certificateNumber);
  });

  it('should show a dash when score is missing', () => {
    certificatesService.setData({
      ...pageResponse,
      items: [{ ...certificate, scoreSnapshot: null }],
    });
    fixture.detectChanges();

    const scoreCell = fixture.nativeElement.querySelectorAll('td')[3];
    expect(scoreCell.textContent).toContain('—');
  });

  it('should open the PDF when the PDF button is clicked', () => {
    certificatesService.setData(pageResponse);
    fixture.detectChanges();

    const openSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    const pdfButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button')
    ).find((button) => button.textContent?.trim() === 'PDF');
    pdfButton?.click();

    expect(openSpy).toHaveBeenCalledWith(certificate.pdfUrl, '_blank');
  });

  it('should navigate to the next and previous pages', () => {
    certificatesService.setData({
      items: [certificate],
      page: 0,
      size: 10,
      totalElements: 3,
      totalPages: 3,
    });
    fixture.detectChanges();

    const nextButton = getButtonByText(fixture, 'Next');
    nextButton?.click();
    fixture.detectChanges();

    expect(certificatesService.myCertificatesParams()).toEqual({
      page: 1,
      size: 10,
    });

    const previousButton = getButtonByText(fixture, 'Previous');
    previousButton?.click();
    fixture.detectChanges();

    expect(certificatesService.myCertificatesParams()).toEqual({
      page: 0,
      size: 10,
    });
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
