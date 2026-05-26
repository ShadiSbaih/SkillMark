import { Injectable, computed, inject, signal } from '@angular/core';
import { UserApi } from '../api/users.api';
import { UserResponse } from '../models/api.model';
import { ClerkService } from './clerk.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly clerk = inject(ClerkService);
  private readonly users = inject(UserApi);
  private readonly synced = signal(false);

  readonly currentUser = signal<UserResponse | null>(null);
  readonly isSignedIn = computed(() => this.clerk.isSignedIn());

  async ensureSession(): Promise<boolean> {
    await this.clerk.load();
    if (!this.clerk.isConfigured) {
      this.currentUser.set(null);
      return false;
    }
    if (!this.clerk.isSignedIn()) {
      return false;
    }
    if (!this.synced()) {
      const user = this.clerk.user();
      try {
        this.currentUser.set(
          await this.users.sync({
            name: user?.fullName,
            email: user?.primaryEmailAddress?.emailAddress,
            avatarUrl: user?.imageUrl,
          }),
        );
        this.synced.set(true);
      } catch {
        this.synced.set(false);
        this.currentUser.set(null);
        return false;
      }
    }
    return true;
  }

  async refreshProfile(): Promise<UserResponse> {
    const user = await this.users.me();
    this.currentUser.set(user);
    return user;
  }

  signOut(): Promise<void> {
    this.synced.set(false);
    this.currentUser.set(null);
    return this.clerk.signOut();
  }
}
