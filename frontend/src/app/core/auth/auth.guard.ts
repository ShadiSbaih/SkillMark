import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.loadUser();

  if (!auth.isSignedIn()) {
    void router.navigate(['/sign-in']);
    return false;
  }

  return true;
};
