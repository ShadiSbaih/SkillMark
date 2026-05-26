import { Injectable, computed, signal } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';
import { environment } from '../../../environments/environment';

type ClerkUserSnapshot = {
  id?: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string } | null;
  imageUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class ClerkService {
  private clerk?: Clerk;
  private loadPromise?: Promise<void>;

  readonly loaded = signal(false);
  readonly user = signal<ClerkUserSnapshot | null>(null);
  readonly isSignedIn = computed(() => !!this.user());
  readonly isConfigured = !!environment.clerkPublishableKey;

  async load(): Promise<void> {
    if (!this.isConfigured || typeof window === 'undefined') {
      this.loaded.set(true);
      return;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }
    this.clerk = new Clerk(environment.clerkPublishableKey);
    this.loadPromise = this.clerk.load({
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      afterSignOutUrl: '/',
    }).then(() => {
      this.refreshState();
      this.clerk?.addListener(() => this.refreshState());
      this.loaded.set(true);
    });
    return this.loadPromise;
  }

  async getToken(): Promise<string | null> {
    await this.load();
    return (await this.clerk?.session?.getToken()) ?? null;
  }

  async mountSignIn(node: HTMLDivElement): Promise<void> {
    await this.load();
    if (!this.clerk) {
      return;
    }
    this.clerk.mountSignIn(node, {
      routing: 'path',
      path: '/sign-in',
      signUpUrl: '/sign-up',
      fallbackRedirectUrl: '/dashboard',
    });
  }

  async mountSignUp(node: HTMLDivElement): Promise<void> {
    await this.load();
    if (!this.clerk) {
      return;
    }
    this.clerk.mountSignUp(node, {
      routing: 'path',
      path: '/sign-up',
      signInUrl: '/sign-in',
      fallbackRedirectUrl: '/dashboard',
    });
  }

  unmountSignIn(node: HTMLDivElement): void {
    this.clerk?.unmountSignIn(node);
  }

  unmountSignUp(node: HTMLDivElement): void {
    this.clerk?.unmountSignUp(node);
  }

  async signOut(): Promise<void> {
    await this.load();
    await this.clerk?.signOut({ redirectUrl: '/' });
  }

  private refreshState(): void {
    const clerkUser = this.clerk?.user;
    this.user.set(
      clerkUser
        ? {
            id: clerkUser.id,
            fullName: clerkUser.fullName,
            primaryEmailAddress: clerkUser.primaryEmailAddress,
            imageUrl: clerkUser.imageUrl,
          }
        : null,
    );
  }
}
