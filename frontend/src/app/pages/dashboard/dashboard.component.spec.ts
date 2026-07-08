import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { OrganizationsService } from '../../services/organizations.service';
import { CertificatesService } from '../../services/certificates.service';
import { AttemptsService } from '../../services/attempts.service';
import { OrganizationResponse } from '../../core/models/organization.model';
import { CertificateResponse } from '../../core/models/certificate.model';
import { AttemptResponse } from '../../core/models/attempt.model';
import { PageResponse } from '../../core/api/api-response.model';

interface QueryState<T> {
  isPending: boolean;
  isError: boolean;
  data: PageResponse<T> | null;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

class FakeQuery<T> {
  private readonly _refetchSpy = vi.fn();
  private readonly _state = signal<QueryState<T>>({
    isPending: false,
    isError: false,
    data: null,
    error: null,
    refetch: this._refetchSpy,
  });

  readonly query = {
    isPending: () => this._state().isPending,
    isError: () => this._state().isError,
    data: () => this._state().data,
    error: () => this._state().error,
    refetch: this._refetchSpy,
  };

  get refetchSpy() {
    return this._refetchSpy;
  }

  setPending() {
    this._state.set({
      isPending: true,
      isError: false,
      data: null,
      error: null,
      refetch: this._refetchSpy,
    });
  }

  setError(error: Error) {
    this._state.set({
      isPending: false,
      isError: true,
      data: null,
      error,
      refetch: this._refetchSpy,
    });
  }

  setData(data: PageResponse<T>) {
    this._state.set({
      isPending: false,
      isError: false,
      data,
      error: null,
      refetch: this._refetchSpy,
    });
  }
}

class FakeOrganizationsService {
  private readonly _organizationsQuery = new FakeQuery<OrganizationResponse>();

  readonly organizationsQuery = this._organizationsQuery.query;

  get organizationsRefetchSpy() {
    return this._organizationsQuery.refetchSpy;
  }

  setOrganizationsPending() {
    this._organizationsQuery.setPending();
  }

  setOrganizationsError(error: Error) {
    this._organizationsQuery.setError(error);
  }

  setOrganizationsData(data: PageResponse<OrganizationResponse>) {
    this._organizationsQuery.setData(data);
  }
}

class FakeCertificatesService {
  private readonly _myCertificatesQuery = new FakeQuery<CertificateResponse>();

  readonly myCertificatesQuery = this._myCertificatesQuery.query;

  get certificatesRefetchSpy() {
    return this._myCertificatesQuery.refetchSpy;
  }

  setCertificatesPending() {
    this._myCertificatesQuery.setPending();
  }

  setCertificatesError(error: Error) {
    this._myCertificatesQuery.setError(error);
  }

  setCertificatesData(data: PageResponse<CertificateResponse>) {
    this._myCertificatesQuery.setData(data);
  }
}

class FakeAttemptsService {
  private readonly _myAttemptsQuery = new FakeQuery<AttemptResponse>();

  readonly myAttemptsQuery = this._myAttemptsQuery.query;

  get attemptsRefetchSpy() {
    return this._myAttemptsQuery.refetchSpy;
  }

  setAttemptsPending() {
    this._myAttemptsQuery.setPending();
  }

  setAttemptsError(error: Error) {
    this._myAttemptsQuery.setError(error);
  }

  setAttemptsData(data: PageResponse<AttemptResponse>) {
    this._myAttemptsQuery.setData(data);
  }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let organizationsService: FakeOrganizationsService;
  let certificatesService: FakeCertificatesService;
  let attemptsService: FakeAttemptsService;

  const organization: OrganizationResponse = {
    id: 'org-1',
    name: 'Acme Inc',
    description: 'A sample organization',
    logoUrl: null,
    ownerId: 'user-1',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00Z',
  };

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
    status: 'ACTIVE',
    issuedAt: '2026-07-03T10:00:00Z',
    revokedAt: null,
    pdfUrl: null,
    pdfObjectKey: null,
    qrCodeUrl: null,
    qrCodeObjectKey: null,
  };

  const attempt: AttemptResponse = {
    attemptId: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    attemptNumber: 1,
    expiresAt: '2026-07-04T12:00:00Z',
    totalPoints: 10,
    earnedPoints: 8,
    scorePercentage: 80,
    passed: true,
    status: 'SUBMITTED',
    startedAt: '2026-07-04T10:00:00Z',
    submittedAt: '2026-07-04T11:00:00Z',
    certificateIssued: true,
    certificateId: 'cert-1',
  };

  beforeEach(async () => {
    organizationsService = new FakeOrganizationsService();
    certificatesService = new FakeCertificatesService();
    attemptsService = new FakeAttemptsService();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: OrganizationsService, useValue: organizationsService },
        { provide: CertificatesService, useValue: certificatesService },
        { provide: AttemptsService, useValue: attemptsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationsService.setOrganizationsPending();
    certificatesService.setCertificatesPending();
    attemptsService.setAttemptsPending();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show loading state while all initial queries are pending', () => {
    organizationsService.setOrganizationsPending();
    certificatesService.setCertificatesPending();
    attemptsService.setAttemptsPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading dashboard...');
    expect(fixture.nativeElement.textContent).not.toContain('Organizations');
  });

  it('should not show loading state once at least one query has resolved', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    certificatesService.setCertificatesPending();
    attemptsService.setAttemptsPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain(
      'Loading dashboard...'
    );
  });

  it('should show error state when any query fails', () => {
    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesError(new Error('Network error'));
    attemptsService.setAttemptsPending();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
    expect(fixture.nativeElement.textContent).toContain('Network error');
  });

  it('should refetch all queries when retry is clicked', () => {
    organizationsService.setOrganizationsError(new Error('Org error'));
    certificatesService.setCertificatesPending();
    attemptsService.setAttemptsPending();
    fixture.detectChanges();

    const retryButton =
      fixture.nativeElement.querySelector('app-error-state button');
    retryButton.click();

    expect(organizationsService.organizationsRefetchSpy).toHaveBeenCalled();
    expect(certificatesService.certificatesRefetchSpy).toHaveBeenCalled();
    expect(attemptsService.attemptsRefetchSpy).toHaveBeenCalled();
  });

  it('should render metric cards with derived stats', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    certificatesService.setCertificatesData({
      items: [certificate],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    attemptsService.setAttemptsData({
      items: [attempt],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Organizations');
    expect(text).toContain('Certificates');
    expect(text).toContain('Attempts');
    expect(text).toContain('Pass rate');
    expect(text).toContain('100%');
  });

  it('should compute pass rate as 0 when there are no submitted attempts', () => {
    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    attemptsService.setAttemptsData({
      items: [
        {
          ...attempt,
          status: 'IN_PROGRESS' as const,
          submittedAt: null,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pass rate0%');
  });

  it('should render organizations list with max 5 items', () => {
    const items: OrganizationResponse[] = Array.from({ length: 7 }, (_, i) => ({
      ...organization,
      id: `org-${i + 1}`,
      name: `Organization ${i + 1}`,
    }));

    organizationsService.setOrganizationsData({
      items,
      page: 0,
      size: 10,
      totalElements: 7,
      totalPages: 1,
    });
    certificatesService.setCertificatesData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    attemptsService.setAttemptsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '.dashboard-list li'
    );
    expect(rows.length).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Organization 1');
    expect(fixture.nativeElement.textContent).toContain('Organization 5');
    expect(fixture.nativeElement.textContent).not.toContain('Organization 6');
  });

  it('should link organization rows to organization detail', () => {
    organizationsService.setOrganizationsData({
      items: [organization],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    certificatesService.setCertificatesData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    attemptsService.setAttemptsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const link = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    ).find((a) => a.textContent?.includes(organization.name));
    expect(link?.getAttribute('href')).toBe('/organizations/org-1');
  });

  it('should render certificates list with max 5 items', () => {
    const items: CertificateResponse[] = Array.from({ length: 6 }, (_, i) => ({
      ...certificate,
      id: `cert-${i + 1}`,
      title: `Certificate ${i + 1}`,
    }));

    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesData({
      items,
      page: 0,
      size: 10,
      totalElements: 6,
      totalPages: 1,
    });
    attemptsService.setAttemptsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '.dashboard-list li'
    );
    expect(rows.length).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Certificate 1');
    expect(fixture.nativeElement.textContent).toContain('Certificate 5');
    expect(fixture.nativeElement.textContent).not.toContain('Certificate 6');
  });

  it('should link certificate rows to certificate detail', () => {
    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesData({
      items: [certificate],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    attemptsService.setAttemptsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const link = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    ).find((a) => a.textContent?.includes(certificate.title));
    expect(link?.getAttribute('href')).toBe('/certificates/cert-1');
  });

  it('should render attempts table with max 5 rows', () => {
    const items: AttemptResponse[] = Array.from({ length: 6 }, (_, i) => ({
      ...attempt,
      attemptId: `attempt-${i + 1}`,
      scorePercentage: 50 + i * 5,
      passed: i < 3,
    }));

    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    attemptsService.setAttemptsData({
      items,
      page: 0,
      size: 10,
      totalElements: 6,
      totalPages: 1,
    });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('attempt-1');
    expect(fixture.nativeElement.textContent).toContain('attempt-5');
    expect(fixture.nativeElement.textContent).not.toContain('attempt-6');
  });

  it('should show empty states for all sections when data is empty', () => {
    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    attemptsService.setAttemptsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No organizations');
    expect(text).toContain('No certificates');
    expect(text).toContain('No attempts');
  });

  it('should include links to all view-all pages', () => {
    organizationsService.setOrganizationsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    certificatesService.setCertificatesData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    attemptsService.setAttemptsData({
      items: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const links = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a')
    );
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/organizations');
    expect(hrefs).toContain('/my-certificates');
    expect(hrefs).toContain('/my-attempts');
    expect(hrefs).toContain('/organizations/new');
  });
});
