import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { LandingComponent } from './landing.component';
import { CertificatesService } from '../../services/certificates.service';

class FakeCertificatesService {
  verifyPublicCertificateQuery() {
    return {
      isPending: () => false,
      isError: () => false,
      data: () => null,
      error: () => null,
      refetch: vi.fn(),
    };
  }
}

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: CertificatesService, useValue: new FakeCertificatesService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the hero heading', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Train. Assess. Certify.');
  });

  it('should render auth links', () => {
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a');
    const hrefs = Array.from(links).map((link) => (link as HTMLAnchorElement).getAttribute('routerLink'));
    expect(hrefs).toContain('/sign-up');
    expect(hrefs).toContain('/sign-in');
  });

  it('should navigate to verify page when verification code is submitted', () => {
    fixture.detectChanges();
    component.verificationCode.set('A3FX9KL2MN8PQR7Z');
    component.verify();

    expect(router.navigate).toHaveBeenCalledWith(['/verify', 'A3FX9KL2MN8PQR7Z']);
  });

  it('should not navigate when verification code is empty', () => {
    fixture.detectChanges();
    component.verificationCode.set('   ');
    component.verify();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
