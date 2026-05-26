import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClerkService } from '../../core/auth/clerk.service';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterLink, CardComponent],
  template: `
    <section class="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <p class="app-eyebrow">Skillmark auth</p>
        <h1 class="display-xl mt-3">
          Secure access for owners and participants.
        </h1>
        <p class="mt-5 max-w-xl text-base leading-7 text-[var(--color-ink-secondary)]">
          Clerk handles identity while Skillmark stores the local profile, roles, enrollments, attempts, and certificate records.
        </p>
      </div>

      <app-card>
        @if (!clerk.isConfigured) {
          <div class="space-y-3">
            <h2 class="display-md">Clerk key required</h2>
            <p class="text-sm leading-6 text-[var(--color-ink-mute)]">
              Set <code>clerkPublishableKey</code> in <code>src/environments/environment.ts</code> to mount embedded Clerk {{ mode() }}.
            </p>
            <a routerLink="/dashboard" class="text-sm text-[var(--color-primary)]">Continue to local shell</a>
          </div>
        } @else {
          <div #mount></div>
        }
      </app-card>
    </section>
  `,
})
export class AuthPageComponent implements AfterViewInit, OnDestroy {
  private readonly mountRef = inject(ElementRef);
  readonly clerk = inject(ClerkService);
  private readonly route = inject(ActivatedRoute);
  readonly mode = computed<'sign-in' | 'sign-up'>(() => this.route.snapshot.routeConfig?.path === 'sign-up' ? 'sign-up' : 'sign-in');
  @ViewChild('mount') mount?: ElementRef<HTMLDivElement>;

  async ngAfterViewInit(): Promise<void> {
    const node = this.mount?.nativeElement;
    if (!node || !this.clerk.isConfigured) {
      return;
    }
    if (this.mode() === 'sign-up') {
      await this.clerk.mountSignUp(node);
    } else {
      await this.clerk.mountSignIn(node);
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
