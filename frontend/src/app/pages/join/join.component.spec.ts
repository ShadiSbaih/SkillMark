import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { JoinComponent } from './join.component';
import { InvitationsService } from '../../services/invitations.service';
import { Invitation } from '../../core/models/invitation.model';

class FakeInvitationsService {
  readonly joinMutate = vi.fn((_code: string, options?: { onSuccess?: (invitation: Invitation) => void; onError?: (error: Error) => void }) => {
    this.isPending.set(true);
    setTimeout(() => {
      this.isPending.set(false);
      if (this.nextError) {
        options?.onError?.(this.nextError);
        this.nextError = null;
      } else {
        options?.onSuccess?.(this.nextInvitation);
      }
    }, 0);
  });

  readonly isPending = signal(false);
  nextError: Error | null = null;
  nextInvitation: Invitation = {
    id: 'inv-1',
    organizationId: 'org-1',
    programId: 'program-1',
    code: 'JOIN-CODE',
    description: null,
    maxUses: 100,
    usedCount: 1,
    expiresAt: null,
    status: 'ACTIVE',
    disabledAt: null,
    createdAt: '2026-01-01T00:00:00Z',
  };

  readonly joinMutation = {
    isPending: () => this.isPending(),
    mutate: this.joinMutate,
  };
}

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;
  let invitationsService: FakeInvitationsService;
  let router: Router;

  beforeEach(async () => {
    invitationsService = new FakeInvitationsService();

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideQueryClient(new QueryClient()),
        { provide: InvitationsService, useValue: invitationsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => 'JOIN-CODE' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should read the join code from the route', () => {
    fixture.detectChanges();
    expect(component.code()).toBe('JOIN-CODE');
  });

  it('should call joinMutation with the route code on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(invitationsService.joinMutate).toHaveBeenCalledWith('JOIN-CODE', expect.any(Object));
  }));

  it('should navigate to the program learn page on success', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'learn']);
  }));

  it('should display an error message when joining fails', fakeAsync(() => {
    invitationsService.nextError = new Error('Invitation expired');
    fixture.detectChanges();
    tick();
    expect(component.error()).toBe('Invitation expired');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not join');
    expect(fixture.nativeElement.textContent).toContain('Invitation expired');
  }));

  it('should retry joining when the retry button is clicked', fakeAsync(() => {
    invitationsService.nextError = new Error('Invitation expired');
    fixture.detectChanges();
    tick();
    expect(invitationsService.joinMutate).toHaveBeenCalledTimes(1);

    invitationsService.nextError = null;
    component.retry();
    tick();
    expect(invitationsService.joinMutate).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalledWith(['/programs', 'program-1', 'learn']);
  }));

  it('should show loading state while joining is pending', fakeAsync(() => {
    invitationsService.isPending.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Joining program...');
  }));
});
