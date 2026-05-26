import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { CertificatesApi } from '../../core/api/certificates.api';
import { VerificationPageComponent } from './verification-page.component';
import { ActivatedRoute } from '@angular/router';

describe('VerificationPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationPageComponent],
      providers: [
        provideRouter([]),
        provideTanStackQuery(new QueryClient()),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: CertificatesApi,
          useValue: {
            verify: () => Promise.resolve({}),
          },
        },
      ],
    }).compileComponents();
  });

  it('updates the active code and navigates to the public verification route', () => {
    const fixture = TestBed.createComponent(VerificationPageComponent);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.code = 'ABC123';

    fixture.componentInstance.go();

    expect(fixture.componentInstance.activeCode()).toBe('ABC123');
    expect(navigate).toHaveBeenCalledWith(['/verify', 'ABC123']);
  });
});
