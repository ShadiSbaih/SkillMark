import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { ApiClientService } from '../api/api-client.service';
import { UserResponse } from '../models/user.model';

export interface AuthUserResponse extends UserResponse {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'STUDENT';
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiClientService);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUserResponse | null>(null);
  private readonly _isLoaded = signal(false);

  readonly user = this._user.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();
  readonly isSignedIn = computed(() => this._user() !== null);
  readonly userId = computed(() => this._user()?.id ?? null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isStudent = computed(() => this._user()?.role === 'STUDENT');

  async loadUser(): Promise<AuthUserResponse | null> {
    try {
      const user = await lastValueFrom(this.api.get<AuthUserResponse>('auth/me'));
      this._user.set(user);
      return user;
    } catch {
      this._user.set(null);
      return null;
    } finally {
      this._isLoaded.set(true);
    }
  }

  async login(request: LoginRequest): Promise<AuthUserResponse> {
    await lastValueFrom(this.api.post<void>('auth/login', request));
    const user = await this.loadUser();
    if (!user) {
      throw new Error('Login succeeded but user could not be loaded');
    }
    return user;
  }

  async register(request: RegisterRequest): Promise<void> {
    await lastValueFrom(this.api.post<void>('auth/register', request));
  }




  async logout(): Promise<void> {
    try {
      await lastValueFrom(this.api.post<void>('auth/logout'));
    } finally {
      this._user.set(null);
      void this.router.navigate(['/sign-in']);
    }
  }
}
