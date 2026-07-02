import { computed, inject, Injectable } from '@angular/core';
import { ClerkService } from 'ngx-clerk';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly clerk = inject(ClerkService);

  readonly user = this.clerk.user;
  readonly isLoaded = this.clerk.isLoaded;
  readonly isSignedIn = this.clerk.isSignedIn;
  readonly userId = computed(() => this.clerk.user()?.id ?? null);

  async sessionToken(): Promise<string | null> {
    const session = this.clerk.session();
    if (!session) {
      return null;
    }
    return session.getToken();
  }
}
