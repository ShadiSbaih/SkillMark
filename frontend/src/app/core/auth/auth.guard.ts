import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';

export const authGuard: CanActivateFn = () => {
  const clerk = inject(ClerkService);
  const router = inject(Router);

  if (!clerk.isSignedIn()) {
    void router.navigate(['/sign-in']);
    return false;
  }

  return true;
};
