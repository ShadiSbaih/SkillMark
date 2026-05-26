import { Injectable, computed, signal } from '@angular/core';
import type { Clerk } from '@clerk/clerk-js';
import { environment } from '../../../environments/environment';

type ClerkUserSnapshot = {
  id?: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string } | null;
  imageUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class ClerkService {
  private static readonly clerkJsUrl = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6.12.1/dist/clerk.browser.js';

  private clerk?: Clerk;
  private loadPromise?: Promise<void>;
  private scriptPromise?: Promise<void>;

  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);
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
    this.loadPromise = this.ensureClerkScript()
      .then(async () => {
        this.clerk = window.Clerk;
        if (!this.clerk) {
          throw new Error('Clerk browser bundle loaded, but window.Clerk was not initialized.');
        }
        await this.clerk.load({
          signInUrl: '/sign-in',
          signUpUrl: '/sign-up',
          afterSignOutUrl: '/',
        });
        this.refreshState();
        this.clerk.addListener(() => this.refreshState());
        this.loaded.set(true);
        this.loadError.set(null);
      })
      .catch((error: unknown) => {
        this.loaded.set(true);
        this.loadError.set(error instanceof Error ? error.message : 'Clerk could not be loaded.');
        throw error;
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

  private ensureClerkScript(): Promise<void> {
    if (window.Clerk) {
      return Promise.resolve();
    }
    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    window.__clerk_publishable_key = environment.clerkPublishableKey;

    this.scriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-skillmark-clerk-js]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Clerk browser bundle.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = ClerkService.clerkJsUrl;
      script.dataset['skillmarkClerkJs'] = 'true';
      script.setAttribute('data-clerk-publishable-key', environment.clerkPublishableKey);
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load Clerk browser bundle.')), { once: true });
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }
}
