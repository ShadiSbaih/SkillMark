import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { JoinComponent } from './join.component';
import { InvitationsService } from '../../services/invitations.service';
import { Invitation } from '../../core/models/invitation.model';

class FakeInvitationsService {
  readonly joinMutate = vi.fn(
    (
      _code: string,
      options?: {
        onSuccess?: (invitation: Invitation) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      this.isPending.set(true);
      Promise.resolve().then(() => {
        this.isPending.set(false);
        if (this.nextError) {
          options?.onError?.(this.nextError);
          this.nextError = null;
        } else {
          options?.onSuccess?.(this.nextInvitation);
        }
      });
    }
  );

  readonly isPending = signal(false);
  readonly previewCode = signal<string | null>(null);
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

  readonly previewQuery = {
    isPending: () => false,
    isError: () => false,
    data: () => this.nextInvitation,
  };
}

async function setupFixture(paramCode: string | null) {
  const invitationsService = new FakeInvitationsService();

  await TestBed.configureTestingModule({
    imports: [JoinComponent],
    providers: [
      provideQueryClient(new QueryClient()),
      { provide: InvitationsService, useValue: invitationsService },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of({ get: () => paramCode }),
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(JoinComponent);
  const component = fixture.componentInstance;
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate');

  return { fixture, component, invitationsService, router };
}

describe('JoinComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', async () => {
    const { fixture, component } = await setupFixture('JOIN-CODE');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should read the join code from the route', async () => {
    const { fixture, component } = await setupFixture('JOIN-CODE');
    fixture.detectChanges();
    expect(component.code()).toBe('JOIN-CODE');
  });

  it('should set preview code on the service', async () => {
    const { fixture, invitationsService } = await setupFixture('JOIN-CODE');
    fixture.detectChanges();
    expect(invitationsService.previewCode()).toBe('JOIN-CODE');
  });

  it('should accept invitation when the accept button is clicked', async () => {
    const { fixture, invitationsService } = await setupFixture('JOIN-CODE');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button'));
    button.triggerEventHandler('clicked', undefined);
    await fixture.whenStable();

    expect(invitationsService.joinMutate).toHaveBeenCalledWith(
      'JOIN-CODE',
      expect.any(Object)
    );
  });

  it('should navigate to the program learn page on success', async () => {
    const { fixture, router } = await setupFixture('JOIN-CODE');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button'));
    button.triggerEventHandler('clicked', undefined);
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith([
      '/programs',
      'program-1',
      'learn',
    ]);
  });

  it('should navigate to organizations when programId is absent', async () => {
    const { fixture, invitationsService, router } = await setupFixture('JOIN-CODE');
    invitationsService.nextInvitation = {
      ...invitationsService.nextInvitation,
      programId: '',
    };
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button'));
    button.triggerEventHandler('clicked', undefined);
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/organizations']);
  });

  it('should display an error message when joining fails', async () => {
    const { fixture, invitationsService } = await setupFixture('JOIN-CODE');
    invitationsService.nextError = new Error('Invitation expired');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button'));
    button.triggerEventHandler('clicked', undefined);
    await fixture.whenStable();

    expect(fixture.componentInstance.error()).toBe('Invitation expired');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not join');
    expect(fixture.nativeElement.textContent).toContain('Invitation expired');
  });

  it('should retry joining when the retry button is clicked', async () => {
    const { fixture, invitationsService } = await setupFixture('JOIN-CODE');
    invitationsService.nextError = new Error('Invitation expired');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('app-button'));
    button.triggerEventHandler('clicked', undefined);
    await fixture.whenStable();
    expect(invitationsService.joinMutate).toHaveBeenCalledTimes(1);

    invitationsService.nextError = null;
    const retryButton = fixture.debugElement.query(By.css('app-error-state app-button'));
    retryButton.triggerEventHandler('clicked', undefined);
    await fixture.whenStable();

    expect(invitationsService.joinMutate).toHaveBeenCalledTimes(2);
  });

  it('should show input form when no invitation code is provided', async () => {
    const { fixture, component } = await setupFixture(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Invitation code');
    expect(component.code()).toBeNull();
  });

  it('should join from input code', async () => {
    const { fixture, component, invitationsService, router } = await setupFixture(null);
    fixture.detectChanges();

    component.inputCode.set('TYPED-CODE');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(invitationsService.joinMutate).toHaveBeenCalledWith(
      'TYPED-CODE',
      expect.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith([
      '/programs',
      'program-1',
      'learn',
    ]);
  });
});
