import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { SyncUserRequest, UserResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly api = inject(ApiClient);

  me(): Promise<UserResponse> {
    return this.api.get<UserResponse>('/users/me');
  }

  updateMe(request: SyncUserRequest): Promise<UserResponse> {
    return this.api.patch<UserResponse>('/users/me', request);
  }

  sync(request?: SyncUserRequest): Promise<UserResponse> {
    return this.api.post<UserResponse>('/users/sync', request ?? {});
  }
}

