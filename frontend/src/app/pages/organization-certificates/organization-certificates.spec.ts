import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationCertificates } from './organization-certificates';
import { OrganizationsService } from '../../services/organizations.service';
import { CertificatesService } from '../../services/certificates.service';
import { OrganizationResponse } from '../../core/models/organization.model';
import { CertificateResponse } from '../../core/models/certificate.model';
import { PageResponse } from '../../core/api/api-response.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: T | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

function createQueryState<T>(): QueryState<T> {
  return {
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: vi.fn(),
  };
}

class FakeOrganizationsService {
  private readonly queryState = signal<QueryState<OrganizationResponse>>(
    createQueryState<OrganizationResponse>()
  );

  getOrganizationQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({
      ...createQueryState<OrganizationResponse>(),
      isPending: true,
      refetch: this.queryState().refetch,
    });
  }

  setData(data: OrganizationResponse) {
    this.queryState.set({
      ...createQueryState<OrganizationResponse>(),
      data,
      refetch: this.queryState().refetch,
    });
  }
}

class FakeCertificatesService {
  private readonly queryState = signal<QueryState<PageResponse<CertificateResponse>>>(
    createQueryState<PageResponse<CertificateResponse>>()
  );

  organizationCertificatesQuery() {
    return {
      isPending: () => this.queryState().isPending,
      isError: () => this.queryState().isError,
      data: () => this.queryState().data,
      error: () => this.queryState().error,
      refetch: this.queryState().refetch,
    };
  }

  setPending() {
    this.queryState.set({
      ...createQueryState<PageResponse<CertificateResponse>>(),
      isPending: true,
      refetch: this.queryState().refetch,
    });
  }

  setData(data: PageResponse<CertificateResponse>) {
    this.queryState.set({
      ...createQueryState<PageResponse<CertificateResponse>>(),
      data,
      refetch: this.queryState().refetch,
    });
  }
}

describe('OrganizationCertificates', () => {
  let component: OrganizationCertificates;
  let fixture: ComponentFixture<OrganizationCertificates>;
  let organizationsService: FakeOrganizationsService;
  let certificatesService: FakeCertificatesService;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    slug: 'acme-inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    createdBy: 'Owner User',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

  const certificate: CertificateResponse = {
    id: 'cert-1',
    certificateNumber: 'CERT-0001',
    verificationCode: 'abc123',
    organizationId: 'org-1',
    programId: 'prog-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptId: 'attempt-1',
    title: 'Certificate of Completion',
    participantNameSnapshot: 'John Doe',
    quizTitleSnapshot: 'Intro Quiz',
    programTitleSnapshot: 'Intro Program',
    organizationNameSnapshot: 'Acme Inc',
    status: 'ACTIVE',
    issuedAt: '2026-07-03T10:00:00Z',
    revokedAt: null,
    pdfUrl: 'https://example.com/cert.pdf',
    pdfObjectKey: null,
    qrCodeUrl: null,
    qrCodeObjectKey: null,
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();
    certificatesService = new FakeCertificatesService();

    await TestBed.configureTestingModule({
      imports: [OrganizationCertificates],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: CertificatesService, useValue: certificatesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'org-1' }),
            snapshot: { paramMap: { get: () => 'org-1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationCertificates);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setPending();
    certificatesService.setPending();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading state while queries are pending', () => {
    organizationsService.setPending();
    certificatesService.setPending();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading certificates...');
  });

  it('should display certificates when data resolves', () => {
    organizationsService.setData(organization);
    certificatesService.setData({
      items: [certificate],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Inc');
    expect(text).toContain('Certificates');
    expect(text).toContain('CERT-0001');
    expect(text).toContain('John Doe');
    expect(text).toContain('Intro Program');
    expect(text).toContain('Download');
  });

  it('should update page signal when goToPage is called', () => {
    organizationsService.setData(organization);
    certificatesService.setData({
      items: [certificate],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    component.goToPage(1);
    expect(component.page()).toBe(1);
  });
});
