import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { ClerkService } from '../auth/clerk.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isBackendRequest = req.url.startsWith(environment.apiBaseUrl);
  const isPublic = req.url.includes('/public/');
  if (!isBackendRequest || isPublic) {
    return next(req);
  }

  const clerk = inject(ClerkService);
  return from(clerk.getToken()).pipe(
    switchMap((token) =>
      next(
        token
          ? req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            })
          : req,
      ),
    ),
  );
};

