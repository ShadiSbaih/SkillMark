import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Guards admin-only routes. Assumes authGuard has already loaded the user.
 * Redirects unauthenticated users to /sign-in and non-admins to /my-enrollments.
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.loadUser();

  if (!auth.isSignedIn()) {
    void router.navigate(['/sign-in']);
    return false;
  }

  if (!auth.isAdmin()) {
    void router.navigate(['/my-enrollments']);
    return false;
  }

  return true;
};
