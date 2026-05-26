import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClerkService } from '../../core/auth/clerk.service';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CardComponent],
  template: `
    <section class="auth-shell">
      <div class="auth-copy">
        <p class="app-eyebrow">Skillmark auth</p>
        <h1 class="display-xl mt-3">
          Secure access for owners and participants.
        </h1>
        <p class="auth-lede">
          Clerk handles identity while Skillmark stores the local profile, roles, enrollments, attempts, and certificate records.
        </p>
        <div class="auth-proof-panel">
          <p class="micro-cap text-[var(--color-ink-mute)]">After sign in</p>
          <div class="auth-proof-row"><span>01</span><p>Sync a local user profile from Clerk identity.</p></div>
          <div class="auth-proof-row"><span>02</span><p>Attach session tokens to backend API requests.</p></div>
          <div class="auth-proof-row"><span>03</span><p>Resume owner or participant workflows safely.</p></div>
        </div>
      </div>

      <app-card>
        <div class="clerk-card-shell">
          @if (!clerk.isConfigured) {
            <h2 class="display-md">Clerk key required</h2>
            <p class="text-sm leading-6 text-[var(--color-ink-mute)]">
              Set <code>clerkPublishableKey</code> in <code>src/environments/environment.ts</code> to mount embedded Clerk {{ mode() }}.
            </p>
          } @else {
            @if (mounting()) {
              <div class="clerk-loading">
                <div class="clerk-loading-bar w-28"></div>
                <div class="clerk-loading-bar"></div>
                <div class="clerk-loading-bar"></div>
                <div class="clerk-loading-button"></div>
              </div>
            }
            @if (mountError()) {
              <div class="clerk-error">
                <h2 class="display-md">Clerk did not load</h2>
                <p class="text-sm leading-6 text-[var(--color-ink-mute)]">
                  {{ mountError() }}
                </p>
                <p class="text-sm leading-6 text-[var(--color-ink-mute)]">
                  Check that the publishable key in <code>src/environments/environment.ts</code> belongs to a Clerk app that allows this local origin.
                </p>
              </div>
            }
            <div #mount class="clerk-mount" [class.clerk-mount-hidden]="mounting() || !!mountError()"></div>
          }
        </div>
      </app-card>
    </section>
  `,
})
export class AuthPageComponent implements AfterViewInit, OnDestroy {
  readonly clerk = inject(ClerkService);
  private readonly route = inject(ActivatedRoute);
  readonly mode = computed<'sign-in' | 'sign-up'>(() => this.route.snapshot.routeConfig?.path === 'sign-up' ? 'sign-up' : 'sign-in');
  readonly mounting = signal(true);
  readonly mountError = signal<string | null>(null);
  @ViewChild('mount') mount?: ElementRef<HTMLDivElement>;

  async ngAfterViewInit(): Promise<void> {
    const node = this.mount?.nativeElement;
    if (!node || !this.clerk.isConfigured) {
      this.mounting.set(false);
      return;
    }
    try {
      if (this.mode() === 'sign-up') {
        await this.clerk.mountSignUp(node);
      } else {
        await this.clerk.mountSignIn(node);
      }
    } catch (error: unknown) {
      this.mountError.set(error instanceof Error ? error.message : this.clerk.loadError() ?? 'Unable to mount Clerk.');
    } finally {
      this.mounting.set(false);
    }
  }

  ngOnDestroy(): void {
    const node = this.mount?.nativeElement;
    if (!node) {
      return;
    }
    if (this.mode() === 'sign-up') {
      this.clerk.unmountSignUp(node);
    } else {
      this.clerk.unmountSignIn(node);
    }
  }
}
