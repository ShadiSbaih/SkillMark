import { Injectable, inject } from '@angular/core';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ApiClientService } from '../core/api/api-client.service';
import { UpdateUserProfileRequest, UserResponse } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiClientService);
  private readonly queryClient = inject(QueryClient);

  readonly meQuery = injectQuery(() => ({
    queryKey: ['users', 'me'] as const,
    queryFn: () => lastValueFrom(this.api.get<UserResponse>('users/me')),
  }));

  readonly updateMeMutation = injectMutation(() => ({
    mutationFn: (request: Partial<UpdateUserProfileRequest>) =>
      lastValueFrom(this.api.patch<UserResponse>('users/me', request)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  }));
}
