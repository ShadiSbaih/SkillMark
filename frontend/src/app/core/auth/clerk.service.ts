import { Injectable, computed, signal } from '@angular/core';
import type { Clerk } from '@clerk/clerk-js';
import { environment } from '../../../environments/environment';

type ClerkUserSnapshot = {
  id?: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string } | null;
  imageUrl?: string | null;
};

type ClerkLoadOptions = NonNullable<Parameters<Clerk['load']>[0]>;
type ClerkUiConstructor = NonNullable<NonNullable<ClerkLoadOptions['ui']>['ClerkUI']>;

declare global {
  interface Window {
    __internal_ClerkUICtor?: ClerkUiConstructor;
  }
}

@Injectable({ providedIn: 'root' })
export class ClerkService {
  private clerk?: Clerk;
  private loadPromise?: Promise<void>;
  private uiScriptPromise?: Promise<void>;
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
          ui: { ClerkUI: window.__internal_ClerkUICtor },
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

    this.scriptPromise = this.ensureClerkUiScript().then(() => new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-skillmark-clerk-js]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Clerk browser bundle.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `${this.clerkFrontendApiUrl()}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`;
      script.dataset['skillmarkClerkJs'] = 'true';
      script.setAttribute('data-clerk-publishable-key', environment.clerkPublishableKey);
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load Clerk browser bundle.')), { once: true });
      document.head.appendChild(script);
    }));

    return this.scriptPromise;
  }

  private ensureClerkUiScript(): Promise<void> {
    if (window.__internal_ClerkUICtor) {
      return Promise.resolve();
    }
    if (this.uiScriptPromise) {
      return this.uiScriptPromise;
    }

    this.uiScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-skillmark-clerk-ui]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Clerk UI bundle.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `${this.clerkFrontendApiUrl()}/npm/@clerk/ui@1/dist/ui.browser.js`;
      script.dataset['skillmarkClerkUi'] = 'true';
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load Clerk UI bundle.')), { once: true });
      document.head.appendChild(script);
    });

    return this.uiScriptPromise;
  }

  private clerkFrontendApiUrl(): string {
    const encodedDomain = environment.clerkPublishableKey.split('_')[2];
    if (!encodedDomain) {
      throw new Error('Invalid Clerk publishable key.');
    }
    return `https://${atob(encodedDomain).slice(0, -1)}`;
  }
}
